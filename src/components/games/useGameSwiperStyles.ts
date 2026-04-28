import {
    SharedValue,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated'
import { Dimensions } from 'react-native'

export const { width: SCREEN_WIDTH } = Dimensions.get('window')
export const { height: SCREEN_HEIGHT } = Dimensions.get('window')
export const GAME_CARD_TOP = SCREEN_HEIGHT * 0.16
export const GAME_CARD_HEIGHT = SCREEN_HEIGHT * 0.45
export const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25

export function useGameSwiperStyles(translateX: SharedValue<number>) {
    const topCard = useAnimatedStyle(() => {
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

        const rotate = `${(translateX.value / SCREEN_WIDTH) * 15}deg`

        return {
            top: GAME_CARD_TOP,
            width: SCREEN_WIDTH * 0.85,
            transform: [
                { translateX: translateX.value },
                { rotate }
            ]
        }
    })

    const secondCard = useAnimatedStyle(() => {
        if (translateX.value < 0) {
            const translateY = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [10, 0, 10])
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

        const translateY = interpolate(translateX.value, [GAME_CARD_HEIGHT, 0, GAME_CARD_HEIGHT], [-9, 0, -9])
        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.845, SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.845],
        )

        return {
            width,
            height: GAME_CARD_HEIGHT,
            transform: [{ translateY }],
        }
    })

    const thirdCard = useAnimatedStyle(() => {
        if (translateX.value < 0) {
            const translateY = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [10, 0, 10])
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

        const translateY = interpolate(translateX.value, [GAME_CARD_HEIGHT, 0, GAME_CARD_HEIGHT], [-9, 0, -9])
        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.75, SCREEN_WIDTH * 0.8],
        )

        return {
            width,
            height: GAME_CARD_HEIGHT,
            transform: [{ translateY }],
        }
    })

    const fourthCard = useAnimatedStyle(() => {
        const translateY = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-10, 0, -10])
        const width = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [SCREEN_WIDTH * 0.75, SCREEN_WIDTH * 0.7, SCREEN_WIDTH * 0.75],
        )

        return {
            width,
            height: GAME_CARD_HEIGHT,
            transform: [{ translateY }],
        }
    })

    const hiddenCard = useAnimatedStyle(() => {
        if (translateX.value > 0) {
            return {}
        }

        const left = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [0, SCREEN_WIDTH * 1.1, 0])
        const rotation = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [0, 15, 0])

        return {
            width: SCREEN_WIDTH * 0.85,
            left,
            transform: [{ rotate: `${rotation + 0.5}deg` }],
        }
    })

    return { fourthCard, hiddenCard, secondCard, thirdCard, topCard }
}
