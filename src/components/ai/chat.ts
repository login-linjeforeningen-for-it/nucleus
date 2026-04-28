import {
    createAiConversation,
    deleteAiConversation,
    getAiConversation,
    getAiOwner,
    listAiClients,
    listAiConversations,
    selectBestNativeClient,
    switchAiConversationClient,
} from '@utils/queenbee/api'
import { useEffect, useMemo, useState } from 'react'
import {
    NativeChatSession,
    NativeChatOwner,
    appendPendingPrompt,
    conversationToSession,
    createPromptRequest,
    createUserMessage,
} from './chatMessages'
import { useAiSocket } from './useAiSocket'

type AiText = {
    failedWorkspace: string
    failedOpenConversation: string
    failedCreateConversation: string
    failedDeleteConversation?: string
    failedSwitchModel: string
    modelFailed: string
    socketDisconnected: string
}

export default function useAiChat(text: AiText) {
    const [clients, setClients] = useState<NativeClient[]>([])
    const [conversations, setConversations] = useState<NativeConversationSummary[]>([])
    const [session, setSession] = useState<NativeChatSession | null>(null)
    const [input, setInput] = useState('')
    const [owner, setOwner] = useState<NativeChatOwner>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const activeClient = useMemo(() =>
        clients.find(client => client.name === session?.clientName) || null,
    [clients, session?.clientName])

    useEffect(() => {
        refresh()
    }, [])

    const socketRef = useAiSocket({ session, text, setClients, setError, setSession, refresh })

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

    async function removeConversation(conversationId: string) {
        try {
            setLoading(true)
            setError(null)
            await deleteAiConversation(conversationId)
            setConversations(prev => prev.filter(item => item.id !== conversationId))
            if (session?.conversationId === conversationId) {
                setSession(null)
            }
            await refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : text.failedDeleteConversation || text.failedOpenConversation)
        } finally {
            setLoading(false)
        }
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

    async function sendPrompt() {
        if (!session || !input.trim() || !socketRef.current) {
            return
        }

        if (socketRef.current.readyState !== WebSocket.OPEN) {
            setError(text.socketDisconnected)
            return
        }

        const userMessage = createUserMessage(input, session.clientName)
        setSession(appendPendingPrompt(session, userMessage))
        socketRef.current.send(JSON.stringify(createPromptRequest(session, userMessage, owner)))

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
        removeConversation,
        sendPrompt,
        session,
        setInput,
    }
}
