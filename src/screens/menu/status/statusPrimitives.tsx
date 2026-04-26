import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Pressable, Switch, TextInput, View } from 'react-native'
import { useSelector } from 'react-redux'

export function Field({
    label,
    value,
    onChangeText,
    keyboardType,
    multiline,
}: {
    label: string
    value: string
    onChangeText: (value: string) => void
    keyboardType?: 'default' | 'number-pad'
    multiline?: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ gap: 6 }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType || 'default'}
                multiline={multiline}
                placeholderTextColor={theme.oppositeTextColor}
                style={{
                    color: theme.textColor,
                    borderWidth: 1,
                    borderColor: theme.greyTransparentBorder,
                    borderRadius: 14,
                    backgroundColor: '#ffffff08',
                    minHeight: multiline ? 88 : undefined,
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    textAlignVertical: multiline ? 'top' : 'center',
                }}
            />
        </View>
    )
}

export function ChoicePill({
    label,
    active,
    onPress,
}: {
    label: string
    active: boolean
    onPress: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={onPress}
            style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
                backgroundColor: active ? theme.orangeTransparent : '#ffffff08',
                paddingHorizontal: 12,
                paddingVertical: 8,
            }}
        >
            <Text style={{ ...T.text12, color: theme.textColor }}>{label}</Text>
        </Pressable>
    )
}

export function ToggleRow({
    label,
    value,
    onValueChange,
}: {
    label: string
    value: boolean
    onValueChange: (value: boolean) => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ ...T.text15, color: theme.textColor }}>{label}</Text>
            <Switch value={value} onValueChange={onValueChange} trackColor={{ true: theme.orange, false: '#ffffff20' }} />
        </View>
    )
}

export function ActionButton({
    label,
    onPress,
    disabled,
    small,
    secondary,
    danger,
}: {
    label: string
    onPress: () => void
    disabled?: boolean
    small?: boolean
    secondary?: boolean
    danger?: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            style={{
                opacity: disabled ? 0.5 : 1,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: danger ? '#ff8b8b55' : secondary ? theme.greyTransparentBorder : theme.orangeTransparentBorder,
                backgroundColor: danger ? '#ff8b8b22' : secondary ? '#ffffff08' : theme.orangeTransparent,
                paddingHorizontal: small ? 12 : 16,
                paddingVertical: small ? 8 : 11,
            }}
        >
            <Text style={{ ...T.text12, color: danger ? '#ffb3b3' : theme.textColor }}>{label}</Text>
        </Pressable>
    )
}

export function StatusPill({ label, healthy }: { label: string, healthy: boolean }) {
    return (
        <View style={{
            backgroundColor: healthy ? '#113c1b' : '#4a1616',
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 6,
            alignSelf: 'flex-start',
        }}>
            <Text style={{ ...T.text12, color: '#fff' }}>{label}</Text>
        </View>
    )
}

export function MetricPill({ label, value }: { label: string, value: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

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
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: theme.orange,
            }} />
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Text style={{ ...T.text15, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

export function BarNote({ note, timestamp }: { note: string, timestamp: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Space height={4} />
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{note || timestamp}</Text>
        </>
    )
}
