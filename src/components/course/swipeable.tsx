import { Dispatch, SetStateAction, useState } from 'react'
import { View, Dimensions, Platform } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { useSelector } from 'react-redux'
import CourseContent from './content'
import ReadOnly from './readonly'

type CourseContentProps = {
    course: Course,
    clicked: number[],
    setClicked: Dispatch<SetStateAction<number[]>>
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25

export default function Swiper({ course, clicked, setClicked }: CourseContentProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [currentIndex, setCurrentIndex] = useState(0)
    const translateX = useSharedValue(0)
    const [cardID, setCardID] = useState<number>(0)
    const next = cardID + 1
    const previous = cardID - 1
    const startX = useSharedValue(0)

    if (!course.cards.length) {
        return <ReadOnly text={course.notes} />
    }

    function handlePrevious() {
        setClicked([])
        setCardID(previous >= 0 ? previous : cardID)
    }

    function handleNext() {
        setClicked([])
        setCardID(next < course.cards.length ? next : cardID)
    }

    // Function to calculate next index
    function getNextIndex(currentIndex: number) {
        if (currentIndex < course.cards.length - 1) {
            return currentIndex + 1
        }

        return currentIndex
    }

    function getPreviousIndex(currentIndex: number) {
        if (currentIndex > 0) {
            return currentIndex - 1
        }

        return 0
    }

    function onSwipeRight() {
        setCurrentIndex(getNextIndex(currentIndex))
        handleNext()
    }

    function onSwipeLeft() {
        setCurrentIndex(getPreviousIndex(currentIndex))
        handlePrevious()
    }

    function resetTranslateX() {
        setTimeout(() => {
            translateX.value = 0
        }, 400)
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
                [SCREEN_WIDTH * 0.9, SCREEN_WIDTH * 0.95, SCREEN_WIDTH * 0.9],
            )

            return {
                width,
                transform: [{ translateY }],
            }
        }

        const rotate = `${(translateX.value / SCREEN_WIDTH) * 15}deg`

        return {
            width: SCREEN_WIDTH * 0.95,
            transform: [
                { translateX: translateX.value },
                { rotate: rotate },
            ],
        }
    })

    // Animated styles for the second card in the stack
    const animatedSecondCardStyle = useAnimatedStyle(() => {
        if (translateX.value < 0) {
            const translateY = interpolate(
                translateX.value,
                [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                [10, 0, 10],
            )

            const width = interpolate(
                translateX.value,
                [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                [SCREEN_WIDTH * 0.85, SCREEN_WIDTH * 0.9, SCREEN_WIDTH * 0.85],
            )

            return {
                width,
                transform: [{ translateY }],
            }
        }

        const translateY = interpolate(
            translateX.value,
            [SCREEN_HEIGHT * 0.45, 0, SCREEN_HEIGHT * 0.45],
            [-3.5, 0, -3.5],
        )

        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.94, SCREEN_WIDTH * 0.9, SCREEN_WIDTH * 0.94],
        )

        return {
            width,
            height: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.75
                : SCREEN_HEIGHT * (SCREEN_HEIGHT === 592 ? 0.72
                    : SCREEN_HEIGHT >= 592 && SCREEN_HEIGHT < 700 ? 0.76
                        : SCREEN_HEIGHT > 800 && SCREEN_HEIGHT <= 900 ? 0.8
                            : SCREEN_HEIGHT > 900 ? 0.77 : 0.75),
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
                [SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.85, SCREEN_WIDTH * 0.8],
            )

            return {
                width,
                transform: [{ translateY }],
            }
        }

        const translateY = interpolate(
            translateX.value,
            [SCREEN_HEIGHT * 0.45, 0, SCREEN_HEIGHT * 0.45],
            [-3.5, 0, -3.5],
        )

        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.9, SCREEN_WIDTH * 0.85, SCREEN_WIDTH * 0.9],
        )

        return {
            width,
            height: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.75
                : SCREEN_HEIGHT * (SCREEN_HEIGHT === 592 ? 0.72
                    : SCREEN_HEIGHT >= 592 && SCREEN_HEIGHT < 700 ? 0.76
                        : SCREEN_HEIGHT > 800 && SCREEN_HEIGHT <= 900 ? 0.8
                            : SCREEN_HEIGHT > 900 ? 0.77 : 0.75),
            transform: [{ translateY }],
        }
    })

    // Animated styles for the fourth card
    const animatedFourthCardStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [-3.5, 0, -3.5],
        )

        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.85, SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.85],
        )

        return {
            width,
            height: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.75
                : SCREEN_HEIGHT * (SCREEN_HEIGHT === 592 ? 0.72
                    : SCREEN_HEIGHT >= 592 && SCREEN_HEIGHT < 700 ? 0.76
                        : SCREEN_HEIGHT > 800 && SCREEN_HEIGHT <= 900 ? 0.8
                            : SCREEN_HEIGHT > 900 ? 0.77 : 0.75),
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
            [0, SCREEN_WIDTH * 1.2, 0],
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
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            marginBottom: 10,
            paddingBottom: 10
        }}>
            {/* Fifth card */}
            <Animated.View style={[{
                position: 'absolute',
                width: SCREEN_WIDTH * 0.75,
                height: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.75
                    : SCREEN_HEIGHT * (SCREEN_HEIGHT === 592 ? 0.72
                        : SCREEN_HEIGHT >= 592 && SCREEN_HEIGHT < 700 ? 0.76
                            : SCREEN_HEIGHT > 800 && SCREEN_HEIGHT <= 900 ? 0.8
                                : SCREEN_HEIGHT > 900 ? 0.77 : 0.75),
                top: 16,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.contrast,
                borderRadius: 20,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            }]} />

            {/* Forth card */}
            <Animated.View style={[{
                position: 'absolute',
                top: 12,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.contrast,
                borderRadius: 20,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            }, animatedFourthCardStyle]} />

            {/* Third card */}
            <Animated.View style={[{
                position: 'absolute',
                top: 8,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.contrast,
                borderRadius: 20,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            }, animatedThirdCardStyle]} />

            {/* Second card (next card) */}
            <Animated.View style={[{
                position: 'absolute',
                top: 4,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.contrast,
                borderRadius: 20,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            }, animatedSecondCardStyle]}>
                <CourseContent
                    course={course}
                    clicked={clicked}
                    setClicked={setClicked}
                    cardID={cardID}
                    setCardID={setCardID}
                    previous={previous}
                    next={next}
                />
            </Animated.View>

            {/* Top card (current card) */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.contrast,
                    borderRadius: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 10,
                    height: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.75
                        : SCREEN_HEIGHT * (SCREEN_HEIGHT === 592 ? 0.72
                            : SCREEN_HEIGHT >= 592 && SCREEN_HEIGHT < 700 ? 0.76
                                : SCREEN_HEIGHT > 800 && SCREEN_HEIGHT <= 900 ? 0.8
                                    : SCREEN_HEIGHT > 900 ? 0.77 : 0.75),
                }, animatedStyle]}>
                    <CourseContent
                        course={course}
                        clicked={clicked}
                        setClicked={setClicked}
                        cardID={cardID}
                        setCardID={setCardID}
                        previous={previous}
                        next={next}
                    />
                </Animated.View>
            </GestureDetector>

            {/* Previous (hidden) card */}
            {cardID !== 0 && <Animated.View style={[{
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.contrast,
                borderRadius: 20,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                height: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.75
                    : SCREEN_HEIGHT * (SCREEN_HEIGHT === 592 ? 0.72
                        : SCREEN_HEIGHT >= 592 && SCREEN_HEIGHT < 700 ? 0.76
                            : SCREEN_HEIGHT > 800 && SCREEN_HEIGHT <= 900 ? 0.8
                                : SCREEN_HEIGHT > 900 ? 0.77 : 0.75),
                width: SCREEN_WIDTH * 0.95,
            }, animatedHiddenCardStyle]} >
                <CourseContent
                    course={course}
                    clicked={clicked}
                    setClicked={setClicked}
                    cardID={cardID}
                    setCardID={setCardID}
                    previous={previous}
                    next={next}
                />
            </Animated.View>}
        </View>
    )
}
