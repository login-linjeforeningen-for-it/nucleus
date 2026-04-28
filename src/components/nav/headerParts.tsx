import GS from '@styles/globalStyles'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { HeaderGlassBackground } from './headerBackground'

type HeaderBackButtonProps = {
    isDark: boolean
    theme: Theme
    onPress: () => void
}

type HeaderTitlePillProps = {
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
                borderColor: theme.greyTransparentBorder,
                backgroundColor: pressed ? theme.glassButtonPressed : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: theme.greyTransparent,
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

export function HeaderTitlePill({ theme, title, left, width }: HeaderTitlePillProps) {
    return (
        <View style={{ ...GS.headerTitleFrame, left, width }}>
            <HeaderGlassBackground borderRadius={16} />
            <Text style={{
                ...GS.headerTitle,
                color: theme.textColor,
                textAlign: 'center',
                fontWeight: '700',
                letterSpacing: 0.2,
                textShadowColor: theme.greyTransparent,
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
                paddingHorizontal: 14,
            }}>
                {title}
            </Text>
            <View
                pointerEvents='none'
                style={{
                    ...StyleSheet.absoluteFill,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.greyTransparentBorder,
                }}
            />
        </View>
    )
}
