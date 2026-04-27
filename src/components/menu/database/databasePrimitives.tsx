import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { formatBytes, formatDuration } from '@utils/queenbee/databaseFormatting'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

export function QueryCard({ title, query }: { title: string; query: DatabaseOverviewQuery | null }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={cardStyle}>
            <Text style={{ ...T.text15, color: theme.textColor }}>{title}</Text>
            <Space height={8} />
            {!query ? (
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                    No active query details are available right now.
                </Text>
            ) : (
                <>
                    <MetricGrid items={[
                        ['Database', query.database],
                        ['Duration', formatDuration(query.ageSeconds)],
                        ['User', query.user || 'Unknown'],
                        ['Wait state', query.waitEventType || 'Running'],
                    ]} />
                    <Space height={8} />
                    <View style={{ borderRadius: 12, backgroundColor: '#00000038', padding: 10 }}>
                        <Text style={{ ...T.text12, color: theme.textColor, lineHeight: 18 }}>
                            {query.query}
                        </Text>
                    </View>
                </>
            )}
        </View>
    )
}

export function AverageQueryCard({ averageQuerySeconds }: { averageQuerySeconds: DatabaseOverviewAverageQuery }) {
    return (
        <MetricGrid items={[
            ['1 minute', formatDuration(averageQuerySeconds.lastMinute)],
            ['5 minutes', formatDuration(averageQuerySeconds.lastFiveMinutes)],
            ['1 hour', formatDuration(averageQuerySeconds.lastHour)],
            ['1 day', formatDuration(averageQuerySeconds.lastDay)],
        ]} />
    )
}

export function TableList({ database }: { database: DatabaseOverviewItem }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    if (!database.tables.length) {
        return (
            <View style={{ ...cardStyle, marginTop: 10 }}>
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                    No user tables were found in this database.
                </Text>
            </View>
        )
    }

    return (
        <View style={{ marginTop: 10 }}>
            {database.tables.map(table => (
                <View key={`${database.name}-${table.schema}-${table.name}`} style={{ ...cardStyle, marginBottom: 8 }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>{`${table.schema}.${table.name}`}</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`Approx. ${table.estimatedRows.toLocaleString('nb-NO')} rows`}
                    </Text>
                    <Space height={8} />
                    <MetricGrid items={[
                        ['Table data', formatBytes(table.tableBytes)],
                        ['Indexes', formatBytes(table.indexBytes)],
                        ['Total', formatBytes(table.totalBytes)],
                    ]} />
                </View>
            ))}
        </View>
    )
}

export function MetricGrid({ items }: { items: [string, string][] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {items.map(([label, value]) => (
                <View key={`${label}-${value}`} style={{
                    flexBasis: '47%',
                    flexGrow: 1,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#ffffff12',
                    backgroundColor: '#00000022',
                    padding: 10,
                }}>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
                    <Space height={3} />
                    <Text style={{ ...T.text12, color: theme.textColor, fontWeight: '700' }} numberOfLines={3}>
                        {value}
                    </Text>
                </View>
            ))}
        </View>
    )
}

export function Pill({ label, color }: { label: string; color?: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const pillColor = color || theme.orange

    return (
        <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: `${pillColor}66`,
            backgroundColor: `${pillColor}22`,
            paddingHorizontal: 8,
            paddingVertical: 4,
        }}>
            <Text style={{ ...T.text12, color: pillColor, fontWeight: '700' }}>{label}</Text>
        </View>
    )
}

export function ErrorBox({ message }: { message: string }) {
    return (
        <>
            <View style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#ff8b8b33',
                backgroundColor: '#ff8b8b14',
                padding: 12,
            }}>
                <Text style={{ ...T.text12, color: '#ffb4b4' }}>{message}</Text>
            </View>
            <Space height={10} />
        </>
    )
}

const cardStyle = {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffffff12',
    backgroundColor: '#ffffff08',
    padding: 12,
}
