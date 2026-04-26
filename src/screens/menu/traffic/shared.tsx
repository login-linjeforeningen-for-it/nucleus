import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { NavigationProp } from '@react-navigation/native'
import { Dimensions, Pressable, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

type TrafficNavigation = NavigationProp<MenuStackParamList>

export function TrafficTabs({
    active,
    navigation,
}: {
    active: 'metrics' | 'records' | 'map'
    navigation: TrafficNavigation
}) {
    return (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <TrafficTab label='Metrics' active={active === 'metrics'} onPress={() => navigation.navigate('TrafficScreen')} />
            <TrafficTab
                label='Records'
                active={active === 'records'}
                onPress={() => navigation.navigate('TrafficRecordsScreen')}
            />
            <TrafficTab
                label='Map'
                active={active === 'map'}
                onPress={() => navigation.navigate('TrafficMapScreen')}
            />
        </View>
    )
}

export function DomainPicker({
    domains,
    selectedDomain,
    onSelect,
}: {
    domains: string[]
    selectedDomain: string
    onSelect: (domain: string) => void
}) {
    return (
        <ScrollView
            horizontal
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            style={{ width: '100%', maxHeight: 44 }}
            contentContainerStyle={{
                flexDirection: 'row',
                gap: 8,
                minWidth: Dimensions.get('window').width - 24,
                paddingRight: 18,
            }}
        >
            <View style={{ flexDirection: 'row', gap: 8, flexShrink: 0 }}>
                <ChoicePill label='All domains' active={!selectedDomain} onPress={() => onSelect('')} />
                {domains.map(domain => (
                    <ChoicePill
                        key={domain}
                        label={domain}
                        active={selectedDomain === domain}
                        onPress={() => onSelect(domain)}
                    />
                ))}
            </View>
        </ScrollView>
    )
}

export function SummaryCard({ label, value, detail }: { label: string, value: string, detail?: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ flexBasis: '31%', flexGrow: 1 }}>
            <Cluster style={{
                borderWidth: 1,
                borderColor: theme.greyTransparentBorder,
                backgroundColor: theme.greyTransparent,
            }}>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text20, color: theme.textColor }}>{value}</Text>
                    {detail ? (
                        <>
                            <Space height={4} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{detail}</Text>
                        </>
                    ) : null}
                </View>
            </Cluster>
        </View>
    )
}

export function MetricList({ title, entries, total, timeValue }: {
    title: string
    entries: TrafficEntry[]
    total: number
    timeValue?: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster style={{
            borderWidth: 1,
            borderColor: theme.greyTransparentBorder,
            backgroundColor: theme.greyTransparent,
        }}>
            <View style={{ padding: 12 }}>
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{title}</Text>
                <Space height={10} />
                {entries.slice(0, 6).map(entry => {
                    const value = timeValue ? Math.round(entry.avg_time || 0) : entry.count || 0
                    const width = timeValue
                        ? Math.min(100, Math.max(5, value / 20))
                        : total ? Math.max(5, (value / total) * 100) : 5

                    return (
                        <View key={entry.key}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                                <Text
                                    style={{ ...T.text12, color: theme.textColor, flex: 1 }}
                                    numberOfLines={1}
                                >
                                    {entry.key}
                                </Text>
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                    {timeValue ? `${value}ms` : value}
                                </Text>
                            </View>
                            <Space height={5} />
                            <View style={{ height: 6, borderRadius: 999, backgroundColor: '#ffffff12', overflow: 'hidden' }}>
                                <View style={{
                                    width: `${width}%`,
                                    height: 6,
                                    borderRadius: 999,
                                    backgroundColor: theme.orange,
                                }} />
                            </View>
                            <Space height={10} />
                        </View>
                    )
                })}
                {!entries.length && <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>No data available yet.</Text>}
            </View>
        </Cluster>
    )
}

export function TrafficRecordCard({ record }: { record: TrafficRecord }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster style={{ borderWidth: 1, borderColor: theme.greyTransparentBorder, backgroundColor: theme.greyTransparent }}>
            <View style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                    <Text style={{ ...T.text15, color: theme.textColor, flex: 1 }} numberOfLines={1}>
                        {record.method} {record.path}
                    </Text>
                    <StatusBadge status={record.status} />
                </View>
                <Space height={6} />
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{record.domain}</Text>
                <Space height={6} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{formatTrafficTime(record.timestamp)}</Text>
                    <Text style={{ ...T.text12, color: durationColor(record.request_time) }}>{record.request_time}ms</Text>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{record.country_iso || '??'}</Text>
                </View>
            </View>
        </Cluster>
    )
}

export function StatusBadge({ status }: { status: number }) {
    const backgroundColor = status >= 500 ? '#ff8b8b22' : status >= 400 ? '#f5c66f22' : '#70e2a022'
    const color = status >= 500 ? '#ff8b8b' : status >= 400 ? '#f5c66f' : '#70e2a0'

    return (
        <View style={{ borderRadius: 999, backgroundColor, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ ...T.text12, color }}>{status}</Text>
        </View>
    )
}

function TrafficTab({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable onPress={onPress} style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: active ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
            backgroundColor: active ? theme.orangeTransparent : '#ffffff08',
            paddingHorizontal: 14,
            paddingVertical: 9,
        }}>
            <Text style={{ ...T.text12, color: active ? theme.orange : theme.textColor }}>{label}</Text>
        </Pressable>
    )
}

function ChoicePill({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
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

export function formatTrafficTime(timestamp: string) {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return timestamp
    return date.toLocaleString('nb-NO', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

function durationColor(ms: number) {
    if (ms < 200) return '#70e2a0'
    if (ms < 800) return '#f5c66f'
    return '#ff8b8b'
}
