import { ActivityIndicator, StyleSheet, View } from 'react-native'

type TopRefreshIndicatorProps = {
    color?: string
    refreshing: boolean
    theme: Theme
    top?: number
}

export default function TopRefreshIndicator({ color, refreshing, theme, top = 96 }: TopRefreshIndicatorProps) {
    if (!refreshing) {
        return null
    }

    const indicatorColor = color || theme.orange || '#fd8738'

    return (
        <View pointerEvents='none' style={[styles.container, { top }]}>
            <ActivityIndicator color={indicatorColor} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        elevation: 20,
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 20,
    },
})
