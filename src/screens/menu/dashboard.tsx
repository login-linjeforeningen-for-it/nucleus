import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { CategoryList, DashboardMetrics, RecentAdditionRow } from '@/components/menu/dashboard/dashboardCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getDashboardSummary } from '@utils/discovery/discoveryApi'
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
                            <DashboardMetrics counts={data.counts} />
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
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}
