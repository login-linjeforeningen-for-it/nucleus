import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import CS from "@styles/clusterStyles"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import Swipe from "@components/nav/swipe"
import CourseError from "@components/course/courseError"
import { useSelector } from "react-redux"
import { JSX, useCallback, useEffect, useState } from "react"
import { RefreshControl, ScrollView } from "react-native-gesture-handler"
import { MenuProps, MenuStackParamList } from "@type/screenTypes"
import { StackNavigationProp } from "@react-navigation/stack"
import { getGames } from "@utils/game"
import {
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    Text,
    Platform
} from "react-native"

type GameListProps = {
    game: Game
    navigation: StackNavigationProp<MenuStackParamList, "GameScreen">
}

type HardCodedGameProps = {
    name: string
    navigation: StackNavigationProp<MenuStackParamList, "GameScreen">
}

export default function GameScreen({ navigation }: MenuProps<'GameScreen'>): JSX.Element {
    const [games, setGames] = useState<string | Game[]>([])
    const [refresh, setRefresh] = useState(false)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const height = Dimensions.get("window").height
    const extraHeight = Platform.OS === 'ios' ? 0 : height > 800 && height < 900 ? 20 : 10

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        const courses = await getGames()
        if (courses) {
            setGames(games)
            setRefresh(false)
        }
    }, [refresh])

    useEffect(() => {
        (async () => {
            const games = await getGames()

            if (games) {
                setGames(games)
            }
        })()
    }, [])

    return (
        <Swipe left="MenuScreen">
            <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                <Space height={Dimensions.get("window").height / 8.1 + extraHeight} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={100}
                >
                    {typeof games === 'string' && <CourseError text={games} />}
                    <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                    <HardCodedGame name={lang ? 'Terning' : 'Dice'} navigation={navigation} />
                    {typeof games !== 'string' && games.map((game: Game) =>
                        <GameList
                            key={game.id}
                            game={game}
                            navigation={navigation}
                        />
                    )}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function GameList({ game, navigation }: GameListProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    function handlePress() {
        navigation.navigate("SpecificGameScreen", { gameID: game.id, gameName: game.name })
    }

    return (
        <TouchableOpacity style={{ marginBottom: 6 }} onPress={handlePress}>
            <Cluster>
                <View style={{ ...CS.clusterBack }}>
                    <View style={CS.twinLeft}>
                        <Text style={{ ...T.text20, color: theme.textColor }}>
                            {game.name}
                        </Text>
                    </View>
                    <View style={CS.twinRight}>
                        <Image
                            style={CS.arrowImage}
                            source={require("@assets/icons/dropdownBase.png")}
                        />
                    </View>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}

function HardCodedGame({ name, navigation }: HardCodedGameProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    function handlePress() {
        navigation.navigate("DiceScreen")
    }

    return (
        <TouchableOpacity style={{ marginBottom: 6 }} onPress={handlePress}>
            <Cluster>
                <View style={{ ...CS.clusterBack }}>
                    <View style={CS.twinLeft}>
                        <Text style={{ ...T.text20, color: theme.textColor }}>
                            {name}
                        </Text>
                    </View>
                    <View style={CS.twinRight}>
                        <Image
                            style={CS.arrowImage}
                            source={require("@assets/icons/dropdownBase.png")}
                        />
                    </View>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}
