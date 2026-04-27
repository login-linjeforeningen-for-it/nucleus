import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { View } from 'react-native'
import { severityBorder, severityColor } from '@utils/vulnerabilities'

export function SummaryTile({
    label,
    value,
    theme,
    severity,
}: {
    label: string
    value: string
    theme: Theme
    severity?: SeverityLevel
}) {
    return (
        <View style={{
            flexBasis: '48%',
            flexGrow: 1,
            ...glassCard(
                severity ? severityColor(severity) : theme.greyTransparent,
                severity ? severityBorder(severity) : theme.greyTransparentBorder,
                10
            )
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={3} />
            <Text style={{ ...T.text20, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

export function MetaStat({
    label,
    value,
    theme,
}: {
    label: string
    value: string
    theme: Theme
}) {
    return (
        <View style={{
            minWidth: 100,
            flexGrow: 1,
            ...glassCard('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 10)
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={3} />
            <Text style={{ ...T.text12, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

export function MetaRow({
    label,
    value,
    theme,
    multiline = false,
}: {
    label: string
    value: string
    theme: Theme
    multiline?: boolean
}) {
    return (
        <View style={glassCard('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 10)}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={3} />
            <Text style={{
                ...T.text12,
                color: theme.textColor,
                lineHeight: multiline ? 18 : undefined
            }}>
                {value}
            </Text>
        </View>
    )
}

export function SeverityBadge({
    label,
    color,
    borderColor,
    textColor,
}: {
    label: string
    color: string
    borderColor: string
    textColor: string
}) {
    return (
        <View style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: color,
            borderWidth: 1,
            borderColor,
            alignSelf: 'flex-start',
        }}>
            <Text style={{ ...T.text12, color: textColor }}>{label}</Text>
        </View>
    )
}

export function glassCard(backgroundColor: string, borderColor: string, padding: number) {
    return {
        borderRadius: 18,
        backgroundColor,
        borderColor,
        borderWidth: 1,
        padding,
        overflow: 'hidden' as const,
    }
}
