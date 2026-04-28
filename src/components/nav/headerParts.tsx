import GS from '@styles/globalStyles'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { HeaderGlassBackground } from './headerBackground'

type HeaderBackButtonProps = {
    isDark: boolean
    theme: Theme
    onPress: () => void
}

type HeaderTitlePillProps = {
    isDark: boolean
    theme: Theme
    title: string
    left: number
    width: number
}

export function HeaderBackButton({ isDark, theme, onPress }: HeaderBackButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                ...GS.headerLeftSlot,
                borderRadius: 21,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                backgroundColor: pressed
                    ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)')
                    : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.12 : 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
            })}
        >
            <HeaderGlassBackground borderRadius={21} />
            <Text style={{
                color: theme.orange,
                fontSize: 26,
                lineHeight: 28,
                fontWeight: '600',
                marginLeft: -2,
                marginTop: Platform.OS === 'ios' ? -1 : -3,
            }}>
                ‹
            </Text>
        </Pressable>
    )
}

export function HeaderTitlePill({ isDark, theme, title, left, width }: HeaderTitlePillProps) {
    return (
        <View style={{
            ...GS.headerTitleFrame,
            left,
            width,
        }}>
            <HeaderGlassBackground borderRadius={16} />
            <Text style={{
                ...GS.headerTitle,
                color: theme.textColor,
                textAlign: 'center',
                fontWeight: '700',
                letterSpacing: 0.2,
                textShadowColor: isDark ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.12)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
                paddingHorizontal: 14,
            }}>
                {title}
            </Text>
            <View
                pointerEvents='none'
                style={{
                    ...StyleSheet.absoluteFillObject,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.14)',
                }}
            />
        </View>
    )
}
