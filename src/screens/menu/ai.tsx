import Space from '@/components/shared/utils'
import { AiConversationOverlay, AiModelPicker } from '@/components/menu/ai/aiOverlays'
import AiComposer from '@components/menu/ai/composer'
import AiMessageList from '@components/menu/ai/messageList'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import { JSX, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import useAiChat from '@components/ai/chat'

export default function AiScreen({ navigation }: MenuProps<'AiScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login } = useSelector((state: ReduxState) => state.login)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').ai : require('@text/en.json').ai
    const insets = useSafeAreaInsets()
    const [showConversations, setShowConversations] = useState(false)
    const [showModels, setShowModels] = useState(false)
    const ai = useAiChat(text)

    function formatClientSubtitle(client: NativeClient) {
        const parts = []
        const localizedStatus = text.status[client.model.status as keyof typeof text.status]
            || client.model.status.charAt(0).toUpperCase() + client.model.status.slice(1)
        parts.push(localizedStatus)
        if (client.model.tps) {
            parts.push(`${Math.round(client.model.tps)} tps`)
        }
        return parts.join(' · ')
    }

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
                            borderColor: showConversations ? 'rgba(253,135,56,0.24)' : 'rgba(255,255,255,0.08)',
                            backgroundColor: showConversations
                                ? 'rgba(253,135,56,0.12)'
                                : pressed
                                    ? 'rgba(255,255,255,0.10)'
                                    : 'rgba(255,255,255,0.05)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        })}
                    >
                        <Text style={{
                            ...T.text20,
                            color: theme.orange,
                            fontSize: 30,
                            lineHeight: 24,
                            fontWeight: '600',
                            marginTop: 7,
                            marginLeft: 1
                        }}>
                            ≡
                        </Text>
                    </Pressable>
                ]
            }
        } as any)
    }, [navigation, showConversations, theme.orange])

    return (
        <Swipe left='MenuScreen'>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: theme.darker, paddingTop: 100 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={{ ...GS.content, flex: 1, paddingBottom: 0 }}>
                    {ai.activeClient ? (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
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
                                    {ai.activeClient.name}
                                </Text>
                            </Pressable>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                ·
                            </Text>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {formatClientSubtitle(ai.activeClient)}
                            </Text>
                        </View>
                    ) : (
                        <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                            {ai.loading ? text.workspaceLoading : text.connectingFastest}
                        </Text>
                    )}
                    <Space height={14} />
                    {ai.loading && <ActivityIndicator color={theme.orange} />}
                    {ai.error && <Text style={{ ...T.centered15, color: 'red' }}>{ai.error}</Text>}

                    <Space height={14} />
                    <View style={{ flex: 1, minHeight: 0, paddingBottom: 108 + insets.bottom }}>
                        <AiMessageList session={ai.session} theme={theme} isLoggedIn={login} text={text} />
                    </View>
                    {showModels ? (
                        <AiModelPicker ai={ai} theme={theme} onClose={() => setShowModels(false)} />
                    ) : null}
                    {showConversations ? (
                        <AiConversationOverlay ai={ai} theme={theme} text={text} onClose={() => setShowConversations(false)} />
                    ) : null}
                    <View style={{
                        position: 'absolute',
                        left: 12,
                        right: 12,
                        bottom: 160 + insets.bottom,
                    }}>
                        <AiComposer
                            value={ai.input}
                            onChangeText={ai.setInput}
                            onSend={() => void ai.sendPrompt()}
                            theme={theme}
                            placeholder={text.composerPlaceholder}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Swipe>
    )
}
