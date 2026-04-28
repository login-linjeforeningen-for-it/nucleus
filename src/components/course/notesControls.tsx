import { Pressable, View } from 'react-native'
import Text from '@components/shared/text'
import T from '@styles/text'

export function MetaPill({ label, value, theme }: { label: string, value: string, theme: Theme }) {
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.greyTransparentBorder,
            backgroundColor: '#ffffff08',
            paddingHorizontal: 10,
            paddingVertical: 7,
        }}>
            <View style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: theme.orange,
            }} />
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Text style={{ ...T.text12, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

export function ModeButton({
    label,
    active,
    onPress,
    theme,
}: {
    label: string
    active: boolean
    onPress: () => void
    theme: Theme
}) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? theme.orangeTransparentBorderHighlighted : theme.greyTransparentBorder,
                backgroundColor: active ? theme.orangeTransparentHighlighted : '#ffffff08',
                paddingHorizontal: 14,
                paddingVertical: 9,
            }}
        >
            <Text style={{ ...T.text12, color: theme.textColor }}>{label}</Text>
        </Pressable>
    )
}

export function ActionButton({
    label,
    onPress,
    disabled,
    subtle,
    theme,
}: {
    label: string
    onPress: () => void
    disabled?: boolean
    subtle?: boolean
    theme: Theme
}) {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            style={{
                opacity: disabled ? 0.45 : 1,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: subtle ? theme.greyTransparentBorder : theme.orangeTransparentBorder,
                backgroundColor: subtle ? '#ffffff08' : theme.orangeTransparent,
                paddingHorizontal: 14,
                paddingVertical: 10,
            }}
        >
            <Text style={{ ...T.text12, color: theme.textColor }}>{label}</Text>
        </Pressable>
    )
}
