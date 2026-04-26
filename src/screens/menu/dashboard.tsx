import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getDashboardSummary } from '@utils/discoveryApi'
import { JSX, useEffect, useState } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function DashboardScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<NativeDashboardSummary | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')

    async function load() {
        setRefreshing(true)
        try {
            setData(await getDashboardSummary())
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard')
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 80 }}
                >
                    <Space height={90} />
                    {error ? (
                        <Cluster>
                            <View style={{ padding: 12 }}>
                                <Text style={{ ...T.text15, color: '#ff8b8b' }}>{error}</Text>
                            </View>
                        </Cluster>
                    ) : null}
                    {data ? (
                        <>
                            <Cluster>
                                <View style={{ padding: 5, flexDirection: 'row', gap: 10 }}>
                                    <Metric label='Events' value={data.counts.events} />
                                    <Metric label='Jobs' value={data.counts.jobs} />
                                </View>
                                <View style={{ padding: 5, flexDirection: 'row', gap: 10 }}>
                                    <Metric label='Organizations' value={data.counts.organizations} />
                                    <Metric label='Albums' value={data.counts.albums} />
                                </View>
                            </Cluster>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text20, color: theme.textColor }}>Top categories</Text>
                                    <Space height={8} />
                                    <CategoryList categories={data.categories.slice(0, 6)} />
                                </View>
                            </Cluster>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text20, color: theme.textColor }}>Recent additions</Text>
                                    <Space height={8} />
                                    {data.additions.slice(0, 6).map((item, index) => (
                                        <RecentAdditionRow
                                            key={`${item.source}-${item.id}`}
                                            item={item}
                                            showDivider={index !== Math.min(data.additions.length, 6) - 1}
                                        />
                                    ))}
                                </View>
                            </Cluster>
                        </>
                    ) : null}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function Metric({ label, value }: { label: string, value: number }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            minWidth: '47%',
            borderWidth: 1,
            borderColor: '#ffffff18',
            borderRadius: 14,
            backgroundColor: theme.contrast,
            padding: 12,
        }}>
            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={4} />
            <Text style={{ ...T.text25, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function CategoryList({ categories }: { categories: NativeDashboardSummary['categories'] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderWidth: 1,
            borderColor: '#ffffff18',
            borderRadius: 14,
            backgroundColor: theme.contrast,
            overflow: 'hidden',
        }}>
            {categories.map((item, index) => (
                <CategoryRow
                    key={item.id}
                    label={item.name_en}
                    value={item.event_count}
                    showDivider={index !== categories.length - 1}
                />
            ))}
        </View>
    )
}

function CategoryRow({
    label,
    value,
    showDivider,
}: {
    label: string
    value: number
    showDivider: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
            borderBottomWidth: showDivider ? 1 : 0,
            borderBottomColor: '#ffffff12',
            paddingHorizontal: 12,
            paddingVertical: 10,
        }}>
            <Text style={{ ...T.text15, color: theme.textColor, flex: 1 }}>
                {label}
            </Text>
            <Text style={{ ...T.text15, color: theme.textColor }}>
                {value}
            </Text>
        </View>
    )
}

function RecentAdditionRow({
    item,
    showDivider,
}: {
    item: NativeDashboardSummary['additions'][number]
    showDivider: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            paddingVertical: 10,
            borderBottomWidth: showDivider ? 1 : 0,
            borderBottomColor: '#ffffff10',
        }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>
                        {item.name_en}
                    </Text>
                    <Space height={5} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {formatAdditionSource(item.source)}
                    </Text>
                </View>
                <View style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: item.action === 'created'
                        ? theme.orangeTransparentBorder
                        : theme.orangeTransparentBorderHighlighted,
                    backgroundColor: item.action === 'created'
                        ? theme.orangeTransparent
                        : theme.orangeTransparentHighlighted,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    alignSelf: 'center',
                }}>
                    <Text style={{
                        ...T.text12,
                        color: item.action === 'created' ? theme.textColor : theme.oppositeTextColor
                    }}>
                        {formatAdditionAction(item.action)}
                    </Text>
                </View>
            </View>
        </View>
    )
}

function formatAdditionSource(source: string) {
    if (!source) {
        return 'Unknown'
    }

    return source
        .split('_')
        .join(' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatAdditionAction(action: 'created' | 'updated') {
    return action === 'created' ? 'Created' : 'Updated'
}
