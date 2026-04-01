import T from '@styles/text'
import { useEffect, useState } from 'react'
import { Text, View, Dimensions, StyleProp, TextStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { useSelector } from 'react-redux'

type GameListContentProps = {
    game: Question[] | NeverHaveIEver[] | OkRedFlagDealBreaker[]
    mode: number
    school: boolean
    ntnu: boolean
}

type GameContentProps = {
    game: Question | NeverHaveIEver | OkRedFlagDealBreaker
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25

export default function Swiper({ game, mode, school, ntnu }: GameListContentProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [currentIndex, setCurrentIndex] = useState(0)
    const translateX = useSharedValue(0)
    const totalCards = game.length
    const startX = useSharedValue(0)
    const [uxIndex, setUxIndex] = useState(1)
    const textStyle: StyleProp<TextStyle> = {
        position: 'absolute',
        bottom: 15,
        left: 15,
        ...T.text20,
        color: theme.orange,
        fontWeight: '600'
    }
    const cardStyle: StyleProp<TextStyle> = {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.contrast,
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    }

    // Function to calculate previous index in a circular manner
    function getPreviousIndex(currentIndex: number) {
        if (!game[0].hasOwnProperty('categories')) {
            if (currentIndex <= 0) {
                return currentIndex
            }

            return currentIndex - 1
        }

        if (currentIndex > 0) {
            // Skip questions based on mode and category
            if (mode === 0) {
                for (let i = currentIndex - 1; i >= 0; i--) {
                    if (i < 0) {
                        return 0
                    }
                    // @ts-expect-error
                    if (!game[i].categories.includes('Wild')) {
                        return i
                    }
                }
            }

            if (mode === 2) {
                for (let i = currentIndex - 1; i >= 0; i--) {
                    if (i < 0) {
                        return 0
                    }
                    // @ts-expect-error
                    if (game[i].categories.includes('Wild')) {
                        return i
                    }
                }
            }

            if (!school) {
                for (let i = currentIndex - 1; i < game.length; i--) {
                    if (i < 0) {
                        return 0
                    }
                    // @ts-expect-error
                    if (!game[i].categories.includes('School')) {
                        return i
                    }
                }
            }

            if (!ntnu) {
                for (let i = currentIndex - 1; i < game.length; i--) {
                    if (i < 0) {
                        return 0
                    }
                    // @ts-expect-error
                    if (!game[i].categories.includes('NTNU')) {
                        return i
                    }
                }
            }

            return currentIndex - 1
        }

        return 0
    }

    function onSwipeRight() {
        const { nextIndex, shouldAdvanceUx } = getNextState(currentIndex)

        setCurrentIndex(nextIndex)

        if (shouldAdvanceUx) {
            setUxIndex((prev) => prev + 1)
        }
    }

    function onSwipeLeft() {
        const { nextIndex, shouldDecreaseUx } = getPreviousState(currentIndex)

        setCurrentIndex(nextIndex)

        if (shouldDecreaseUx) {
            setUxIndex((prev) => Math.max(1, prev - 1))
        }
    }

    function resetTranslateX() {
        setTimeout(() => {
            translateX.value = 0
        }, 50)
    }

    function resetTranslateX200ms() {
        setTimeout(() => {
            translateX.value = 0
        }, 200)
    }

    function getNextState(currentIndex: number) {
        let nextIndex = currentIndex

        if (!game[0].hasOwnProperty('categories')) {
            nextIndex = currentIndex + 1
            return { nextIndex, shouldAdvanceUx: true }
        }

        // Mode + category filtering (forward scan)
        if (mode === 0) {
            for (let i = currentIndex + 1; i < game.length; i++) {
                // @ts-expect-error
                if (!game[i].categories.includes('Wild')) {
                    return { nextIndex: i, shouldAdvanceUx: true }
                }
            }
        }

        if (mode === 2) {
            for (let i = currentIndex + 1; i < game.length; i++) {
                // @ts-expect-error
                if (game[i].categories.includes('Wild')) {
                    return { nextIndex: i, shouldAdvanceUx: true }
                }
            }
        }

        if (!school) {
            for (let i = currentIndex + 1; i < game.length; i++) {
                // @ts-expect-error
                if (!game[i].categories.includes('School')) {
                    return { nextIndex: i, shouldAdvanceUx: true }
                }
            }
        }

        if (!ntnu) {
            for (let i = currentIndex + 1; i < game.length; i++) {
                // @ts-expect-error
                if (!game[i].categories.includes('NTNU')) {
                    return { nextIndex: i, shouldAdvanceUx: true }
                }
            }
        }

        if (mode === 1) {
            return { nextIndex: currentIndex + 1, shouldAdvanceUx: true }
        }

        return { nextIndex: currentIndex, shouldAdvanceUx: false }
    }

    function getPreviousState(currentIndex: number) {
        if (!game[0].hasOwnProperty('categories')) {
            const prev = currentIndex <= 0 ? 0 : currentIndex - 1
            return { nextIndex: prev, shouldDecreaseUx: currentIndex > 0 }
        }

        if (currentIndex <= 0) {
            return { nextIndex: 0, shouldDecreaseUx: false }
        }

        if (mode === 0) {
            for (let i = currentIndex - 1; i >= 0; i--) {
                // @ts-expect-error
                if (!game[i].categories.includes('Wild')) {
                    return { nextIndex: i, shouldDecreaseUx: true }
                }
            }
        }

        if (mode === 2) {
            for (let i = currentIndex - 1; i >= 0; i--) {
                // @ts-expect-error
                if (game[i].categories.includes('Wild')) {
                    return { nextIndex: i, shouldDecreaseUx: true }
                }
            }
        }

        if (!school) {
            for (let i = currentIndex - 1; i >= 0; i--) {
                // @ts-expect-error
                if (!game[i].categories.includes('School')) {
                    return { nextIndex: i, shouldDecreaseUx: true }
                }
            }
        }

        if (!ntnu) {
            for (let i = currentIndex - 1; i >= 0; i--) {
                // @ts-expect-error
                if (!game[i].categories.includes('NTNU')) {
                    return { nextIndex: i, shouldDecreaseUx: true }
                }
            }
        }

        return { nextIndex: currentIndex - 1, shouldDecreaseUx: true }
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

    useEffect(() => {
        setUxIndex(1)
    }, [mode, school, ntnu, game])

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Fifth card */}
            <Animated.View style={[{
                position: 'absolute',
                width: SCREEN_WIDTH * 0.7,
                height: SCREEN_HEIGHT * 0.45,
                top: SCREEN_HEIGHT * 0.16 + 30,
                ...cardStyle,
            }]} />

            {/* Forth card */}
            <Animated.View style={[{
                position: 'absolute',
                top: SCREEN_HEIGHT * 0.16 + 30,
                ...cardStyle,
            }, animatedFourthCardStyle]} />

            {/* Third card */}
            <Animated.View style={[{
                position: 'absolute',
                top: SCREEN_HEIGHT * 0.16 + 20,
                ...cardStyle,
            }, animatedThirdCardStyle]} />

            {/* Second card (next card) */}
            <Animated.View style={[{
                position: 'absolute',
                top: SCREEN_HEIGHT * 0.16 + 10,
                ...cardStyle,
                padding: 16,
            }, animatedSecondCardStyle]}>
                <Text style={textStyle}>
                    {uxIndex + 1}
                </Text>
                <GameContent game={game[(currentIndex) % totalCards]} />
            </Animated.View>

            {/* Top card (current card) */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{
                    ...cardStyle,
                    padding: 16,
                    height: SCREEN_HEIGHT * 0.45,
                    top: SCREEN_HEIGHT * 0.16,
                }, animatedStyle]}>
                    <Text style={textStyle}>
                        {uxIndex}
                    </Text>
                    <GameContent game={game[currentIndex]} />
                </Animated.View>
            </GestureDetector>

            {/* Previous (hidden) card */}
            {currentIndex > 0 && <Animated.View style={[{
                position: 'absolute',
                ...cardStyle,
                padding: 16,
                height: SCREEN_HEIGHT * 0.45,
                top: SCREEN_HEIGHT * 0.16,
                width: SCREEN_WIDTH * 0.85,
            }, animatedHiddenCardStyle]} >
                <Text style={{ ...textStyle }}>
                    {getPreviousIndex(currentIndex + 1)}
                </Text>
                <GameContent game={ game[getPreviousIndex(currentIndex + 1)] } />
            </Animated.View>}
        </View>
    )
}

function GameContent({ game }: GameContentProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View>
            <Text style={{ color: theme.textColor, ...T.text20, margin: 8 }}>
                {lang ? game?.title_no : game?.title_en}
            </Text>
        </View>
    )
}
