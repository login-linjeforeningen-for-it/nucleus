import AsyncStorage from '@react-native-async-storage/async-storage'
import config from "@/constants"
import store from "@redux/store"

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE"
    body?: object
    requiresAuth?: boolean
    includeAiSession?: boolean
}

export type NativeModelMetrics = {
    conversationId: string | null
    status: "idle" | "preparing" | "generating" | "error"
    currentTokens: number
    maxTokens: number
    promptTokens: number
    generatedTokens: number
    contextTokens: number
    contextMaxTokens: number
    tps: number
    lastUpdated: string | null
    lastError: string | null
}

export type NativeClient = {
    name: string
    model: NativeModelMetrics
}

export type NativeConversationSummary = {
    id: string
    title: string
    originalClientName: string
    activeClientName: string
    createdAt: string
    updatedAt: string
    lastMessagePreview: string | null
    messageCount: number
}

export type NativeStoredMessage = {
    id: string
    role: "system" | "user" | "assistant"
    content: string
    error: boolean
    clientName: string | null
    createdAt: string
}

export type NativeConversationRecord = NativeConversationSummary & {
    messages: NativeStoredMessage[]
}

export type NativeLoadBalancingSite = {
    id: number
    name: string
    ip: string
    primary: boolean
    operational: boolean
    maintenance: boolean
    note: string | null
    updated_at: string
}

const AI_SESSION_ID_KEY = "ai_session_id"
let cachedAiSessionId: string | null = null

function getAccessToken() {
    const state = store.getState() as unknown as ReduxState
    return state.login.token
}

function getUserId() {
    const state = store.getState() as unknown as ReduxState
    return state.profile.id || null
}

export async function getAiSessionId() {
    if (cachedAiSessionId) {
        return cachedAiSessionId
    }

    const existing = await AsyncStorage.getItem(AI_SESSION_ID_KEY)
    if (existing) {
        cachedAiSessionId = existing
        return existing
    }

    const nextValue = globalThis.crypto?.randomUUID?.() || `ai-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    await AsyncStorage.setItem(AI_SESSION_ID_KEY, nextValue)
    cachedAiSessionId = nextValue
    return nextValue
}

export async function getAiOwner() {
    return {
        userId: getUserId(),
        sessionId: await getAiSessionId(),
    }
}

async function requestApi<T>(
    baseUrl: string,
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const token = getAccessToken()
    if (options.requiresAuth !== false && !token) {
        throw new Error("Please sign in first.")
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    if (options.includeAiSession) {
        headers["x-ai-session-id"] = await getAiSessionId()
    }

    const response = await fetch(`${baseUrl}${path}`, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const raw = await response.text()
    const data = parseJson(raw)

    if (!response.ok) {
        throw new Error(getErrorMessage(data) || "Request failed.")
    }

    return data as T
}

function parseJson(raw: string) {
    if (!raw) {
        return null
    }

    try {
        return JSON.parse(raw)
    } catch {
        return raw
    }
}

function getErrorMessage(data: unknown) {
    if (!data) {
        return null
    }

    if (typeof data === "string") {
        return data
    }

    if (typeof data === "object") {
        const record = data as Record<string, unknown>
        return String(record.error || record.message || "")
    }

    return null
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function isConversationSummary(value: unknown): value is NativeConversationSummary {
    return isObject(value)
        && typeof value.id === "string"
        && typeof value.title === "string"
        && typeof value.activeClientName === "string"
}

function isStoredMessage(value: unknown): value is NativeStoredMessage {
    return isObject(value)
        && typeof value.id === "string"
        && (value.role === "system" || value.role === "user" || value.role === "assistant")
        && typeof value.content === "string"
}

function isConversationRecord(value: unknown): value is NativeConversationRecord {
    if (!isConversationSummary(value) || !isObject(value)) {
        return false
    }

    const messages = (value as Record<string, unknown>).messages
    return Array.isArray(messages) && messages.every(isStoredMessage)
}

function isLoadBalancingSite(value: unknown): value is NativeLoadBalancingSite {
    return isObject(value)
        && typeof value.id === "number"
        && typeof value.name === "string"
        && typeof value.primary === "boolean"
        && typeof value.operational === "boolean"
}

export function getBeekeeperWsUrl() {
    return `${config.beekeeper_wss_url}/client/ws/beeswarm`
}

export function defaultNativeModelMetrics(): NativeModelMetrics {
    return {
        conversationId: null,
        status: "idle",
        currentTokens: 0,
        maxTokens: 0,
        promptTokens: 0,
        generatedTokens: 0,
        contextTokens: 0,
        contextMaxTokens: 0,
        tps: 0,
        lastUpdated: null,
        lastError: null,
    }
}

export function normalizeNativeClient(client: { name: string, model?: Partial<NativeModelMetrics> }) {
    return {
        ...client,
        model: {
            ...defaultNativeModelMetrics(),
            ...(client.model || {})
        }
    } as NativeClient
}

export function selectBestNativeClient(clients: NativeClient[]) {
    return [...clients].sort((a, b) => {
        const tpsDiff = (b.model.tps || 0) - (a.model.tps || 0)
        if (tpsDiff !== 0) {
            return tpsDiff
        }

        return a.name.localeCompare(b.name)
    })[0] || null
}

export async function listAiClients(): Promise<NativeClient[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, "/clients", {
        requiresAuth: false,
        includeAiSession: true,
    })

    if (!Array.isArray(payload)) {
        return []
    }

    return payload
        .filter((client): client is { name: string, model?: Partial<NativeModelMetrics> } =>
            isObject(client) && typeof client.name === "string"
        )
        .map(normalizeNativeClient)
}

export async function listAiConversations(): Promise<NativeConversationSummary[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, "/ai/conversations", {
        requiresAuth: false,
        includeAiSession: true,
    })

    if (!Array.isArray(payload)) {
        return []
    }

    return payload.filter(isConversationSummary)
}

export async function getAiConversation(id: string): Promise<NativeConversationRecord> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, `/ai/conversations/${id}`, {
        requiresAuth: false,
        includeAiSession: true,
    })

    if (!isConversationRecord(payload)) {
        throw new Error("AI conversation response was invalid.")
    }

    return payload
}

export async function createAiConversation(clientName: string): Promise<NativeConversationRecord> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, "/ai/conversations", {
        method: "POST",
        body: { clientName },
        requiresAuth: false,
        includeAiSession: true,
    })

    if (!isConversationRecord(payload)) {
        throw new Error("AI conversation response was invalid.")
    }

    return payload
}

export async function switchAiConversationClient(id: string, clientName: string): Promise<NativeConversationRecord> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, `/ai/conversations/${id}/switch-client`, {
        method: "POST",
        body: { clientName },
        requiresAuth: false,
        includeAiSession: true,
    })

    if (!isConversationRecord(payload)) {
        throw new Error("AI conversation response was invalid.")
    }

    return payload
}

export async function listProtectedEvents(limit = 25): Promise<GetEventsProps> {
    return await requestApi<GetEventsProps>(
        config.api,
        `/events/protected?limit=${limit}&offset=0&order_by=time_start&sort=asc&historical=false`
    )
}

export async function getProtectedEvent(id: number): Promise<GetEventProps> {
    return await requestApi<GetEventProps>(config.api, `/events/protected/${id}`)
}

export async function updateProtectedEvent(id: number, body: object): Promise<GetEventProps> {
    return await requestApi<GetEventProps>(config.api, `/events/${id}`, {
        method: "PUT",
        body
    })
}

export async function getInternalDashboard(): Promise<System> {
    return await requestApi<System>(config.internal_api_url, "/stats/dashboard")
}

export async function getLoadBalancingSites(): Promise<NativeLoadBalancingSite[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, "/sites")
    if (!Array.isArray(payload)) {
        return []
    }

    return payload.filter(isLoadBalancingSite)
}

export async function getDatabaseOverview(): Promise<GetDatabaseOverview> {
    return await requestApi<GetDatabaseOverview>(config.internal_api_url, "/db")
}

export async function getVulnerabilitiesOverview(): Promise<GetVulnerabilities> {
    return await requestApi<GetVulnerabilities>(config.internal_api_url, "/vulnerabilities")
}

export async function triggerVulnerabilityScan(): Promise<{ message: string, status: GetVulnerabilities["scanStatus"] }> {
    return await requestApi<{ message: string, status: GetVulnerabilities["scanStatus"] }>(
        config.beekeeper_api_url,
        "/vulnerabilities/scan",
        {
            method: "POST",
            body: {}
        }
    )
}

export async function setPrimaryLoadBalancingSite(id: number) {
    return await requestApi<NativeLoadBalancingSite[]>(config.beekeeper_api_url, `/site/primary/${id}`)
}

export async function getInternalLogs(params?: {
    service?: string
    search?: string
    level?: "all" | "error"
    tail?: number
}) {
    const query = new URLSearchParams()

    if (params?.service) query.set("service", params.service)
    if (params?.search) query.set("search", params.search)
    if (params?.level) query.set("level", params.level)
    if (params?.tail) query.set("tail", String(params.tail))

    const suffix = query.toString()
    return await requestApi<LogsPayload>(
        config.beekeeper_api_url,
        suffix ? `/docker/logs?${suffix}` : "/docker/logs"
    )
}
