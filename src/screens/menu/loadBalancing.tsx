import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { LoadBalancingSiteCard, LoadBalancingSummary } from '@/components/menu/loadBalancing/loadBalancingCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getLoadBalancingSites, setPrimaryLoadBalancingSite } from '@utils/queenbee/api'
import { JSX, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function LoadBalancingScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [sites, setSites] = useState<NativeLoadBalancingSite[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [switchingId, setSwitchingId] = useState<number | null>(null)

    const summary = useMemo(() => {
        const primary = sites.find(site => site.primary) || null
        const healthy = sites.filter(site => site.operational && !site.maintenance).length
        return { primary, healthy }
    }, [sites])

    async function load() {
        setRefreshing(true)
        try {
            setSites(await getLoadBalancingSites())
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load load balancing')
        } finally {
            setRefreshing(false)
        }
    }

    async function makePrimary(id: number) {
        setSwitchingId(id)
        try {
            await setPrimaryLoadBalancingSite(id)
            await load()
        } catch (switchError) {
            setError(switchError instanceof Error ? switchError.message : 'Failed to switch primary')
        } finally {
            setSwitchingId(null)
        }
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => load()}
                            tintColor={theme.refresh}
                            progressViewOffset={100}
                        />
                    }
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <LoadBalancingSummary
                        sites={sites}
                        primary={summary.primary}
                        healthy={summary.healthy}
                    />
                    {!!error && (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text15, color: '#ff8b8b' }}>{error}</Text>
                                </View>
                            </Cluster>
                        </>
                    )}
                    <Space height={10} />
                    {sites.map(site => (
                        <LoadBalancingSiteCard
                            key={site.id}
                            site={site}
                            switchingId={switchingId}
                            onMakePrimary={(id) => makePrimary(id)}
                        />
                    ))}
                </ScrollView>
            </View>
        </Swipe>
    )
}
