import { useState } from 'react'
import { View, Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { GameCardNumber, GameContent, GameStackCard } from './swiperCards'

type GameListContentProps = {
    game: Question[] | NeverHaveIEver[] | OkRedFlagDealBreaker[]
    mode: number
    school: boolean
    ntnu: boolean
}

type CategorizedGame = Question | NeverHaveIEver | OkRedFlagDealBreaker

type NavState = {
    dataIndex: number
    uxIndex: number
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25

export default function Swiper({ game, mode, school, ntnu }: GameListContentProps) {
    const translateX = useSharedValue(0)
    const totalCards = game.length
    const startX = useSharedValue(0)
    const [nav, setNav] = useState<NavState>({
        dataIndex: 0,
        uxIndex: 1
    })

    function navigate(direction: 'next' | 'prev') {
        setNav((prev) => {
            const currentIndex = prev.dataIndex
            const isForward = direction === 'next'

            function resolveNextIndex() {
                if (!Object.hasOwn(game[0], 'categories')) {
                    return isForward
                        ? currentIndex + 1
                        : Math.max(0, currentIndex - 1)
                }

                const step = isForward ? 1 : -1
                let i = currentIndex + step
                const boundary = isForward ? game.length : -1

                while (i !== boundary) {
                    const item = game[i] as CategorizedGame

                    if (mode === 0 && item.categories.includes('Wild')) {
                        i += step
                        continue
                    }

                    if (mode === 2 && !item.categories.includes('Wild')) {
                        i += step
                        continue
                    }

                    if (!school && item.categories.includes('School')) {
                        i += step
                        continue
                    }

                    if (!ntnu && item.categories.includes('NTNU')) {
                        i += step
                        continue
                    }

                    return i
                }

                return currentIndex
            }

            const nextIndex = resolveNextIndex()

            if (prev.uxIndex === 1 && !isForward) {
                return prev
            }

            if (!isForward) {
                return {
                    dataIndex: nextIndex,
                    uxIndex: isForward ? prev.uxIndex + 1 : Math.max(1, prev.uxIndex - 1),
                }
            } else {
                setTimeout(() => {
                    scheduleOnRN(() => {
                        setNav((prev) => ({
                            ...prev,
                            uxIndex: isForward
                                ? prev.uxIndex + 1
                                : Math.max(1, prev.uxIndex - 1),
                        }))
                    })
                }, 25)

                return {
                    ...prev,
                    dataIndex: nextIndex,
                }
            }
        })
    }

    function onSwipeRight() {
        navigate('next')
    }

    function onSwipeLeft() {
        navigate('prev')
    }

    function resetTranslateX() {
        setTimeout(() => {
            translateX.value = 0
        }, 25)
    }

    function resetTranslateX200ms() {
        setTimeout(() => {
            translateX.value = 0
        }, 200)
    }

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            startX.value = translateX.value
        })
        .onUpdate((event) => {
            translateX.value = startX.value + event.translationX
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                scheduleOnRN(onSwipeRight)
                scheduleOnRN(resetTranslateX)
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withSpring(-SCREEN_WIDTH - 10, {}, () => {
                    scheduleOnRN(onSwipeLeft)
                })

                scheduleOnRN(resetTranslateX200ms)
            } else {
                translateX.value = withSpring(0)
            }
        })

    // Animated styles for the top card (current card)
    const animatedStyle = useAnimatedStyle(() => {
        if (translateX.value < 0) {
            const translateY = interpolate(
                translateX.value,
                [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                [10, 0, 10],
            )

            const width = interpolate(
                translateX.value,
                [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                [SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.85, SCREEN_WIDTH * 0.8],
            )

            return {
                width,
                transform: [{ translateY }],
            }
        }

        const rotate = `${(translateX.value / SCREEN_WIDTH) * 15}deg`

        return {
            top: SCREEN_HEIGHT * 0.16,
            width: SCREEN_WIDTH * 0.85,
            transform: [
                { translateX: translateX.value },
                { rotate }
            ]
        }
    })

    // Animated styles for the second card in the stack
    const animatedSecondCardStyle = useAnimatedStyle(() => {
        if (translateX.value < 0) {
            const translateY = interpolate(
                translateX.value,
                [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                [10, 0, 10]
            )

            const width = interpolate(
                translateX.value,
                [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                [SCREEN_WIDTH * 0.75, SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.75]
            )

            return {
                width,
                transform: [{ translateY }]
            }
        }

        const translateY = interpolate(
            translateX.value,
            [SCREEN_HEIGHT * 0.45, 0, SCREEN_HEIGHT * 0.45],
            [-9, 0, -9]
        )

        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.845, SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.845],
        )

        return {
            width,
            height: SCREEN_HEIGHT * 0.45,
            transform: [{ translateY }],
        }
    })

    // Animated styles for the third card
    const animatedThirdCardStyle = useAnimatedStyle(() => {
        if (translateX.value < 0) {
            const translateY = interpolate(
                translateX.value,
                [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                [10, 0, 10],
            )

            const width = interpolate(
                translateX.value,
                [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                [SCREEN_WIDTH * 0.7, SCREEN_WIDTH * 0.75, SCREEN_WIDTH * 0.7],
            )

            return {
                width,
                transform: [{ translateY }],
            }
        }

        const translateY = interpolate(
            translateX.value,
            [SCREEN_HEIGHT * 0.45, 0, SCREEN_HEIGHT * 0.45],
            [-9, 0, -9],
        )

        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.75, SCREEN_WIDTH * 0.8],
        )

        return {
            width,
            height: SCREEN_HEIGHT * 0.45,
            transform: [{ translateY }],
        }
    })

    // Animated styles for the fourth card
    const animatedFourthCardStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [-10, 0, -10],
        )

        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.75, SCREEN_WIDTH * 0.7, SCREEN_WIDTH * 0.75],
        )

        return {
            width,
            height: SCREEN_HEIGHT * 0.45,
            transform: [{ translateY }],
        }
    })

    const animatedHiddenCardStyle = useAnimatedStyle(() => {
        if (translateX.value > 0) {
            return {}
        }

        const left = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [0, SCREEN_WIDTH * 1.1, 0],
        )

        const rotation = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [0, 15, 0],
        )

        return {
            width: SCREEN_WIDTH * 0.85,
            left,
            transform: [{ rotate: `${rotation + 0.5}deg` }],
        }
    })

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Fifth card */}
            <GameStackCard style={{
                top: SCREEN_HEIGHT * 0.16 + 30,
                width: SCREEN_WIDTH * 0.7,
                height: SCREEN_HEIGHT * 0.45,
            }} />

            {/* Forth card */}
            <GameStackCard style={[{
                top: SCREEN_HEIGHT * 0.16 + 30,
            }, animatedFourthCardStyle]} />

            {/* Third card */}
            <GameStackCard style={[{
                top: SCREEN_HEIGHT * 0.16 + 20,
            }, animatedThirdCardStyle]} />

            {/* Second card (next card) */}
            <GameStackCard style={[{
                top: SCREEN_HEIGHT * 0.16 + 10,
                padding: 16,
            }, animatedSecondCardStyle]}>
                <GameCardNumber value={nav.uxIndex + 1} />
                <GameContent game={game[(nav.dataIndex + 1) % totalCards]} />
            </GameStackCard>

            {/* Top card (current card) */}
            <GestureDetector gesture={panGesture}>
                <GameStackCard style={[{
                    top: SCREEN_HEIGHT * 0.16,
                    height: SCREEN_HEIGHT * 0.45,
                    padding: 16,
                }, animatedStyle]}>
                    <GameCardNumber value={nav.uxIndex} />
                    <GameContent game={game[nav.dataIndex]} />
                </GameStackCard>
            </GestureDetector>

            {/* Previous (hidden) card */}
            {nav.dataIndex > 0 && <GameStackCard style={[{
                top: SCREEN_HEIGHT * 0.16,
                width: SCREEN_WIDTH * 0.85,
                height: SCREEN_HEIGHT * 0.45,
                padding: 16,
            }, animatedHiddenCardStyle]} >
                <GameCardNumber value={nav.uxIndex - 1} />
                <GameContent game={game[Math.max(0, nav.dataIndex - 1)]} />
            </GameStackCard>}
        </View>
    )
}
