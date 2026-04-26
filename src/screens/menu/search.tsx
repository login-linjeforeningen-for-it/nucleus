import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { buildSearchEngineUrl, decodeSearchAnimationToken } from '@utils/discoveryApi'
import Clipboard from '@react-native-clipboard/clipboard'
import { JSX, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Animated, Dimensions, Easing, Linking, TextInput, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

type Engine = 'brave' | 'google' | 'duckduckgo'

function formatEngineLabel(value: Engine) {
    switch (value) {
        case 'duckduckgo':
            return 'Duck Duck Go'
        case 'google':
            return 'Google'
        default:
            return 'Brave'
    }
}

export default function SearchScreen({ route }: MenuProps<'SearchScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').search : require('@text/en.json').search
    const screenTitle = lang ? require('@text/no.json').screens.SearchScreen : require('@text/en.json').screens.SearchScreen
    const [query, setQuery] = useState('')
    const [engine, setEngine] = useState<Engine>('brave')
    const [typedQuery, setTypedQuery] = useState('')
    const [stage, setStage] = useState<'idle' | 'typing' | 'opening'>('idle')
    const pulse = useRef(new Animated.Value(1)).current
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

    const link = useMemo(() => {
        if (!query.trim()) {
            return ''
        }

        return buildSearchEngineUrl(query.trim(), engine)
    }, [engine, query])

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1.04,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        )

        animation.start()
        return () => animation.stop()
    }, [pulse])

    useEffect(() => () => {
        timersRef.current.forEach(timer => clearTimeout(timer))
        timersRef.current = []
    }, [])

    async function copyLink() {
        if (!link) {
            Alert.alert(text.missingQueryTitle, text.missingQueryBody)
            return
        }

        Clipboard.setString(link)
        Alert.alert(text.copiedTitle, text.copiedBody)
    }

    function startPlayback(nextQuery: string, nextEngine: Engine) {
        const nextLink = buildSearchEngineUrl(nextQuery, nextEngine)

        if (!nextLink) {
            Alert.alert(text.missingQueryTitle, text.missingQueryBody)
            return
        }

        timersRef.current.forEach(timer => clearTimeout(timer))
        timersRef.current = []
        setTypedQuery('')
        setStage('typing')

        const letters = Array.from(nextQuery.trim())

        function step(index: number) {
            setTypedQuery(letters.slice(0, index).join(''))

            if (index <= letters.length) {
                const timer = setTimeout(() => step(index + 1), 34)
                timersRef.current.push(timer)
                return
            }

            setStage('opening')
            const timer = setTimeout(() => {
                void Linking.openURL(nextLink)
                setStage('idle')
            }, 500)
            timersRef.current.push(timer)
        }

        const timer = setTimeout(() => step(1), 120)
        timersRef.current.push(timer)
    }

    async function openLink() {
        if (!link) {
            Alert.alert(text.missingQueryTitle, text.missingQueryBody)
            return
        }

        startPlayback(query, engine)
    }

    useEffect(() => {
        if (!route.params?.s) {
            return
        }

        const payload = decodeSearchAnimationToken(route.params.s)
        if (!payload) {
            Alert.alert(text.missingQueryTitle, text.missingQueryBody)
            return
        }

        setQuery(payload.query)
        setEngine(payload.engine)
        startPlayback(payload.query, payload.engine)
    }, [route.params?.s])

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <View style={{ ...GS.content, paddingHorizontal: 12 }}>
                    <Space height={Dimensions.get('window').height / 8} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>
                                {screenTitle}
                            </Text>
                            <Space height={8} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {text.intro}
                            </Text>
                        </View>
                    </Cluster>
                    <Space height={12} />
                    <Cluster>
                        <View style={{ padding: 12, gap: 12 }}>
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder={text.placeholder}
                                placeholderTextColor={theme.oppositeTextColor}
                                style={{
                                    color: theme.textColor,
                                    borderWidth: 1,
                                    borderColor: '#ffffff18',
                                    borderRadius: 16,
                                    backgroundColor: '#ffffff08',
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                    fontSize: 16,
                                }}
                            />
                            <View style={{
                                flexDirection: 'row',
                                gap: 8,
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                            }}>
                                {(['brave', 'google', 'duckduckgo'] as Engine[]).map((value) => (
                                    <TouchableOpacity key={value} onPress={() => setEngine(value)}>
                                        <Cluster style={{
                                            backgroundColor: value === engine
                                                ? theme.orangeTransparentHighlighted
                                                : theme.orangeTransparent,
                                            borderWidth: 1,
                                            borderColor: value === engine
                                                ? theme.orangeTransparentBorderHighlighted
                                                : theme.orangeTransparentBorder,
                                        }}>
                                            <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                                    {formatEngineLabel(value)}
                                                </Text>
                                            </View>
                                        </Cluster>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Animated.View style={{ transform: [{ scale: pulse }] }}>
                                <Cluster style={{
                                    borderWidth: 1,
                                    borderColor: theme.orangeTransparentBorder,
                                    backgroundColor: theme.orangeTransparent,
                                }}>
                                    <TouchableOpacity onPress={() => void openLink()}>
                                        <View style={{ padding: 14 }}>
                                            <Text style={{ ...T.centered20, color: theme.textColor }}>
                                                {stage === 'typing'
                                                    ? typedQuery || text.typingFallback
                                                    : stage === 'opening'
                                                        ? text.opening
                                                        : text.openAnimation}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </Cluster>
                            </Animated.View>
                            {!!link && (
                                <TouchableOpacity onPress={() => void copyLink()}>
                                    <Cluster style={{
                                        borderWidth: 1,
                                        borderColor: '#ffffff12',
                                        backgroundColor: '#ffffff08',
                                    }}>
                                        <View style={{ padding: 12 }}>
                                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                {text.tapToCopy}
                                            </Text>
                                            <Space height={4} />
                                            <Text style={{ ...T.text15, color: theme.textColor }}>
                                                {link}
                                            </Text>
                                        </View>
                                    </Cluster>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Cluster>
                </View>
            </View>
        </Swipe>
    )
}
