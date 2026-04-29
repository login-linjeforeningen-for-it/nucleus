import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { FeaturedGame, GameList, GameScreenText, SectionTitle } from '@components/games/cards'
import Swipe from '@components/nav/swipe'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import { getGames } from '@utils/games/game'
import { JSX, useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native'
import GS from '@styles/globalStyles'
import T from '@styles/text'

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
        onRefresh()
    }, [onRefresh])

    return (
        <Swipe left='MenuScreen'>
            <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 100, paddingBottom: 120
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
