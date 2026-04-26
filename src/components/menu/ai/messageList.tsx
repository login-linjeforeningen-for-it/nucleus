import Clipboard from '@react-native-clipboard/clipboard'
import Text from '@components/shared/text'
import T from '@styles/text'
import { JSX, useRef, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

type Props = {
    session: {
        messages: NativeStoredMessage[]
        isSending: boolean
    } | null
    theme: Theme
    isLoggedIn: boolean
    text: {
        typing: string
        preparingConversation: string
        temporaryConversation: string
        copiedTitle: string
        copiedBody: string
    }
}

export default function AiMessageList({ session, theme, isLoggedIn, text }: Props): JSX.Element {
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    function copyMessage(messageId: string, content: string) {
        Clipboard.setString(content)
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingBottom: 12,
                minHeight: 360,
            }}
            keyboardShouldPersistTaps='handled'
        >
            {(session?.messages || []).map(message => {
                const isUser = message.role === 'user'
                const content = message.content || (session?.isSending ? text.typing : '')
                const isCopied = copiedMessageId === message.id

                return (
                    <View
                        key={message.id}
                        style={{
                            alignItems: isUser ? 'flex-end' : 'flex-start',
                            marginBottom: 14
                        }}
                    >
                        <View style={{
                            maxWidth: isUser ? '86%' : '92%',
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
                                        borderColor: 'rgba(56,210,122,0.18)',
                                        backgroundColor: 'rgba(56,210,122,0.035)',
                                        opacity: 1,
                                        pointerEvents: 'none',
                                    }} />
                                ) : null}
                                <Pressable
                                    onPress={() => content && copyMessage(message.id, content)}
                                    style={{
                                        backgroundColor: isUser ? theme.orange : 'transparent',
                                        borderRadius: isUser ? 18 : 0,
                                        paddingHorizontal: isUser ? 12 : 0,
                                        paddingVertical: isUser ? 10 : 0,
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
                                        marginTop: 6,
                                        minWidth: 32,
                                        height: 32,
                                        borderRadius: 12,
                                        backgroundColor: isCopied ? 'rgba(56,210,122,0.08)' : '#ffffff08',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{
                                        ...T.text15,
                                        color: isCopied ? 'rgba(56,210,122,0.8)' : theme.oppositeTextColor,
                                    }}>
                                        ⧉
                                    </Text>
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
