import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import { getGames } from '@utils/game'
import { JSX, useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import GS from '@styles/globalStyles'
import T from '@styles/text'

type GameListProps = {
    game: Game
    navigation: StackNavigationProp<MenuStackParamList, 'GameScreen'>
    theme: Theme
    text: {
        diceTitle: string
        diceBody: string
        communityDeck: string
        tapToOpen: string
    }
}

type FeaturedGameProps = {
    name: string
    navigation: StackNavigationProp<MenuStackParamList, 'GameScreen'>
    theme: Theme
    text: {
        diceBody: string
        tapToOpen: string
    }
}

type GameScreenText = {
    intro: string
    featured: string
    library: string
    diceTitle: string
    diceBody: string
    communityDeck: string
    tapToOpen: string
}

const GAME_ASSETS = [
    require('@assets/games/terning.png'),
    require('@assets/games/100questions.png'),
    require('@assets/games/neverhaveiever.png'),
    require('@assets/games/okredflagdealbreaker.png'),
]

export default function GameScreen({ navigation }: MenuProps<'GameScreen'>): JSX.Element {
    const [games, setGames] = useState<string | Game[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text: GameScreenText = lang
        ? require('@text/no.json').games
        : require('@text/en.json').games

    const listedGames = useMemo(
        () => typeof games === 'string' ? [] : games,
        [games]
    )

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        const nextGames = await getGames()
        if (nextGames) {
            setGames(nextGames)
        }
        setRefreshing(false)
    }, [])

    useEffect(() => {
        void onRefresh()
    }, [onRefresh])

    return (
        <Swipe left='MenuScreen'>
            <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 100, paddingBottom: 120,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                >
                    <Cluster style={{ paddingHorizontal: 0 }}>
                        <View style={{ paddingHorizontal: 14, paddingVertical: 16 }}>
                            <Text style={{ ...T.text20, color: theme.textColor, marginBottom: 6 }}>
                                {lang ? 'Spillkveld' : 'Game night'}
                            </Text>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {text.intro}
                            </Text>
                        </View>
                    </Cluster>

                    <Space height={14} />
                    <SectionTitle title={text.featured} theme={theme} />
                    <Space height={8} />
                    <FeaturedGame
                        name={text.diceTitle}
                        navigation={navigation}
                        theme={theme}
                        text={text}
                    />

                    <Space height={16} />
                    <SectionTitle title={text.library} theme={theme} />
                    <Space height={8} />

                    {typeof games === 'string' ? (
                        <Cluster style={{ paddingHorizontal: 0 }}>
                            <View style={{ paddingHorizontal: 14, paddingVertical: 16 }}>
                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                    {games}
                                </Text>
                            </View>
                        </Cluster>
                    ) : (
                        listedGames.map((game: Game) => (
                            <GameList
                                key={game.id}
                                game={game}
                                navigation={navigation}
                                theme={theme}
                                text={text}
                            />
                        ))
                    )}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function SectionTitle({ title, theme }: { title: string, theme: Theme }): JSX.Element {
    return (
        <Text style={{
            ...T.text15,
            color: theme.oppositeTextColor,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginLeft: 4,
        }}>
            {title}
        </Text>
    )
}

function GameList({ game, navigation, theme, text }: GameListProps): JSX.Element {
    function handlePress() {
        navigation.navigate('SpecificGameScreen', { gameID: game.id, gameName: game.name })
    }

    const image = GAME_ASSETS[game.id + 1] || GAME_ASSETS[1]

    return (
        <TouchableOpacity style={{ marginBottom: 10 }} onPress={handlePress} activeOpacity={0.88}>
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    gap: 12,
                }}>
                    <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(253,135,56,0.10)',
                    }}>
                        <Image
                            source={image}
                            style={{ width: 42, height: 42, resizeMode: 'contain' }}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...T.text20, color: theme.textColor, marginBottom: 4 }}>
                            {game.name}
                        </Text>
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {text.communityDeck}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ ...T.text15, color: theme.orange }}>
                            {text.tapToOpen}
                        </Text>
                    </View>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}

function FeaturedGame({ name, navigation, theme, text }: FeaturedGameProps): JSX.Element {
    function handlePress() {
        navigation.navigate('DiceScreen')
    }

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
                    <View style={{
                        borderRadius: 24,
                        backgroundColor: 'rgba(253,135,56,0.10)',
                        paddingHorizontal: 14,
                        paddingVertical: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                    }}>
                        <View style={{
                            width: 72,
                            height: 72,
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(253,135,56,0.12)',
                        }}>
                            <Image
                                source={GAME_ASSETS[0]}
                                style={{ width: 50, height: 50, resizeMode: 'contain' }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...T.text20, color: theme.textColor, marginBottom: 4 }}>
                                {name}
                            </Text>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {text.diceBody}
                            </Text>
                        </View>
                    </View>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}
