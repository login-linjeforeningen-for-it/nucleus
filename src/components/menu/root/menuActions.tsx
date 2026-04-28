import Text from '@components/shared/text'
import T from '@styles/text'
import { Eye, EyeOff, Pin } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

export function HiddenToggle({ hiddenCount, showHidden, onToggle, theme }: {
    hiddenCount: number
    showHidden: boolean
    onToggle: () => void
    theme: Theme
}) {
    if (!hiddenCount) return null

    return (
        <Pressable onPress={onToggle}>
            <View style={{
                alignItems: 'center',
                alignSelf: 'center',
                backgroundColor: showHidden ? theme.orangeTransparent : 'rgba(255,255,255,0.045)',
                borderColor: showHidden ? theme.orangeTransparentBorder : 'rgba(255,255,255,0.08)',
                borderRadius: 16,
                borderWidth: 1,
                height: 32,
                justifyContent: 'center',
                width: 44,
            }}>
                {showHidden
                    ? <Eye color={theme.orange} size={17} strokeWidth={2.2} />
                    : <EyeOff color={theme.oppositeTextColor} size={17} strokeWidth={2.2} />}
            </View>
        </Pressable>
    )
}

export function HideAction({ hidden, onPress, theme }: { hidden: boolean, onPress?: () => void, theme: Theme }) {
    const content = (
        <View style={{
            width: 76,
            marginVertical: 6,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
        }}>
            {hidden
                ? <Eye color={theme.orange} size={18} strokeWidth={2.2} />
                : <EyeOff color={theme.oppositeTextColor} size={18} strokeWidth={2.2} />}
            <Text style={{ ...T.text12, color: hidden ? theme.orange : theme.oppositeTextColor, marginTop: 4 }}>
                {hidden ? 'Show' : 'Hide'}
            </Text>
        </View>
    )

    if (!onPress) {
        return content
    }

    return <Pressable onPress={onPress}>{content}</Pressable>
}

export function PinnedLine({ pinned, theme }: { pinned: boolean, theme: Theme }) {
    if (!pinned) {
        return (
            <View style={{
                width: 3,
                alignSelf: 'stretch',
                borderRadius: 99,
                backgroundColor: theme.orange,
                opacity: 0.55,
                marginTop: 2,
            }} />
        )
    }

    return (
        <View style={{ width: 10, alignSelf: 'stretch', alignItems: 'center', marginTop: 2 }}>
            <View style={{ width: 3, borderRadius: 99, backgroundColor: theme.orange, opacity: 0.55 }} />
            <View style={{ height: 14, width: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' }}>
                <Pin color={theme.orange} size={9} strokeWidth={2.4} fill={theme.orange} />
            </View>
            <View style={{ width: 3, flex: 1, borderRadius: 99, backgroundColor: theme.orange, opacity: 0.55 }} />
        </View>
    )
}

export function PinAction({ pinned, onPress, theme }: { pinned: boolean, onPress?: () => void, theme: Theme }) {
    const content = (
        <View style={{
            width: 76,
            marginVertical: 6,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.orangeTransparent,
        }}>
            <Pin color={theme.orange} size={18} strokeWidth={2.2} fill={pinned ? theme.orange : 'transparent'} />
            <Text style={{ ...T.text12, color: theme.orange, marginTop: 4 }}>
                {pinned ? 'Unpin' : 'Pin'}
            </Text>
        </View>
    )

    if (!onPress) {
        return content
    }

    return <Pressable onPress={onPress}>{content}</Pressable>
}
