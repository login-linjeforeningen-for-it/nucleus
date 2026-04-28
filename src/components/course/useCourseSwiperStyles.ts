import { getCourseCardHeight } from './swipeCards'
import { Dimensions, Platform } from 'react-native'
import {
    SharedValue,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated'

export const { width: SCREEN_WIDTH } = Dimensions.get('window')
export const { height: SCREEN_HEIGHT } = Dimensions.get('window')
export const COURSE_CARD_HEIGHT = getCourseCardHeight(SCREEN_HEIGHT)
export const SWIPE_THRESHOLD = SCREEN_WIDTH * (Platform.OS === 'ios' ? 0.25 : 0.32)

export function useCourseSwiperStyles(translateX: SharedValue<number>) {
    const topCard = useAnimatedStyle(() => {
        if (translateX.value < 0) {
            const translateY = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [10, 0, 10])
            const width = interpolate(
                translateX.value,
                [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                [SCREEN_WIDTH * 0.9, SCREEN_WIDTH * 0.95, SCREEN_WIDTH * 0.9],
            )
            const opacity = interpolate(translateX.value, [-SCREEN_WIDTH * 1.1, -SCREEN_WIDTH * 0.75, 0], [0, 0.1, 1])

            return {
                width,
                opacity,
                transform: [{ translateY }],
            }
        }

        const rotate = `${(translateX.value / SCREEN_WIDTH) * 15}deg`
        const opacity = interpolate(translateX.value, [0, SCREEN_WIDTH * 0.75, SCREEN_WIDTH * 1.1], [1, 0.1, 0])

        return {
            width: SCREEN_WIDTH * 0.95,
            opacity,
            transform: [
                { translateX: translateX.value },
                { rotate },
            ],
        }
    })

    const secondCard = useAnimatedStyle(() => {
        if (translateX.value < 0) {
            const translateY = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [10, 0, 10])
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

        const translateY = interpolate(translateX.value, [SCREEN_HEIGHT * 0.45, 0, SCREEN_HEIGHT * 0.45], [-3.5, 0, -3.5])
        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.94, SCREEN_WIDTH * 0.9, SCREEN_WIDTH * 0.94],
        )

        return {
            width,
            height: COURSE_CARD_HEIGHT,
            transform: [{ translateY }],
        }
    })

    const thirdCard = useAnimatedStyle(() => {
        if (translateX.value < 0) {
            const translateY = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [10, 0, 10])
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

        const translateY = interpolate(translateX.value, [SCREEN_HEIGHT * 0.45, 0, SCREEN_HEIGHT * 0.45], [-3.5, 0, -3.5])
        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.9, SCREEN_WIDTH * 0.85, SCREEN_WIDTH * 0.9],
        )

        return {
            width,
            height: COURSE_CARD_HEIGHT,
            transform: [{ translateY }],
        }
    })

    const fourthCard = useAnimatedStyle(() => {
        const translateY = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-3.5, 0, -3.5])
        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.85, SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.85],
        )

        return {
            width,
            height: COURSE_CARD_HEIGHT,
            transform: [{ translateY }],
        }
    })

    const hiddenCard = useAnimatedStyle(() => {
        if (translateX.value > 0) {
            return {}
        }

        const left = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.125, SCREEN_WIDTH * 2, SCREEN_WIDTH * 0.125],
        )
        const rotation = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [0, 15, 0])

        return {
            width: SCREEN_WIDTH * 0.85,
            left,
            transform: [{ rotate: `${rotation + 0.5}deg` }],
        }
    })

    return { fourthCard, hiddenCard, secondCard, thirdCard, topCard }
}
