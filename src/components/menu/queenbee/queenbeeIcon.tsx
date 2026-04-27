import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

export type QueenbeeIconName =
    | 'activity'
    | 'briefcase'
    | 'building'
    | 'calendar'
    | 'database'
    | 'image'
    | 'server'
    | 'shield'
    | 'tag'

export function IconBadge({ name, small = false, color }: { name: QueenbeeIconName, small?: boolean, color?: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const size = small ? 30 : 36
    const badgeColor = color || theme.orange

    return (
        <View style={{
            width: size,
            height: size,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: `${badgeColor}88`,
            backgroundColor: `${badgeColor}22`,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <QueenbeeIcon name={name} size={small ? 15 : 17} color={badgeColor} />
        </View>
    )
}

export function QueenbeeIcon({
    name,
    size,
    color,
}: {
    name: QueenbeeIconName
    size: number
    color: string
}) {
    const common = {
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        fill: 'none',
    }

    return (
        <Svg width={size} height={size} viewBox='0 0 24 24'>
            {name === 'activity' && (
                <Polyline points='22 12 18 12 15 21 9 3 6 12 2 12' {...common} />
            )}
            {name === 'briefcase' && (
                <>
                    <Rect x='3' y='7' width='18' height='13' rx='2' {...common} />
                    <Path d='M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' {...common} />
                    <Path d='M3 12h18' {...common} />
                </>
            )}
            {name === 'building' && (
                <>
                    <Rect x='4' y='3' width='16' height='18' rx='2' {...common} />
                    <Path d='M9 21v-4h6v4' {...common} />
                    <Path d='M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01' {...common} />
                </>
            )}
            {name === 'calendar' && (
                <>
                    <Rect x='3' y='4' width='18' height='17' rx='2' {...common} />
                    <Path d='M8 2v4M16 2v4M3 10h18' {...common} />
                </>
            )}
            {name === 'database' && (
                <>
                    <Path d='M12 3c4.97 0 9 1.57 9 3.5S16.97 10 12 10 3 8.43 3 6.5 7.03 3 12 3Z' {...common} />
                    <Path d='M3 6.5v11C3 19.43 7.03 21 12 21s9-1.57 9-3.5v-11' {...common} />
                    <Path d='M3 12c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5' {...common} />
                </>
            )}
            {name === 'image' && (
                <>
                    <Rect x='3' y='3' width='18' height='18' rx='2' {...common} />
                    <Circle cx='8.5' cy='8.5' r='1.5' {...common} />
                    <Path d='M21 15l-5-5L5 21' {...common} />
                </>
            )}
            {name === 'server' && (
                <>
                    <Rect x='3' y='4' width='18' height='8' rx='2' {...common} />
                    <Rect x='3' y='12' width='18' height='8' rx='2' {...common} />
                    <Line x1='7' y1='8' x2='7.01' y2='8' {...common} />
                    <Line x1='7' y1='16' x2='7.01' y2='16' {...common} />
                </>
            )}
            {name === 'shield' && (
                <Path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z' {...common} />
            )}
            {name === 'tag' && (
                <>
                    <Path d='M20.59 13.41 12 22l-9-9V4h9l8.59 8.59a2 2 0 0 1 0 2.82Z' {...common} />
                    <Circle cx='7.5' cy='8.5' r='1' {...common} />
                </>
            )}
        </Svg>
    )
}
