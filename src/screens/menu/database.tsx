import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { ClusterCard } from '@components/menu/database/databaseCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getDatabaseOverview } from '@utils/queenbee/api'
import { formatBytes } from '@utils/queenbee/databaseFormatting'
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
        load()
    }, [])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => load()}
                        tintColor={theme.orange}
                        colors={[theme.orange]}
                        progressViewOffset={0}
                    />}
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    {!!error && <DatabaseError message={error} />}
                    {data && (
                        <>
                            <DatabaseSummary data={data} />
                            <BackupLink onPress={() => navigation.navigate('DatabaseBackupsScreen')} />
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

function DatabaseSummary({ data }: { data: GetDatabaseOverview }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Space height={10} />
            <Cluster style={{
                borderWidth: 1,
                borderColor: theme.greyTransparentBorder,
                backgroundColor: theme.greyTransparent,
            }}>
                <View style={{ padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    <SummaryValue label='Clusters' value={data.clusterCount} />
                    <SummaryValue label='Databases' value={data.databaseCount} />
                    <SummaryValue label='Active queries' value={data.activeQueries} />
                    <SummaryValue label='Storage' value={formatBytes(data.totalSizeBytes)} />
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function SummaryValue({ label, value }: { label: string, value: string | number }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Text style={{ ...T.text20, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function BackupLink({ onPress }: { onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
            <Cluster style={{
                borderWidth: 1,
                borderColor: theme.greyTransparentBorder,
                backgroundColor: theme.greyTransparent,
            }}>
                <View style={{ padding: 14, alignItems: 'center' }}>
                    <Text style={{ ...T.text15, color: theme.orange }}>Open backup management</Text>
                </View>
            </Cluster>
            <Space height={10} />
        </TouchableOpacity>
    )
}

function DatabaseError({ message }: { message: string }) {
    return (
        <>
            <Space height={10} />
            <Cluster>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text15, color: '#ff8b8b' }}>{message}</Text>
                </View>
            </Cluster>
        </>
    )
}
