import config from '@/constants'
import { isObject, requestApi } from './request'

function isConversationSummary(value: unknown): value is NativeConversationSummary {
    return isObject(value)
        && typeof value.id === 'string'
        && typeof value.title === 'string'
        && typeof value.activeClientName === 'string'
}

function isStoredMessage(value: unknown): value is NativeStoredMessage {
    return isObject(value)
        && typeof value.id === 'string'
        && (value.role === 'system' || value.role === 'user' || value.role === 'assistant')
        && typeof value.content === 'string'
}

function isConversationRecord(value: unknown): value is NativeConversationRecord {
    if (!isConversationSummary(value) || !isObject(value)) {
        return false
    }

    const messages = (value as Record<string, unknown>).messages
    return Array.isArray(messages) && messages.every(isStoredMessage)
}

export function getBeekeeperWsUrl() {
    return `${config.beekeeper_wss_url}/client/ws/beeswarm`
}

export function defaultNativeModelMetrics(): NativeModelMetrics {
    return {
        conversationId: null,
        status: 'idle',
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
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/clients', {
        requiresAuth: false,
        includeAiSession: true,
    })

    if (!Array.isArray(payload)) {
        return []
    }

    return payload
        .filter((client): client is { name: string, model?: Partial<NativeModelMetrics> } =>
            isObject(client) && typeof client.name === 'string'
        )
        .map(normalizeNativeClient)
}

export async function listAiConversations(): Promise<NativeConversationSummary[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/ai/conversations', {
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
        throw new Error('AI conversation response was invalid.')
    }

    return payload
}

export async function createAiConversation(clientName: string): Promise<NativeConversationRecord> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/ai/conversations', {
        method: 'POST',
        body: { clientName },
        requiresAuth: false,
        includeAiSession: true,
    })

    if (!isConversationRecord(payload)) {
        throw new Error('AI conversation response was invalid.')
    }

    return payload
}

export async function switchAiConversationClient(id: string, clientName: string): Promise<NativeConversationRecord> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, `/ai/conversations/${id}/switch-client`, {
        method: 'POST',
        body: { clientName },
        requiresAuth: false,
        includeAiSession: true,
    })

    if (!isConversationRecord(payload)) {
        throw new Error('AI conversation response was invalid.')
    }

    return payload
}
