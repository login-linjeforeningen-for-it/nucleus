import Space from '@/components/shared/utils'
import { ChatMenu, ModelMenu } from '@/components/menu/ai/menus'
import AiComposer from '@components/menu/ai/composer'
import AiMessageList from '@components/menu/ai/messageList'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import { JSX, useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Keyboard,
    KeyboardEvent,
    Pressable,
    View,
    useWindowDimensions
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import useAiChat from '@components/ai/chat'
import { Sparkles } from 'lucide-react-native'

export default function AiScreen({ navigation }: MenuProps<'AiScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login } = useSelector((state: ReduxState) => state.login)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').ai : require('@text/en.json').ai
    const insets = useSafeAreaInsets()
    const { height } = useWindowDimensions()
    const [showConversations, setShowConversations] = useState(false)
    const [showModels, setShowModels] = useState(false)
    const [keyboardLift, setKeyboardLift] = useState(0)
    const ai = useAiChat(text)
    const composerBottom = useMemo(
        () => keyboardLift > 0 ? keyboardLift + 12 : 60 + insets.bottom,
        [insets.bottom, keyboardLift]
    )
    const messageBottomInset = keyboardLift > 0 ? 108 : 88

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
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            borderWidth: 1,
                            borderColor: theme.greyTransparentBorder,
                            backgroundColor: pressed ? theme.greyTransparentBorder : theme.greyTransparent,
                            alignItems: 'center',
                            justifyContent: 'center',
                        })}
                    >
                        <Sparkles
                            height={20}
                            color={showConversations ? theme.orange : '#555'}
                        />
                    </Pressable>
                ]
            }
        } as any)
    }, [
        navigation,
        showConversations,
        theme.greyTransparent,
        theme.greyTransparentBorder,
        theme.orange,
    ])

    useEffect(() => {
        function handleKeyboardShow(event: KeyboardEvent) {
            const visibleLift = Math.max(0, height - event.endCoordinates.screenY)
            setKeyboardLift(Math.max(visibleLift, event.endCoordinates.height || 0))
        }

        const willShowSubscription = Keyboard.addListener('keyboardWillShow', handleKeyboardShow)
        const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardShow)
        const willHideSubscription = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardLift(0)
        })
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardLift(0)
        })

        return () => {
            willShowSubscription.remove()
            showSubscription.remove()
            willHideSubscription.remove()
            hideSubscription.remove()
        }
    }, [height])

    return (
        <Swipe left='MenuScreen'>
            <View
                style={{ flex: 1, backgroundColor: theme.darker, paddingTop: 108 }}
            >
                <View style={{ ...GS.content, flex: 1, minHeight: 0, paddingBottom: 0 }}>
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
                    {ai.loading && <Space height={14} />}
                    <AiMessageList
                        session={ai.session}
                        theme={theme}
                        isLoggedIn={login}
                        bottomInset={messageBottomInset}
                        text={text}
                    />
                    {showModels ? (
                        <ModelMenu ai={ai} theme={theme} onClose={() => setShowModels(false)} />
                    ) : null}
                    {showConversations ? (
                        <ChatMenu ai={ai} theme={theme} text={text} onClose={() => setShowConversations(false)} />
                    ) : null}
                    <View style={{
                        position: 'absolute',
                        left: 12,
                        right: 12,
                        bottom: composerBottom,
                    }}>
                        <AiComposer
                            value={ai.input}
                            onChangeText={ai.setInput}
                            onSend={() => ai.sendPrompt()}
                            theme={theme}
                            placeholder={text.composerPlaceholder}
                            autoFocus
                        />
                    </View>
                </View>
            </View>
        </Swipe>
    )
}
