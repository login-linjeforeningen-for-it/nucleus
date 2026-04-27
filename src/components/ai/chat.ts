import {
    createAiConversation,
    defaultNativeModelMetrics,
    getAiConversation,
    getAiOwner,
    getBeekeeperWsUrl,
    listAiClients,
    listAiConversations,
    selectBestNativeClient,
    switchAiConversationClient,
} from '@utils/queenbee/api'
import { useEffect, useMemo, useRef, useState } from 'react'

type NativeChatSession = {
    conversationId: string
    clientName: string
    title: string
    messages: NativeStoredMessage[]
    metrics: NativeClient['model']
    isSending: boolean
}

type NativeSocketMessage = {
    type?: string
    client?: NativeClient
    conversationId?: string
    content?: string
    delta?: string
    error?: string
}

type AiText = {
    failedWorkspace: string
    failedOpenConversation: string
    failedCreateConversation: string
    failedSwitchModel: string
    modelFailed: string
    socketDisconnected: string
}

export default function useAiChat(text: AiText) {
    const [clients, setClients] = useState<NativeClient[]>([])
    const [conversations, setConversations] = useState<NativeConversationSummary[]>([])
    const [session, setSession] = useState<NativeChatSession | null>(null)
    const [input, setInput] = useState('')
    const [owner, setOwner] = useState<{ userId?: string | null, sessionId?: string | null }>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const socketRef = useRef<WebSocket | null>(null)

    const activeClient = useMemo(() =>
        clients.find(client => client.name === session?.clientName) || null,
    [clients, session?.clientName])

    useEffect(() => {
        refresh()
    }, [])

    useEffect(() => {
        const ws = new WebSocket(getBeekeeperWsUrl())
        socketRef.current = ws

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as NativeSocketMessage
                handleSocketMessage(message)
            } catch (err) {
                console.log(err)
            }
        }

        ws.onerror = () => {
            setError(text.socketDisconnected)
        }

        return () => {
            socketRef.current = null
            ws.close()
        }
    }, [session?.conversationId, text.socketDisconnected])

    useEffect(() => {
        if (loading || session) {
            return
        }

        if (conversations.length) {
            openConversation(conversations[0].id)
            return
        }

        const bestClient = selectBestNativeClient(clients)
        if (bestClient) {
            createConversationForClient(bestClient.name)
        }
    }, [clients, conversations, loading, session])

    async function refresh() {
        try {
            setLoading(true)
            setError(null)
            const [nextClients, nextConversations, nextOwner] = await Promise.all([
                listAiClients(),
                listAiConversations(),
                getAiOwner().catch(() => ({}))
            ])

            setClients(nextClients)
            setConversations(nextConversations)
            setOwner(nextOwner)
        } catch (err) {
            setError(err instanceof Error ? err.message : text.failedWorkspace)
        } finally {
            setLoading(false)
        }
    }

    async function openConversation(conversationId: string) {
        try {
            setLoading(true)
            const conversation = await getAiConversation(conversationId)
            setSession(conversationToSession(conversation, clients))
        } catch (err) {
            setError(err instanceof Error ? err.message : text.failedOpenConversation)
        } finally {
            setLoading(false)
        }
    }

    async function createConversationForClient(clientName: string) {
        try {
            setLoading(true)
            setError(null)
            const conversation = await createAiConversation(clientName)
            setSession(conversationToSession(conversation, clients))
            setConversations(prev => [conversation, ...prev.filter(item => item.id !== conversation.id)])
        } catch (err) {
            setError(err instanceof Error ? err.message : text.failedCreateConversation)
        } finally {
            setLoading(false)
        }
    }

    async function createNewConversation() {
        const nextClientName = session?.clientName || selectBestNativeClient(clients)?.name

        if (!nextClientName) {
            setError(text.failedCreateConversation)
            return
        }

        await createConversationForClient(nextClientName)
    }

    async function changeModel(clientName: string) {
        if (!session) {
            await createConversationForClient(clientName)
            return
        }

        try {
            setError(null)
            const conversation = await switchAiConversationClient(session.conversationId, clientName)
            setSession(conversationToSession(conversation, clients))
            await refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : text.failedSwitchModel)
        }
    }

    function handleSocketMessage(message: NativeSocketMessage) {
        if (message.type === 'update' && message.client) {
            const nextClient: NativeClient = {
                ...message.client,
                model: {
                    ...defaultNativeModelMetrics(),
                    ...(message.client.model || {})
                }
            }
            setClients(prev => {
                const existing = prev.find(client => client.name === nextClient.name)
                return existing
                    ? prev.map(client => client.name === nextClient.name ? nextClient : client)
                    : [...prev, nextClient]
            })
            return
        }

        if (!session || session.conversationId !== message.conversationId) {
            return
        }

        if (message.type === 'prompt_started') {
            setSession(prev => prev ? {
                ...prev,
                isSending: true,
                messages: prev.messages.some(item => item.id === `${prev.conversationId}-assistant`)
                    ? prev.messages
                    : [...prev.messages, pendingAssistantMessage(prev.conversationId)]
            } : prev)
            return
        }

        if (message.type === 'prompt_delta') {
            setSession(prev => updateLastAssistantMessage(prev, message, true))
            return
        }

        if (message.type === 'prompt_complete') {
            setSession(prev => updateLastAssistantMessage(prev, message, false))
            refresh()
            return
        }

        if (message.type === 'prompt_error') {
            setSession(prev => {
                if (!prev) return prev
                const messages = [...prev.messages]
                const content = message.error || text.modelFailed
                const last = messages[messages.length - 1]
                if (last?.role === 'assistant') {
                    messages[messages.length - 1] = { ...last, content, error: true }
                } else {
                    messages.push({
                        id: `${prev.conversationId}-error-${Date.now()}`,
                        role: 'assistant',
                        content,
                        error: true,
                        clientName: prev.clientName,
                        createdAt: new Date().toISOString()
                    })
                }
                return { ...prev, isSending: false, messages }
            })
        }
    }

    async function sendPrompt() {
        if (!session || !input.trim() || !socketRef.current) {
            return
        }

        if (socketRef.current.readyState !== WebSocket.OPEN) {
            setError(text.socketDisconnected)
            return
        }

        const userMessage: NativeStoredMessage = {
            id: `${Date.now()}`,
            role: 'user',
            content: input.trim(),
            error: false,
            clientName: session.clientName,
            createdAt: new Date().toISOString()
        }

        const nextMessages = [...session.messages, userMessage, pendingAssistantMessage(session.conversationId)]
        setSession({
            ...session,
            isSending: true,
            messages: nextMessages,
        })

        socketRef.current.send(JSON.stringify({
            type: 'prompt_request',
            conversationId: session.conversationId,
            clientName: session.clientName,
            ownerUserId: owner.userId,
            ownerSessionId: owner.sessionId,
            messages: [...session.messages, userMessage].map(message => ({
                role: message.role,
                content: message.content,
            })),
            maxTokens: 512,
            temperature: 0.7,
        }))

        setInput('')
    }

    return {
        activeClient,
        changeModel,
        clients,
        conversations,
        createNewConversation,
        error,
        input,
        loading,
        openConversation,
        sendPrompt,
        session,
        setInput,
    }
}

function conversationToSession(conversation: NativeConversationRecord, clients: NativeClient[]): NativeChatSession {
    return {
        conversationId: conversation.id,
        clientName: conversation.activeClientName,
        title: conversation.title,
        messages: conversation.messages,
        metrics: clients.find(client => client.name === conversation.activeClientName)?.model || defaultNativeModelMetrics(),
        isSending: false,
    }
}

function updateLastAssistantMessage(
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

function pendingAssistantMessage(conversationId: string): NativeStoredMessage {
    return {
        id: `${conversationId}-assistant`,
        role: 'assistant',
        content: '',
        error: false,
        clientName: null,
        createdAt: new Date().toISOString()
    }
}
