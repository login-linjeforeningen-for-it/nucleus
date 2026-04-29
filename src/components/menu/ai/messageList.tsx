import Text from '@components/shared/text'
import T from '@styles/text'
import { copyToClipboard } from '@utils/general/clipboard'
import { Copy } from 'lucide-react-native'
import { JSX, useEffect, useRef, useState } from 'react'
import { Dimensions, Pressable, ScrollView, View } from 'react-native'

type Props = {
    session: {
        messages: NativeStoredMessage[]
        isSending: boolean
    } | null
    theme: Theme
    isLoggedIn: boolean
    bottomInset: number
    text: {
        typing: string
        preparingConversation: string
        temporaryConversation: string
        copiedTitle: string
        copiedBody: string
    }
}

export default function AiMessageList({ session, theme, isLoggedIn, bottomInset, text }: Props): JSX.Element {
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const scrollRef = useRef<ScrollView | null>(null)
    const messages = session?.messages || []

    useEffect(() => {
        requestAnimationFrame(() => {
            scrollRef.current?.scrollToEnd({ animated: true })
        })
    }, [messages.length, session?.isSending])

    function copyMessage(messageId: string, content: string) {
        copyToClipboard(content)
        setCopiedMessageId(messageId)

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            setCopiedMessageId((current) => current === messageId ? null : current)
        }, 500)
    }

    return (
        <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: bottomInset,
                minHeight: Dimensions.get('window').height * 0.66,
                maxHeight: Dimensions.get('window').height * 0.66,
                overflow: 'hidden',
            }}
            keyboardShouldPersistTaps='handled'
        >
            {messages.map((message, id) => {
                const isUser = message.role === 'user'
                const content = message.content || (session?.isSending ? text.typing : '')
                const isCopied = copiedMessageId === message.id

                return (
                    <View
                        key={id}
                        style={{
                            alignItems: isUser ? 'flex-end' : 'flex-start',
                            marginBottom: 14
                        }}
                    >
                        <View style={{
                            maxWidth: isUser ? '86%' : '92%',
                            left: isUser ? 0 : 4,
                            alignItems: isUser ? 'flex-end' : 'flex-start',
                        }}>
                            <View style={{
                                position: 'relative',
                                alignSelf: isUser ? 'flex-end' : 'flex-start',
                            }}>
                                {isCopied ? (
                                    <View style={{
                                        position: 'absolute',
                                        top: -3,
                                        right: -4,
                                        bottom: -3,
                                        left: -4,
                                        borderRadius: isUser ? 22 : 14,
                                        borderWidth: 1,
                                        borderColor: !isUser ? theme.greyTransparentBorder : 'none',
                                        backgroundColor: !isUser ? theme.greyTransparent : 'none',
                                        opacity: 1,
                                        pointerEvents: 'none',
                                    }} />
                                ) : null}
                                <Pressable
                                    onPress={() => content && copyMessage(message.id, content)}
                                    style={{
                                        backgroundColor: isUser ? theme.orange : 'transparent',
                                        borderRadius: 18,
                                        paddingHorizontal: 8,
                                        paddingVertical: 6,
                                    }}
                                >
                                    <Text style={{ ...T.text15, color: isUser ? theme.darker : theme.textColor }}>
                                        {content}
                                    </Text>
                                </Pressable>
                            </View>
                            {content ? (
                                <Pressable
                                    onPress={() => copyMessage(message.id, content)}
                                    style={{
                                        minWidth: 32,
                                        height: 32,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Copy height={14} color={isCopied ? 'rgba(56,210,122,0.8)' : theme.oppositeTextColor} />
                                </Pressable>
                            ) : null}
                        </View>
                    </View>
                )
            })}
            {!session
                ? (
                    <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                        {isLoggedIn
                            ? text.preparingConversation
                            : text.temporaryConversation}
                    </Text>
                )
                : null}
        </ScrollView>
    )
}
