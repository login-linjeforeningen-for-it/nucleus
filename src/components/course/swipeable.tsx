import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { View, Dimensions, Platform } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import CourseContent from './content'
import ReadOnly from './readonly'
import { CourseStackCard, getCourseCardHeight } from './swipeCards'

type CourseContentProps = {
    course: Course,
    clicked: number[],
    setClicked: Dispatch<SetStateAction<number[]>>
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * (Platform.OS === 'ios' ? 0.25 : 0.32)

export default function Swiper({ course, clicked, setClicked }: CourseContentProps) {
    const translateX = useSharedValue(0)
    const [cardID, setCardID] = useState<number>(0)
    const next = cardID + 1
    const previous = cardID - 1
    const startX = useSharedValue(0)

    if (!course.cards.length) {
        return <ReadOnly courseId={Number(course.id)} text={course.notes} />
    }

    function handlePrevious() {
        setClicked([])
        setCardID(previous >= 0 ? previous : cardID)
    }

    function handleNext() {
        setClicked([])
        setCardID(next < course.cards.length ? next : cardID)
    }

    function onSwipeRight() {
        handleNext()
    }

    function onSwipeLeft() {
        handlePrevious()
    }

    function finishSwipeRight() {
        onSwipeRight()
    }

    function finishSwipeLeft() {
        onSwipeLeft()
    }

    useEffect(() => {
        translateX.value = 0
        startX.value = 0
    }, [cardID, startX, translateX])

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            startX.value = translateX.value
        })
        .onUpdate((event) => {
            translateX.value = startX.value + event.translationX
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                translateX.value = withSpring(SCREEN_WIDTH + 10, {}, () => {
                    scheduleOnRN(finishSwipeRight)
                })
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withSpring(-SCREEN_WIDTH - 10, {}, () => {
                    scheduleOnRN(finishSwipeLeft)
                })
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

            const opacity = interpolate(
                translateX.value,
                [-SCREEN_WIDTH * 1.1, -SCREEN_WIDTH * 0.75, 0],
                [0, 0.1, 1],
            )

            return {
                width,
                opacity,
                transform: [{ translateY }],
            }
        }

        const rotate = `${(translateX.value / SCREEN_WIDTH) * 15}deg`
        const opacity = interpolate(
            translateX.value,
            [0, SCREEN_WIDTH * 0.75, SCREEN_WIDTH * 1.1],
            [1, 0.1, 0],
        )

        return {
            width: SCREEN_WIDTH * 0.95,
            opacity,
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
            height: getCourseCardHeight(SCREEN_HEIGHT),
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
            height: getCourseCardHeight(SCREEN_HEIGHT),
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
            height: getCourseCardHeight(SCREEN_HEIGHT),
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
            [SCREEN_WIDTH * 0.125, SCREEN_WIDTH * 2, SCREEN_WIDTH * 0.125],
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
            <CourseStackCard style={{
                width: SCREEN_WIDTH * 0.75,
                height: getCourseCardHeight(SCREEN_HEIGHT),
                top: 16,
            }} />

            {/* Forth card */}
            <CourseStackCard style={[{
                top: 12,
            }, animatedFourthCardStyle]} />

            {/* Third card */}
            <CourseStackCard style={[{
                top: 8,
            }, animatedThirdCardStyle]} />

            {/* Second card (next card) */}
            <CourseStackCard style={[{
                top: 4,
            }, animatedSecondCardStyle]}>
                <CourseContent
                    course={course}
                    clicked={clicked}
                    setClicked={setClicked}
                    cardID={cardID}
                    displayCardID={next < course.cards.length ? next : cardID}
                    setCardID={setCardID}
                    previous={previous}
                    next={next}
                    showFooter={false}
                />
            </CourseStackCard>

            {/* Top card (current card) */}
            <GestureDetector gesture={panGesture}>
                <CourseStackCard style={[{
                    height: getCourseCardHeight(SCREEN_HEIGHT),
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
                </CourseStackCard>
            </GestureDetector>

            {/* Previous (hidden) card */}
            {cardID !== 0 && <CourseStackCard style={[{
                left: SCREEN_WIDTH * 0.025,
                height: getCourseCardHeight(SCREEN_HEIGHT),
                width: SCREEN_WIDTH * 0.95,
            }, animatedHiddenCardStyle]} >
                <CourseContent
                    course={course}
                    clicked={clicked}
                    setClicked={setClicked}
                    cardID={cardID}
                    displayCardID={previous >= 0 ? previous : cardID}
                    setCardID={setCardID}
                    previous={previous}
                    next={next}
                    showFooter={false}
                />
            </CourseStackCard>}
        </View>
    )
}
