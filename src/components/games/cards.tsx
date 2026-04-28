import Cluster from '@/components/shared/cluster'
import T from '@styles/text'
import { StackNavigationProp } from '@react-navigation/stack'
import { JSX } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

export type GameScreenText = {
    intro: string
    featured: string
    library: string
    diceTitle: string
    diceBody: string
    communityDeck: string
    tapToOpen: string
}

type GameCardProps = {
    navigation: StackNavigationProp<MenuStackParamList, 'GameScreen'>
    theme: Theme
    text: GameScreenText
}

const GAME_ASSETS = [
    require('@assets/games/terning.png'),
    require('@assets/games/100questions.png'),
    require('@assets/games/neverhaveiever.png'),
    require('@assets/games/okredflagdealbreaker.png'),
]

export function SectionTitle({ title, theme }: { title: string, theme: Theme }): JSX.Element {
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

export function GameList({ game, navigation, theme, text }: GameCardProps & { game: Game }): JSX.Element {
    function handlePress() {
        navigation.navigate('SpecificGameScreen', { gameID: game.id, gameName: game.name })
    }

    const image = GAME_ASSETS[game.id + 1] || GAME_ASSETS[1]

    return (
        <TouchableOpacity style={{ marginBottom: 10 }} onPress={handlePress} activeOpacity={0.88}>
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 12 }}>
                    <GameImage source={image} size={64} iconSize={42} />
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

export function FeaturedGame({ name, navigation, theme, text }: GameCardProps & { name: string }): JSX.Element {
    function handlePress() {
        navigation.navigate('DiceScreen')
    }

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
                    <View style={{ borderRadius: 24, backgroundColor: 'rgba(253,135,56,0.10)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <GameImage source={GAME_ASSETS[0]} size={72} iconSize={50} />
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

function GameImage({ source, size, iconSize }: { source: number, size: number, iconSize: number }) {
    return (
        <View style={{
            width: size,
            height: size,
            borderRadius: size > 64 ? 20 : 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(253,135,56,0.12)',
        }}>
            <Image
                source={source}
                style={{ width: iconSize, height: iconSize, resizeMode: 'contain' }}
            />
        </View>
    )
}
