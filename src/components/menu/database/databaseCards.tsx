import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { formatBytes, formatDuration, getStatusColor } from '@utils/queenbee/databaseFormatting'
import { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { AverageQueryCard, ErrorBox, MetricGrid, Pill, QueryCard, TableList } from './databasePrimitives'

export function ClusterCard({
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
                            <ClusterTitle cluster={cluster} statusColor={statusColor} />
                            <Text style={{ ...T.text20, color: theme.orange }}>{expanded ? '−' : '+'}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                {expanded ? (
                    <ClusterDetails
                        cluster={cluster}
                        expandedDatabases={expandedDatabases}
                        onToggleDatabase={(name) => setExpandedDatabases(current => ({
                            ...current,
                            [name]: !current[name],
                        }))}
                    />
                ) : null}
            </Cluster>
            <Space height={10} />
        </View>
    )
}

function ClusterTitle({ cluster, statusColor }: { cluster: DatabaseOverviewCluster, statusColor: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>{cluster.name}</Text>
                <Pill label={cluster.status} color={statusColor} />
            </View>
            <Space height={5} />
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                {`${cluster.project || 'No compose project'} · ${cluster.databaseCount} databases · ${formatBytes(cluster.totalSizeBytes)}`}
            </Text>
        </View>
    )
}

function ClusterDetails({
    cluster,
    expandedDatabases,
    onToggleDatabase,
}: {
    cluster: DatabaseOverviewCluster
    expandedDatabases: Record<string, boolean>
    onToggleDatabase: (name: string) => void
}) {
    return (
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
                    onToggle={() => onToggleDatabase(database.name)}
                />
            ))}
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
                <DatabaseHeader clusterName={clusterName} database={database} expanded={expanded} />
            </TouchableOpacity>
            {expanded ? (
                <DatabaseDetails
                    database={database}
                    tablesExpanded={tablesExpanded}
                    onToggleTables={() => setTablesExpanded(current => !current)}
                />
            ) : null}
        </View>
    )
}

function DatabaseHeader({ clusterName, database, expanded }: { clusterName: string, database: DatabaseOverviewItem, expanded: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
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
    )
}

function DatabaseDetails({ database, tablesExpanded, onToggleTables }: {
    database: DatabaseOverviewItem
    tablesExpanded: boolean
    onToggleTables: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
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
            <TouchableOpacity onPress={onToggleTables} activeOpacity={0.86}>
                <View style={{ borderRadius: 14, borderWidth: 1, borderColor: '#ffffff12', backgroundColor: '#ffffff08', padding: 12 }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>Table footprint</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        Inspect every table by data size, index size, and estimated row count.
                    </Text>
                </View>
            </TouchableOpacity>
            {tablesExpanded ? <TableList database={database} /> : null}
        </View>
    )
}
