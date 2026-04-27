import { useDispatch, useSelector } from 'react-redux'
import Parent from '@components/shared/parent'
import { setLocalTitle } from '@redux/misc'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, Text, View } from 'react-native'
import {
    getQuestions,
    getNeverHaveIEver,
    getOkRedFlagDealbreaker
} from '@utils/game'
import Swiper from '@components/games/swiper'
import Filters from '@components/games/filters'
import { ScrollView } from 'react-native-gesture-handler'
import T from '@styles/text'

type GameProps = {
    game: Question[] | NeverHaveIEver[] | OkRedFlagDealBreaker[]
}

export default function SpecificGameScreen({ route }: MenuProps<'SpecificGameScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { localTitle } = useSelector((state: ReduxState) => state.misc)
    const [game, setGame] = useState<Question[] | NeverHaveIEver[] | OkRedFlagDealBreaker[] | string>('')
    const dispatch = useDispatch()
    const height = Dimensions.get('window').height

    async function fetchGame() {
        const game = await determineGame()

        if (game) {
            setGame(game)
            return true
        }
    }

    async function determineGame() {
        switch (route.params.gameID) {
            case 1: return await getNeverHaveIEver()
            case 2: return await getOkRedFlagDealbreaker()
            default: return await getQuestions()
        }
    }

    useEffect(() => {
        if (localTitle?.screen !== route.params?.gameName) {
            dispatch(setLocalTitle({
                title: route.params?.gameName,
                screen: 'SpecificGameScreen'
            }))
        }
    }, [localTitle?.screen, route.params?.gameName, dispatch])

    useEffect(() => {
        (async () => {
            await fetchGame()
        })()
    }, [])

    function paddingtop() {
        if (height <= 592) {
            return 20
        }

        if (height > 592 && height < 700) {
            return 20
        }

        if (height > 700 && height < 800) {
            return 17.5
        }

        if (height > 800 && height < 900) {
            return 40
        }

        return undefined
    }

    return (
        <Parent paddingHorizontal={-1} colors={[theme.orange, 'red', theme.orange]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={100}
                scrollEnabled={false}
                style={{ marginTop: 100, paddingTop: paddingtop() }}
            >
                {typeof game === 'string'
                    ? <Text style={{ ...T.text18, color: theme.textColor }}>{game}</Text>
                    : <Game game={game} />
                }
            </ScrollView>
        </Parent>
    )
}

function Game({ game }: GameProps) {
    const [mode, setMode] = useState(0)
    const hasSchool = game.some(entry => entry.categories.includes('NTNU'))
    const [school, setSchool] = useState(hasSchool)
    const [ntnu, setNTNU] = useState(hasSchool)

    function shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
    }

    shuffleArray(game)

    return (
        <View style={{ alignItems: 'center', paddingBottom: Dimensions.get('window').height * 0.5 }}>
            <Swiper game={game} mode={mode} school={school} ntnu={ntnu} />
            {Object.hasOwn(game[0], 'categories') && <Filters
                mode={mode}
                school={school}
                ntnu={ntnu}
                setMode={setMode}
                setSchool={setSchool}
                setNTNU={setNTNU}
                displaySchool={hasSchool}
                displayNTNU={hasSchool}
            />}
        </View>
    )
}
