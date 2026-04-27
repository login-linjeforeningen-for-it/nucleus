import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getDatabaseOverview } from '@utils/queenbee/api'
import { JSX, useEffect, useState } from 'react'
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function DatabaseScreen({ navigation }: MenuProps<'DatabaseScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<GetDatabaseOverview | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [expandedClusters, setExpandedClusters] = useState<Record<string, boolean>>({})

    async function load() {
        setRefreshing(true)
        try {
            setData(await getDatabaseOverview())
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load database overview')
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='DatabaseScreen' navigation={navigation} />
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => void load()}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    {!!error && (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text15, color: '#ff8b8b' }}>
                                        {error}
                                    </Text>
                                </View>
                            </Cluster>
                        </>
                    )}
                    {data && (
                        <>
                            <Space height={10} />
                            <Cluster style={{
                                borderWidth: 1,
                                borderColor: theme.greyTransparentBorder,
                                backgroundColor: theme.greyTransparent,
                            }}>
                                <View style={{ padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                    <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Clusters</Text>
                                        <Text style={{ ...T.text20, color: theme.textColor }}>{data.clusterCount}</Text>
                                    </View>
                                    <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Databases</Text>
                                        <Text style={{ ...T.text20, color: theme.textColor }}>{data.databaseCount}</Text>
                                    </View>
                                    <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Active queries</Text>
                                        <Text style={{ ...T.text20, color: theme.textColor }}>{data.activeQueries}</Text>
                                    </View>
                                    <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Storage</Text>
                                        <Text style={{ ...T.text20, color: theme.textColor }}>
                                            {formatBytes(data.totalSizeBytes)}
                                        </Text>
                                    </View>
                                </View>
                            </Cluster>
                            <Space height={10} />
                            <TouchableOpacity
                                onPress={() => navigation.navigate('DatabaseBackupsScreen')}
                                activeOpacity={0.88}
                            >
                                <Cluster style={{
                                    borderWidth: 1,
                                    borderColor: theme.greyTransparentBorder,
                                    backgroundColor: theme.greyTransparent,
                                }}>
                                    <View style={{ padding: 14, alignItems: 'center' }}>
                                        <Text style={{ ...T.text15, color: theme.orange }}>
                                            Open backup management
                                        </Text>
                                    </View>
                                </Cluster>
                            </TouchableOpacity>
                            <Space height={10} />
                            {data.clusters.map(cluster => (
                                <ClusterCard
                                    key={cluster.id}
                                    cluster={cluster}
                                    expanded={!!expandedClusters[cluster.id]}
                                    onToggle={() => setExpandedClusters(current => ({
                                        ...current,
                                        [cluster.id]: !current[cluster.id],
                                    }))}
                                />
                            ))}
                        </>
                    )}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function ClusterCard({
    cluster,
    expanded,
    onToggle,
}: {
    cluster: DatabaseOverviewCluster
    expanded: boolean
    onToggle: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [expandedDatabases, setExpandedDatabases] = useState<Record<string, boolean>>({})
    const statusColor = getStatusColor(cluster.status)

    return (
        <View>
            <Cluster style={{
                borderWidth: 1,
                borderLeftWidth: expanded ? 3 : 1,
                borderColor: theme.greyTransparentBorder,
                borderLeftColor: expanded ? theme.orange : theme.greyTransparentBorder,
                backgroundColor: theme.greyTransparent,
            }}>
                <TouchableOpacity onPress={onToggle} activeOpacity={0.86}>
                    <View style={{ padding: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                            <View style={{ flex: 1, minWidth: 0 }}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                    <Text style={{ ...T.text20, color: theme.textColor }}>{cluster.name}</Text>
                                    <Pill label={cluster.status} color={statusColor} />
                                </View>
                                <Space height={5} />
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                    {`${cluster.project || 'No compose project'} · ${cluster.databaseCount} databases · ${
                                        formatBytes(cluster.totalSizeBytes)
                                    }`}
                                </Text>
                            </View>
                            <Text style={{ ...T.text20, color: theme.orange }}>{expanded ? '−' : '+'}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                {expanded && (
                    <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                        {cluster.error ? <ErrorBox message={cluster.error} /> : null}
                        <MetricGrid items={[
                            ['Current connections', String(cluster.currentConnections)],
                            ['Active queries', String(cluster.activeQueries)],
                            ['Databases', String(cluster.databaseCount)],
                            ['Storage footprint', formatBytes(cluster.totalSizeBytes)],
                        ]} />
                        <Space height={10} />
                        <QueryCard title='Longest running query' query={cluster.longestQuery} />
                        <Space height={10} />
                        <AverageQueryCard averageQuerySeconds={cluster.averageQuerySeconds} />
                        <Space height={10} />
                        {cluster.databases.map(database => (
                            <DatabaseCard
                                key={`${cluster.id}-${database.name}`}
                                clusterName={cluster.name}
                                database={database}
                                expanded={!!expandedDatabases[database.name]}
                                onToggle={() => setExpandedDatabases(current => ({
                                    ...current,
                                    [database.name]: !current[database.name],
                                }))}
                            />
                        ))}
                    </View>
                )}
            </Cluster>
            <Space height={10} />
        </View>
    )
}

function DatabaseCard({
    clusterName,
    database,
    expanded,
    onToggle,
}: {
    clusterName: string
    database: DatabaseOverviewItem
    expanded: boolean
    onToggle: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [tablesExpanded, setTablesExpanded] = useState(false)

    return (
        <View style={{
            borderRadius: 16,
            borderWidth: 1,
            borderLeftWidth: expanded ? 3 : 1,
            borderColor: '#ffffff12',
            borderLeftColor: expanded ? theme.orange : '#ffffff12',
            backgroundColor: '#00000024',
            marginBottom: 10,
        }}>
            <TouchableOpacity onPress={onToggle} activeOpacity={0.86}>
                <View style={{ padding: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ ...T.text18, color: theme.textColor }}>{database.name}</Text>
                            <Space height={5} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                {`${formatBytes(database.sizeBytes)} total · ${database.tableCount} tables · ${
                                    database.currentConnections
                                } connections · ${database.activeQueries} active queries`}
                            </Text>
                        </View>
                        <Pill label={clusterName} />
                        <Text style={{ ...T.text20, color: theme.orange }}>{expanded ? '−' : '+'}</Text>
                    </View>
                </View>
            </TouchableOpacity>
            {expanded && (
                <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                    <MetricGrid items={[
                        ['Largest table', database.largestTable || 'No tables'],
                        ['Longest query', formatDuration(database.longestQuerySeconds)],
                        ['Active queries', String(database.activeQueries)],
                        ['Open connections', String(database.currentConnections)],
                    ]} />
                    <Space height={10} />
                    <AverageQueryCard averageQuerySeconds={database.averageQuerySeconds} />
                    <Space height={10} />
                    <TouchableOpacity onPress={() => setTablesExpanded(current => !current)} activeOpacity={0.86}>
                        <View style={{
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: '#ffffff12',
                            backgroundColor: '#ffffff08',
                            padding: 12,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ ...T.text15, color: theme.textColor }}>Table footprint</Text>
                                    <Space height={4} />
                                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                        Inspect every table by data size, index size, and estimated row count.
                                    </Text>
                                </View>
                                <Text style={{ ...T.text20, color: theme.orange }}>{tablesExpanded ? '−' : '+'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {tablesExpanded ? <TableList database={database} /> : null}
                </View>
            )}
        </View>
    )
}

function QueryCard({ title, query }: { title: string; query: DatabaseOverviewQuery | null }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#ffffff12',
            backgroundColor: '#ffffff08',
            padding: 12,
        }}>
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

function AverageQueryCard({ averageQuerySeconds }: { averageQuerySeconds: DatabaseOverviewAverageQuery }) {
    return (
        <MetricGrid items={[
            ['1 minute', formatDuration(averageQuerySeconds.lastMinute)],
            ['5 minutes', formatDuration(averageQuerySeconds.lastFiveMinutes)],
            ['1 hour', formatDuration(averageQuerySeconds.lastHour)],
            ['1 day', formatDuration(averageQuerySeconds.lastDay)],
        ]} />
    )
}

function TableList({ database }: { database: DatabaseOverviewItem }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    if (!database.tables.length) {
        return (
            <View style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#ffffff12',
                backgroundColor: '#ffffff08',
                padding: 12,
                marginTop: 10,
            }}>
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                    No user tables were found in this database.
                </Text>
            </View>
        )
    }

    return (
        <View style={{ marginTop: 10 }}>
            {database.tables.map(table => (
                <View
                    key={`${database.name}-${table.schema}-${table.name}`}
                    style={{
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: '#ffffff12',
                        backgroundColor: '#ffffff08',
                        padding: 12,
                        marginBottom: 8,
                    }}
                >
                    <Text style={{ ...T.text15, color: theme.textColor }}>
                        {`${table.schema}.${table.name}`}
                    </Text>
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

function MetricGrid({ items }: { items: [string, string][] }) {
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

function Pill({ label, color }: { label: string; color?: string }) {
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

function ErrorBox({ message }: { message: string }) {
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

function formatBytes(bytes: number) {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / Math.pow(1024, power)
    return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`
}

function formatDuration(seconds: number | null) {
    if (seconds === null || seconds === undefined) {
        return 'No active queries'
    }

    if (seconds < 1) {
        return '<1s'
    }

    if (seconds < 60) {
        return `${Math.round(seconds)}s`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
}

function getStatusColor(status: string) {
    const normalized = status.toLowerCase()
    if (normalized.includes('healthy') || normalized.includes('running') || normalized.includes('up')) {
        return '#4ade80'
    }
    if (normalized.includes('warn') || normalized.includes('degraded')) {
        return '#facc15'
    }
    if (normalized.includes('error') || normalized.includes('down') || normalized.includes('failed')) {
        return '#fb7185'
    }

    return '#fd8738'
}
