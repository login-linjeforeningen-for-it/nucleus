import config from "@/constants"
import store from "@redux/store"

function getAccessToken() {
    const state = store.getState() as unknown as ReduxState
    return state.login.token
}

async function requestApi<T>(baseUrl: string, path: string, options: RequestOptions = {}): Promise<T> {
    const token = getAccessToken()
    if (!token) {
        throw new Error("Please sign in first.")
    }

    const response = await fetch(`${baseUrl}${path}`, {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const raw = await response.text()
    const data = raw ? JSON.parse(raw) : null

    if (!response.ok) {
        throw new Error(data?.error || data?.message || "Request failed.")
    }

    return data as T
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

export async function listAiClients(): Promise<NativeClient[]> {
    const clients = await requestApi<{ name: string, model?: Partial<NativeModelMetrics> }[]>(config.beekeeper_api_url, "/clients")
    return clients.map(normalizeNativeClient)
}

export async function listAiConversations(): Promise<NativeConversationSummary[]> {
    return await requestApi<NativeConversationSummary[]>(config.beekeeper_api_url, "/ai/conversations")
}

export async function getAiConversation(id: string): Promise<NativeConversationRecord> {
    return await requestApi<NativeConversationRecord>(config.beekeeper_api_url, `/ai/conversations/${id}`)
}

export async function createAiConversation(clientName: string): Promise<NativeConversationRecord> {
    return await requestApi<NativeConversationRecord>(config.beekeeper_api_url, "/ai/conversations", {
        method: "POST",
        body: { clientName }
    })
}

export async function switchAiConversationClient(id: string, clientName: string): Promise<NativeConversationRecord> {
    return await requestApi<NativeConversationRecord>(config.beekeeper_api_url, `/ai/conversations/${id}/switch-client`, {
        method: "POST",
        body: { clientName }
    })
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
    return await requestApi<NativeLoadBalancingSite[]>(config.beekeeper_api_url, "/sites")
}

export async function getDatabaseOverview(): Promise<GetDatabaseOverview> {
    return await requestApi<GetDatabaseOverview>(config.internal_api_url, "/db")
}
