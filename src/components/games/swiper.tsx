import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { GameCardNumber, GameContent, GameStackCard } from './swiperCards'
import { useGameSwiperNavigation } from './useGameSwiperNavigation'
import {
    GAME_CARD_HEIGHT,
    GAME_CARD_TOP,
    SCREEN_WIDTH,
    SWIPE_THRESHOLD,
    useGameSwiperStyles,
} from './useGameSwiperStyles'

type GameListContentProps = {
    game: Question[] | NeverHaveIEver[] | OkRedFlagDealBreaker[]
    mode: number
    school: boolean
    ntnu: boolean
}

export default function Swiper({ game, mode, school, ntnu }: GameListContentProps) {
    const translateX = useSharedValue(0)
    const totalCards = game.length
    const startX = useSharedValue(0)
    const { nav, navigate } = useGameSwiperNavigation({ game, mode, school, ntnu })
    const styles = useGameSwiperStyles(translateX)

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

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Fifth card */}
            <GameStackCard style={{
                top: GAME_CARD_TOP + 30,
                width: SCREEN_WIDTH * 0.7,
                height: GAME_CARD_HEIGHT,
            }} />

            {/* Forth card */}
            <GameStackCard style={[{
                top: GAME_CARD_TOP + 30,
            }, styles.fourthCard]} />

            {/* Third card */}
            <GameStackCard style={[{
                top: GAME_CARD_TOP + 20,
            }, styles.thirdCard]} />

            {/* Second card (next card) */}
            <GameStackCard style={[{
                top: GAME_CARD_TOP + 10,
                padding: 16,
            }, styles.secondCard]}>
                <GameCardNumber value={nav.uxIndex + 1} />
                <GameContent game={game[(nav.dataIndex + 1) % totalCards]} />
            </GameStackCard>

            {/* Top card (current card) */}
            <GestureDetector gesture={panGesture}>
                <GameStackCard style={[{
                    top: GAME_CARD_TOP,
                    height: GAME_CARD_HEIGHT,
                    padding: 16,
                }, styles.topCard]}>
                    <GameCardNumber value={nav.uxIndex} />
                    <GameContent game={game[nav.dataIndex]} />
                </GameStackCard>
            </GestureDetector>

            {/* Previous (hidden) card */}
            {nav.dataIndex > 0 && <GameStackCard style={[{
                top: GAME_CARD_TOP,
                width: SCREEN_WIDTH * 0.85,
                height: GAME_CARD_HEIGHT,
                padding: 16,
            }, styles.hiddenCard]} >
                <GameCardNumber value={nav.uxIndex - 1} />
                <GameContent game={game[Math.max(0, nav.dataIndex - 1)]} />
            </GameStackCard>}
        </View>
    )
}
