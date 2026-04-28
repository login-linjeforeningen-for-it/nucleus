import { Dispatch, SetStateAction, useEffect } from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import CourseContent from './content'
import ReadOnly from './readonly'
import { CourseStackCard } from './swipeCards'
import { useCourseSwiperNavigation } from './useCourseSwiperNavigation'
import {
    COURSE_CARD_HEIGHT,
    SCREEN_WIDTH,
    SWIPE_THRESHOLD,
    useCourseSwiperStyles,
} from './useCourseSwiperStyles'

type CourseContentProps = {
    course: Course,
    clicked: number[],
    setClicked: Dispatch<SetStateAction<number[]>>
}

export default function Swiper({ course, clicked, setClicked }: CourseContentProps) {
    const translateX = useSharedValue(0)
    const { cardID, setCardID, handleNext, handlePrevious } = useCourseSwiperNavigation(course.cards.length, setClicked)
    const next = cardID + 1
    const previous = cardID - 1
    const startX = useSharedValue(0)

    if (!course.cards.length) {
        return <ReadOnly courseId={Number(course.id)} text={course.notes} />
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

    const styles = useCourseSwiperStyles(translateX)

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
                height: COURSE_CARD_HEIGHT,
                top: 16,
            }} />

            {/* Forth card */}
            <CourseStackCard style={[{
                top: 12,
            }, styles.fourthCard]} />

            {/* Third card */}
            <CourseStackCard style={[{
                top: 8,
            }, styles.thirdCard]} />

            {/* Second card (next card) */}
            <CourseStackCard style={[{
                top: 4,
            }, styles.secondCard]}>
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
                    height: COURSE_CARD_HEIGHT,
                }, styles.topCard]}>
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
                height: COURSE_CARD_HEIGHT,
                width: SCREEN_WIDTH * 0.95,
            }, styles.hiddenCard]} >
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
