import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getDatabaseOverview } from '@utils/queenbeeApi'
import { JSX, useEffect, useState } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function DatabaseScreen({ navigation }: MenuProps<'DatabaseScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<GetDatabaseOverview | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')

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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
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
                            {data.clusters.map(cluster => (
                                <View key={cluster.id}>
                                    <Cluster style={{
                                        borderWidth: 1,
                                        borderColor: theme.greyTransparentBorder,
                                        backgroundColor: theme.greyTransparent,
                                    }}>
                                        <View style={{ padding: 12 }}>
                                            <Text style={{ ...T.text20, color: theme.textColor }}>{cluster.name}</Text>
                                            <Space height={4} />
                                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                                {cluster.databaseCount} databases · {cluster.activeQueries} active queries ·{' '}
                                                {formatBytes(cluster.totalSizeBytes)}
                                            </Text>
                                            {cluster.longestQuery?.query && (
                                                <>
                                                    <Space height={8} />
                                                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                        Longest query
                                                    </Text>
                                                    <Space height={4} />
                                                    <Text style={{ ...T.text15, color: theme.textColor }}>
                                                        {cluster.longestQuery.query}
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </Cluster>
                                    <Space height={10} />
                                </View>
                            ))}
                        </>
                    )}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function formatBytes(bytes: number) {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / Math.pow(1024, power)
    return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`
}
