import Space from "@/components/shared/utils"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import { JSX, useEffect, useMemo, useRef, useState } from "react"
import {
    ActivityIndicator,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"
import { useSelector } from "react-redux"
import {
    createAiConversation,
    defaultNativeModelMetrics,
    getAiConversation,
    getBeekeeperWsUrl,
    listAiClients,
    listAiConversations,
    normalizeNativeClient,
    switchAiConversationClient
} from "@utils/adminApi"
import { startLogin } from "@utils/auth"

type NativeChatSession = {
    conversationId: string
    clientName: string
    title: string
    messages: NativeStoredMessage[]
    metrics: NativeClient["model"]
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

function pendingAssistantMessage(conversationId: string): NativeStoredMessage {
    return {
        id: `${conversationId}-assistant`,
        role: "assistant",
        content: "",
        error: false,
        clientName: null,
        createdAt: new Date().toISOString()
    }
}

export default function AiScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login } = useSelector((state: ReduxState) => state.login)
    const { id } = useSelector((state: ReduxState) => state.profile)
    const [clients, setClients] = useState<NativeClient[]>([])
    const [conversations, setConversations] = useState<NativeConversationSummary[]>([])
    const [session, setSession] = useState<NativeChatSession | null>(null)
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        if (!login) {
            return
        }

        void refresh()
    }, [login])

    useEffect(() => {
        if (!login) {
            return
        }

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
            setError("AI socket disconnected.")
        }

        return () => {
            socketRef.current = null
            ws.close()
        }
    }, [login, session?.conversationId])

    async function refresh() {
        try {
            setLoading(true)
            setError(null)
            const [nextClients, nextConversations] = await Promise.all([
                listAiClients(),
                listAiConversations()
            ])

            setClients(nextClients.map(client => normalizeNativeClient(client)))
            setConversations(nextConversations)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load AI workspace.")
        } finally {
            setLoading(false)
        }
    }

    async function openConversation(conversationId: string) {
        try {
            setLoading(true)
            const conversation = await getAiConversation(conversationId)
            setSession({
                conversationId: conversation.id,
                clientName: conversation.activeClientName,
                title: conversation.title,
                messages: conversation.messages,
                metrics: clients.find(client => client.name === conversation.activeClientName)?.model || defaultNativeModelMetrics(),
                isSending: false,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to open conversation.")
        } finally {
            setLoading(false)
        }
    }

    async function createConversationForClient(clientName: string) {
        try {
            setLoading(true)
            const conversation = await createAiConversation(clientName)
            setSession({
                conversationId: conversation.id,
                clientName: conversation.activeClientName,
                title: conversation.title,
                messages: conversation.messages,
                metrics: clients.find(client => client.name === conversation.activeClientName)?.model || defaultNativeModelMetrics(),
                isSending: false,
            })
            setConversations(prev => [conversation, ...prev.filter(item => item.id !== conversation.id)])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create conversation.")
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
            const conversation = await switchAiConversationClient(session.conversationId, clientName)
            setSession({
                conversationId: conversation.id,
                clientName: conversation.activeClientName,
                title: conversation.title,
                messages: conversation.messages,
                metrics: clients.find(client => client.name === conversation.activeClientName)?.model || defaultNativeModelMetrics(),
                isSending: false,
            })
            await refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to switch model.")
        }
    }

    function handleSocketMessage(message: NativeSocketMessage) {
        if (message.type === "update" && message.client) {
            const nextClient = normalizeNativeClient(message.client)
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

        if (message.type === "prompt_started") {
            setSession(prev => prev ? {
                ...prev,
                isSending: true,
                messages: prev.messages.some(item => item.id === `${prev.conversationId}-assistant`)
                    ? prev.messages
                    : [...prev.messages, pendingAssistantMessage(prev.conversationId)]
            } : prev)
            return
        }

        if (message.type === "prompt_delta") {
            setSession(prev => {
                if (!prev) return prev
                const messages = [...prev.messages]
                const last = messages[messages.length - 1]
                if (last?.role === "assistant") {
                    messages[messages.length - 1] = {
                        ...last,
                        content: message.content ?? `${last.content}${message.delta || ""}`,
                    }
                }
                return { ...prev, isSending: true, messages }
            })
            return
        }

        if (message.type === "prompt_complete") {
            setSession(prev => {
                if (!prev) return prev
                const messages = [...prev.messages]
                const last = messages[messages.length - 1]
                if (last?.role === "assistant") {
                    messages[messages.length - 1] = {
                        ...last,
                        content: message.content ?? last.content,
                    }
                }
                return { ...prev, isSending: false, messages }
            })
            void refresh()
            return
        }

        if (message.type === "prompt_error") {
            setSession(prev => {
                if (!prev) return prev
                const messages = [...prev.messages]
                const content = message.error || "The model failed to answer."
                const last = messages[messages.length - 1]
                if (last?.role === "assistant") {
                    messages[messages.length - 1] = { ...last, content, error: true }
                } else {
                    messages.push({
                        id: `${prev.conversationId}-error-${Date.now()}`,
                        role: "assistant",
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

    function sendPrompt() {
        if (!session || !input.trim() || !socketRef.current) {
            return
        }

        const userMessage: NativeStoredMessage = {
            id: `${Date.now()}`,
            role: "user",
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
            type: "prompt_request",
            conversationId: session.conversationId,
            clientName: session.clientName,
            ownerUserId: id,
            ownerSessionId: null,
            messages: [...session.messages, userMessage].map(message => ({
                role: message.role,
                content: message.content,
            })),
            maxTokens: 512,
            temperature: 0.7,
        }))

        setInput("")
    }

    const activeClient = useMemo(() => clients.find(client => client.name === session?.clientName) || null, [clients, session?.clientName])

    if (!login) {
        return (
            <ScrollView>
                <Swipe left="MenuScreen">
                    <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                        <Space height={80} />
                        <Text style={{ ...T.centeredBold20, color: theme.textColor }}>Login AI</Text>
                        <Space height={14} />
                        <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                            Sign in to keep conversations, choose between connected models, and use GPT directly in the app.
                        </Text>
                        <Space height={20} />
                        <TouchableOpacity onPress={() => startLogin("gpt")}>
                            <View style={{ borderRadius: 18, backgroundColor: theme.orange, padding: 14 }}>
                                <Text style={{ ...T.centered20, color: theme.darker }}>Sign in for AI</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Swipe>
            </ScrollView>
        )
    }

    return (
        <ScrollView>
            <Swipe left="MenuScreen">
                <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                    <Space height={70} />
                    <Text style={{ ...T.centeredBold20, color: theme.textColor }}>Login AI</Text>
                    <Space height={10} />
                    <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                        {activeClient ? `${activeClient.name} · ${activeClient.model.status}` : "Choose a model to start a native chat."}
                    </Text>
                    <Space height={16} />
                    {loading && <ActivityIndicator color={theme.orange} />}
                    {error && <Text style={{ ...T.centered15, color: "red" }}>{error}</Text>}

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            {clients.map(client => (
                                <TouchableOpacity key={client.name} onPress={() => void changeModel(client.name)}>
                                    <View style={{
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: session?.clientName === client.name ? theme.orange : theme.contrast,
                                        backgroundColor: theme.contrast,
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        minWidth: 140
                                    }}>
                                        <Text style={{ ...T.text15, color: theme.textColor }}>{client.name}</Text>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                            {client.model.status} · {Math.round(client.model.tps || 0)} tps
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <Space height={16} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            {conversations.map(conversation => (
                                <TouchableOpacity key={conversation.id} onPress={() => void openConversation(conversation.id)}>
                                    <View style={{
                                        borderRadius: 14,
                                        backgroundColor: session?.conversationId === conversation.id ? theme.orange : theme.contrast,
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        maxWidth: 220
                                    }}>
                                        <Text style={{ ...T.text15, color: session?.conversationId === conversation.id ? theme.darker : theme.textColor }}>
                                            {conversation.title}
                                        </Text>
                                        <Text style={{ ...T.text12, color: session?.conversationId === conversation.id ? theme.darker : theme.oppositeTextColor }}>
                                            {conversation.activeClientName}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <Space height={16} />
                    <View style={{
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: theme.contrast,
                        backgroundColor: theme.contrast,
                        padding: 14,
                        minHeight: 360,
                    }}>
                        {(session?.messages || []).map(message => (
                            <View key={message.id} style={{
                                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                                maxWidth: "92%",
                                backgroundColor: message.role === "user" ? theme.orange : "#1a1a1a",
                                borderRadius: 18,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                marginBottom: 10
                            }}>
                                <Text style={{ ...T.text15, color: message.role === "user" ? theme.darker : theme.textColor }}>
                                    {message.content || (session?.isSending ? "..." : "")}
                                </Text>
                            </View>
                        ))}
                        {!session && (
                            <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                                Pick a model above to create your first conversation.
                            </Text>
                        )}
                    </View>
                    <Space height={12} />
                    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder='Ask Login AI...'
                            placeholderTextColor={theme.oppositeTextColor}
                            style={{
                                flex: 1,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: theme.contrast,
                                backgroundColor: theme.contrast,
                                color: theme.textColor,
                                paddingHorizontal: 14,
                                paddingVertical: 12
                            }}
                        />
                        <TouchableOpacity onPress={sendPrompt}>
                            <View style={{
                                borderRadius: 16,
                                backgroundColor: theme.orange,
                                paddingHorizontal: 16,
                                paddingVertical: 12
                            }}>
                                <Text style={{ ...T.text15, color: theme.darker }}>Send</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Space height={30} />
                </View>
            </Swipe>
        </ScrollView>
    )
}
