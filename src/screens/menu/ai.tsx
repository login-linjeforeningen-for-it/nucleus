import Space from "@/components/shared/utils"
import { MenuProps } from "@/types/screenTypes"
import AiComposer from "@components/menu/ai/composer"
import AiConversationPicker from "@components/menu/ai/conversationPicker"
import AiMessageList from "@components/menu/ai/messageList"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import { JSX, useEffect, useMemo, useRef, useState } from "react"
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    View
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSelector } from "react-redux"
import {
    createAiConversation,
    defaultNativeModelMetrics,
    getAiOwner,
    getAiConversation,
    getBeekeeperWsUrl,
    listAiClients,
    listAiConversations,
    selectBestNativeClient,
    switchAiConversationClient
} from "@utils/queenbeeApi"

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

export default function AiScreen({ navigation }: MenuProps<"AiScreen">): JSX.Element {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const { login } = useSelector((state: ReduxState) => state.login)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require("@text/no.json").ai : require("@text/en.json").ai
    const insets = useSafeAreaInsets()
    const [clients, setClients] = useState<NativeClient[]>([])
    const [conversations, setConversations] = useState<NativeConversationSummary[]>([])
    const [session, setSession] = useState<NativeChatSession | null>(null)
    const [input, setInput] = useState("")
    const [owner, setOwner] = useState<{ userId?: string | null, sessionId?: string | null }>({})
    const [showConversations, setShowConversations] = useState(false)
    const [showModels, setShowModels] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const socketRef = useRef<WebSocket | null>(null)

    function formatClientSubtitle(client: NativeClient) {
        const parts = []
        const localizedStatus = text.status[client.model.status as keyof typeof text.status]
            || client.model.status.charAt(0).toUpperCase() + client.model.status.slice(1)
        parts.push(localizedStatus)
        if (client.model.tps) {
            parts.push(`${Math.round(client.model.tps)} tps`)
        }
        return parts.join(" · ")
    }

    useEffect(() => {
        void refresh()
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
            void openConversation(conversations[0].id)
            return
        }

        const bestClient = selectBestNativeClient(clients)
        if (bestClient) {
            void createConversationForClient(bestClient.name)
        }
    }, [clients, conversations, loading, session])

    useEffect(() => {
        navigation.setOptions({
            headerComponents: {
                right: [
                    <Pressable
                        key='ai-conversations'
                        onPress={() => {
                            setShowModels(false)
                            setShowConversations((current) => !current)
                        }}
                        style={({ pressed }) => ({
                            marginRight: 10,
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            borderWidth: 1,
                            borderColor: showConversations ? "rgba(253,135,56,0.24)" : "rgba(255,255,255,0.08)",
                            backgroundColor: showConversations
                                ? "rgba(253,135,56,0.12)"
                                : pressed
                                    ? "rgba(255,255,255,0.10)"
                                    : "rgba(255,255,255,0.05)",
                            alignItems: "center",
                            justifyContent: "center",
                        })}
                    >
                        <Text style={{
                            ...T.text20,
                            color: theme.orange,
                            fontSize: 24,
                            lineHeight: 24,
                            fontWeight: "700",
                            marginTop: Platform.OS === "ios" ? -1 : -3,
                        }}>
                            ≡
                        </Text>
                    </Pressable>
                ]
            }
        } as any)
    }, [navigation, showConversations, theme.orange])

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
            setSession({
                conversationId: conversation.id,
                clientName: conversation.activeClientName,
                title: conversation.title,
                messages: conversation.messages,
                metrics: clients.find(client => client.name === conversation.activeClientName)?.model || defaultNativeModelMetrics(),
                isSending: false,
            })
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

        setShowConversations(false)
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
            setError(err instanceof Error ? err.message : text.failedSwitchModel)
        }
    }

    function handleSocketMessage(message: NativeSocketMessage) {
        if (message.type === "update" && message.client) {
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
                const content = message.error || text.modelFailed
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
            ownerUserId: owner.userId,
            ownerSessionId: owner.sessionId,
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

    return (
        <Swipe left="MenuScreen">
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: theme.darker }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={{ ...GS.content, flex: 1, paddingBottom: 0 }}>
                    <Space height={Dimensions.get("window").height / 8} />
                    {activeClient ? (
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            gap: 6,
                        }}>
                            <Pressable onPress={() => {
                                setShowConversations(false)
                                setShowModels((current) => !current)
                            }}>
                                <Text style={{
                                    ...T.text15,
                                    color: theme.orange,
                                }}>
                                    {activeClient.name}
                                </Text>
                            </Pressable>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                ·
                            </Text>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {formatClientSubtitle(activeClient)}
                            </Text>
                        </View>
                    ) : (
                        <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                            {loading ? text.workspaceLoading : text.connectingFastest}
                        </Text>
                    )}
                    <Space height={14} />
                    {loading && <ActivityIndicator color={theme.orange} />}
                    {error && <Text style={{ ...T.centered15, color: "red" }}>{error}</Text>}

                    <Space height={14} />
                    <View style={{ flex: 1, minHeight: 0, paddingBottom: 108 + insets.bottom }}>
                        <AiMessageList session={session} theme={theme} isLoggedIn={login} text={text} />
                    </View>
                    {showModels ? (
                        <View style={{
                            position: "absolute",
                            top: Dimensions.get("window").height / 8 + 18,
                            right: 12,
                            left: 12,
                            zIndex: 21,
                            borderRadius: 22,
                            backgroundColor: "#121112ee",
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.08)",
                            padding: 12,
                            gap: 8,
                        }}>
                            {clients.map((client) => {
                                const isActive = session?.clientName === client.name

                                return (
                                    <Pressable
                                        key={client.name}
                                        onPress={() => {
                                            setShowModels(false)
                                            void changeModel(client.name)
                                        }}
                                        style={{
                                            borderRadius: 16,
                                            backgroundColor: isActive ? "#fd873814" : "#ffffff08",
                                            paddingHorizontal: 14,
                                            paddingVertical: 10,
                                        }}
                                    >
                                        <Text style={{
                                            ...T.text15,
                                            color: isActive ? theme.orange : theme.textColor,
                                            fontWeight: isActive ? "700" : "500",
                                        }}>
                                            {client.name}
                                        </Text>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                            {Math.round(client.model.tps || 0)} tps
                                        </Text>
                                    </Pressable>
                                )
                            })}
                        </View>
                    ) : null}
                    {showConversations ? (
                        <View style={{
                            position: "absolute",
                            top: Dimensions.get("window").height / 8 + 42,
                            right: 12,
                            left: 12,
                            zIndex: 20,
                            borderRadius: 22,
                            backgroundColor: "#121112ee",
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.08)",
                            padding: 12,
                        }}>
                            <AiConversationPicker
                                conversations={conversations}
                                activeConversationId={session?.conversationId}
                                theme={theme}
                                onCreate={() => void createNewConversation()}
                                onSelect={(conversationId) => {
                                    setShowConversations(false)
                                    void openConversation(conversationId)
                                }}
                                currentConversationLabel={text.currentConversation}
                                newConversationLabel={text.newConversation}
                            />
                        </View>
                    ) : null}
                    <View style={{
                        position: "absolute",
                        left: 12,
                        right: 12,
                        bottom: 84 + insets.bottom,
                    }}>
                        <AiComposer
                            value={input}
                            onChangeText={setInput}
                            onSend={() => void sendPrompt()}
                            theme={theme}
                            placeholder={text.composerPlaceholder}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Swipe>
    )
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
