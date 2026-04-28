import { ReactNode } from 'react'
import { Platform, StyleProp, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSelector } from 'react-redux'

export function CourseStackCard({ children, style }: { children?: ReactNode, style?: StyleProp<ViewStyle> }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Animated.View style={[{
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
        }, style]}>
            {children}
        </Animated.View>
    )
}

export function getCourseCardHeight(screenHeight: number) {
    if (Platform.OS === 'ios') {
        return screenHeight * 0.75
    }

    if (screenHeight === 592) return screenHeight * 0.72
    if (screenHeight >= 592 && screenHeight < 700) return screenHeight * 0.76
    if (screenHeight > 800 && screenHeight <= 900) return screenHeight * 0.8
    if (screenHeight > 900) return screenHeight * 0.77

    return screenHeight * 0.75
}
