import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { formatNorwegianDate } from '@utils/general'
import { parseResponseBody } from '@utils/http'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

export default function HoneyCard({
    honey,
    labels,
}: {
    honey: WorkerbeeHoney
    labels: Record<string, string>
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const preview = formatHoneyPreview(honey.text)
    const updatedAt = honey.updated_at ? formatHoneyDate(honey.updated_at) : '-'
    const createdAt = honey.created_at ? formatHoneyDate(honey.created_at) : '-'

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>{honey.page || `#${honey.id}`}</Text>
                            <Space height={4} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{`#${honey.id}`}</Text>
                        </View>
                        <LanguagePill language={honey.language} />
                    </View>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <MetaPill label={labels.service} value={honey.service || '-'} highlighted />
                        <MetaPill label={labels.page} value={honey.page || '-'} />
                        <MetaPill label={labels.language} value={honey.language || '-'} />
                    </View>
                    <Space height={12} />
                    <View style={{ borderLeftWidth: 2, borderLeftColor: theme.orange, paddingLeft: 10 }}>
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{labels.text}</Text>
                        <Space height={4} />
                        <Text style={{
                            ...T.text15,
                            color: preview ? theme.textColor : theme.oppositeTextColor,
                            lineHeight: 21,
                        }} numberOfLines={8}>
                            {preview || '-'}
                        </Text>
                    </View>
                    <Space height={12} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <DatePill label={labels.updated} value={updatedAt} />
                        <DatePill label={labels.created} value={createdAt} />
                    </View>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function LanguagePill({ language }: { language?: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const normalized = (language || '-').toUpperCase()

    return <View style={orangePill(theme)}>
        <Text style={{ ...T.text12, color: theme.textColor, fontWeight: '700' }}>{normalized}</Text>
    </View>
}

function MetaPill({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: highlighted ? theme.orangeTransparentBorderHighlighted : '#ffffff14',
            backgroundColor: highlighted ? theme.orangeTransparent : '#ffffff08',
            paddingHorizontal: 10,
            paddingVertical: 7,
            maxWidth: '100%',
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={2} />
            <Text style={{ ...T.text12, color: theme.textColor, fontWeight: '700' }} numberOfLines={2}>{value}</Text>
        </View>
    )
}

function DatePill({ label, value }: { label: string; value: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ borderRadius: 12, borderWidth: 1, borderColor: '#ffffff12', backgroundColor: '#ffffff08', paddingHorizontal: 10, paddingVertical: 7 }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={2} />
            <Text style={{ ...T.text12, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function formatHoneyPreview(text?: string) {
    if (!text) return ''
    return flattenHoneyText(parseResponseBody(text)).join('\n')
}

function flattenHoneyText(value: unknown, prefix = ''): string[] {
    if (value === null || value === undefined) return []
    if (typeof value !== 'object') return [`${prefix ? `${prefix}: ` : ''}${String(value)}`]
    if (Array.isArray(value)) return value.flatMap((item, index) => flattenHoneyText(item, `${prefix}[${index}]`))
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
        flattenHoneyText(item, prefix ? `${prefix}.${key}` : key)
    )
}

function formatHoneyDate(date: string) {
    return formatNorwegianDate(date, { day: '2-digit', month: 'short', year: 'numeric' }, date)
}

function orangePill(theme: Theme) {
    return {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.orangeTransparentBorderHighlighted,
        backgroundColor: theme.orangeTransparentHighlighted,
        paddingHorizontal: 10,
        paddingVertical: 5,
    }
}
