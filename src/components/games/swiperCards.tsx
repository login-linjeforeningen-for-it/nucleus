import T from '@styles/text'
import { ReactNode } from 'react'
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSelector } from 'react-redux'

type GameContentProps = {
    game: Question | NeverHaveIEver | OkRedFlagDealBreaker
}

type GameStackCardProps = {
    children?: ReactNode
    style?: StyleProp<ViewStyle>
}

export function GameStackCard({ children, style }: GameStackCardProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Animated.View style={[getCardStyle(theme), style]}>
            {children}
        </Animated.View>
    )
}

export function GameCardNumber({ value }: { value: number }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Text style={getNumberStyle(theme)}>
            {value}
        </Text>
    )
}

export function GameContent({ game }: GameContentProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View>
            <Text style={{ color: theme.textColor, ...T.text20, margin: 8 }}>
                {lang ? game?.title_no : game?.title_en}
            </Text>
        </View>
    )
}

function getCardStyle(theme: Theme): StyleProp<ViewStyle> {
    return {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.contrast,
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    }
}

function getNumberStyle(theme: Theme): StyleProp<TextStyle> {
    return {
        position: 'absolute',
        bottom: 15,
        left: 15,
        ...T.text20,
        color: theme.orange,
        fontWeight: '600',
    }
}
