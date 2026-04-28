import GS from '@styles/globalStyles'
import { Platform, View } from 'react-native'
import { useSelector } from 'react-redux'

type CornerSquareProps = {
    corner: number
    type?: boolean
}

export default function CornerSquare({ corner, type }: CornerSquareProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const horizontal = corner === 0 || corner === 2
    const left = corner === 3 ? '20.6%' : corner === 1 ? '0.4%' : undefined
    const top = corner === 3 ? '-49.4%' : undefined

    return (
        <View style={{ height: '100%', width: '100%', position: 'absolute', alignSelf: 'center' }}>
            <View style={type
                ? {
                    left, top,
                    transform: [{ rotate: `${90 * corner}deg` }],
                    width: horizontal ? '100%' : undefined,
                    height: horizontal ? undefined : '180%',
                    aspectRatio: horizontal ? 1.5 : 0.66,
                    right: horizontal ? undefined : Platform.OS === 'ios' ? '45%' : '40%',
                    bottom: horizontal ? undefined : '30.3%',
                }
                : { ...GS.personImage, transform: [{ rotate: `${90 * corner}deg` }] }
            }>
                <View style={{ width: 83, height: 13, backgroundColor: theme.orange }} />
                <View style={{ width: 13, height: 70, backgroundColor: theme.orange }} />
                <View style={{ width: 13, height: 70, left: 13, top: -70, backgroundColor: theme.darker }} />
                <View style={{ width: 70, height: 13, left: 13, top: -140, backgroundColor: theme.darker }} />
                <View style={{ width: 26, height: 13, top: -83, backgroundColor: theme.darker }} />
                <View style={{ width: 13, height: 26, left: 83, top: -179, backgroundColor: theme.darker }} />
            </View>
        </View>
    )
}
