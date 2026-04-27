import Svg, { LinearGradient, Rect, Stop } from 'react-native-svg'
import { View } from 'react-native'
import PS from '@styles/profileStyles'

type ProfileBackgroundProps = {
    theme: Theme
    screenHeight: number
    scrollPosition: number
}

export default function ProfileBackground({ theme, screenHeight, scrollPosition }: ProfileBackgroundProps) {
    return (
        <>
            <View style={{
                ...PS.profileView,
                backgroundColor: theme.orange,
                opacity: Math.max(0, Math.min(scrollPosition / 220, 0.14)),
                transform: [{ translateY: Math.min(scrollPosition * 0.18, 18) }]
            }} />
            <Svg style={{
                height: screenHeight / 2,
                left: 0,
                position: 'absolute',
                right: 0,
                top: 0,
                width: '100%'
            }}>
                <LinearGradient
                    id='profileGradient'
                    x1='0%'
                    y1='0%'
                    x2='0%'
                    y2='100%'
                >
                    <Stop offset='0%' stopColor={theme.orange} />
                    <Stop
                        offset='100%'
                        stopColor={theme.darker}
                    />
                </LinearGradient>
                <Rect
                    x='0'
                    y='0'
                    width='100%'
                    height='100%'
                    fill='url(#profileGradient)'
                />
            </Svg>
        </>
    )
}
