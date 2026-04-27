import AsyncStorage from '@react-native-async-storage/async-storage'
import store from '@redux/store'

const AI_SESSION_ID_KEY = 'ai_session_id'
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

export async function requestApi<T>(
    baseUrl: string,
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const token = getAccessToken()
    if (options.requiresAuth !== false && !token) {
        throw new Error('Please sign in first.')
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    if (options.includeAiSession) {
        headers['x-ai-session-id'] = await getAiSessionId()
    }

    const response = await fetch(`${baseUrl}${path}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const raw = await response.text()
    const data = parseJson(raw)

    if (!response.ok) {
        throw new Error(getErrorMessage(data) || 'Request failed.')
    }

    return data as T
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
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

    if (typeof data === 'string') {
        return data
    }

    if (typeof data === 'object') {
        const record = data as Record<string, unknown>
        return String(record.error || record.message || '')
    }

    return null
}
