import { defaultNativeModelMetrics } from '@utils/queenbee/api'

export type NativeChatSession = {
    conversationId: string
    clientName: string
    title: string
    messages: NativeStoredMessage[]
    metrics: NativeClient['model']
    isSending: boolean
}

export type NativeSocketMessage = {
    type?: string
    client?: NativeClient
    conversationId?: string
    content?: string
    delta?: string
    error?: string
}

export function conversationToSession(conversation: NativeConversationRecord, clients: NativeClient[]): NativeChatSession {
    return {
        conversationId: conversation.id,
        clientName: conversation.activeClientName,
        title: conversation.title,
        messages: conversation.messages,
        metrics: clients.find(client => client.name === conversation.activeClientName)?.model || defaultNativeModelMetrics(),
        isSending: false,
    }
}

export function updateLastAssistantMessage(
    session: NativeChatSession | null,
    message: NativeSocketMessage,
    isSending: boolean
) {
    if (!session) return session
    const messages = [...session.messages]
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant') {
        messages[messages.length - 1] = {
            ...last,
            content: message.content ?? `${last.content}${message.delta || ''}`,
        }
    }
    return { ...session, isSending, messages }
}

export function pendingAssistantMessage(conversationId: string): NativeStoredMessage {
    return {
        id: `${conversationId}-assistant`,
        role: 'assistant',
        content: '',
        error: false,
        clientName: null,
        createdAt: new Date().toISOString(),
    }
}
