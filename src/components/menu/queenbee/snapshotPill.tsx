import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { ArrowLeftRight } from 'lucide-react-native'
import { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'
import { IconBadge, QueenbeeIconName } from './queenbeeIcon'

export type FailoverState = 'idle' | 'primary' | 'secondary' | 'failed'

export function SnapshotPill({
    icon,
    label,
    value,
    subvalue,
    color,
    action,
    onPress,
}: {
    icon: QueenbeeIconName
    label: string
    value: string | number
    subvalue?: string | null
    color?: string
    action?: ReactNode
    onPress: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                minWidth: '47%',
                flex: 1,
                borderRadius: 16,
                backgroundColor: pressed ? 'rgba(255,255,255,0.10)' : theme.contrast,
                padding: 12,
            })}
        >
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <IconBadge name={icon} color={color} />
                <View style={{ flex: 1 }}>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
                    <Space height={4} />
                    <SnapshotValue value={value} subvalue={subvalue} theme={theme} />
                </View>
                {action}
            </View>
        </Pressable>
    )
}

export function FailoverButton({
    disabled,
    loading,
    tone,
    onPress,
}: {
    disabled: boolean
    loading: boolean
    tone: FailoverState
    onPress: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const color = getFailoverColor(tone, theme)

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: `${color}88`,
                backgroundColor: pressed ? `${color}33` : `${color}1f`,
                opacity: disabled && tone !== 'failed' ? 0.55 : 1,
                transform: [{ rotate: loading ? '45deg' : '0deg' }],
            })}
        >
            <ArrowLeftRight size={17} color={color} strokeWidth={2.4} />
        </Pressable>
    )
}

export function getFailoverTone(site: NativeLoadBalancingSite | null): FailoverState {
    if (!site) {
        return 'failed'
    }

    return site.name.toLowerCase().includes('primary') ? 'primary' : 'secondary'
}

export function getPrimarySiteColor(site: NativeLoadBalancingSite | null, theme: Theme) {
    if (!site || !site.operational || site.maintenance) {
        return '#ff8b8b'
    }

    return site.primary ? '#70e2a0' : theme.orange
}

function getFailoverColor(tone: FailoverState, theme: Theme) {
    if (tone === 'primary') {
        return '#70e2a0'
    }

    if (tone === 'secondary') {
        return '#facc15'
    }

    if (tone === 'failed') {
        return '#ff8b8b'
    }

    return theme.orange
}

function SnapshotValue({ value, subvalue, theme }: { value: string | number; subvalue?: string | null; theme: Theme }): ReactNode {
    if (typeof value !== 'string' || !value.includes(' · ')) {
        return (
            <>
                <Text style={{ ...T.text15, color: theme.textColor }}>{value}</Text>
                {subvalue ? (
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {subvalue}
                    </Text>
                ) : null}
            </>
        )
    }

    const [primary, ...secondary] = value.split(' · ')
    const secondaryLines = [...secondary, subvalue].filter(Boolean)

    return (
        <>
            <Text style={{ ...T.text15, color: theme.textColor }}>{primary}</Text>
            {secondaryLines.map((line) => (
                <Text key={line} style={{ ...T.text12, color: theme.oppositeTextColor }}>
                    {line}
                </Text>
            ))}
        </>
    )
}
