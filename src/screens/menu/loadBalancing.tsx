import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getLoadBalancingSites, setPrimaryLoadBalancingSite } from '@utils/queenbee/api'
import { JSX, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native'
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
        void load()
    }, [])

    return (
        <Swipe left='QueenbeeScreen'>
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
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <Cluster>
                        <Space height={14} />
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            <SummaryMetric
                                label='Primary site'
                                value={summary.primary?.name || 'Unset'}
                                detail={summary.primary?.ip || 'No active primary target'}
                                tone={summary.primary?.operational ? 'healthy' : 'idle'}
                            />
                            <SummaryMetric
                                label='Healthy targets'
                                value={`${summary.healthy}/${sites.length}`}
                                detail={sites.length
                                    ? `${sites.length - summary.healthy} unavailable or in maintenance`
                                    : 'No targets configured'}
                                tone={summary.healthy === sites.length && sites.length > 0 ? 'healthy' : 'warning'}
                            />
                        </View>
                    </Cluster>
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
                        <View key={site.id}>
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text20, color: theme.textColor }}>{site.name}</Text>
                                    <Space height={4} />
                                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{site.ip}</Text>
                                    <Space height={8} />
                                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                        {`${site.primary ? 'Primary' : 'Secondary'} · ${
                                            site.operational ? 'Operational' : 'Down'
                                        }${site.maintenance ? ' · Maintenance' : ''}`}
                                    </Text>
                                    {!!site.note && (
                                        <>
                                            <Space height={6} />
                                            <Text style={{ ...T.text15, color: theme.textColor }}>{site.note}</Text>
                                        </>
                                    )}
                                    <Space height={10} />
                                    <TouchableOpacity
                                        disabled={site.primary || switchingId === site.id}
                                        onPress={() => void makePrimary(site.id)}
                                    >
                                        <View style={{
                                            borderRadius: 14,
                                            backgroundColor: site.primary ? '#ffffff10' : theme.orange,
                                            paddingHorizontal: 14,
                                            paddingVertical: 10
                                        }}>
                                            <Text style={{
                                                ...T.centered15,
                                                color: site.primary ? theme.textColor : theme.darker,
                                            }}>
                                                {site.primary
                                                    ? 'Serving traffic'
                                                    : switchingId === site.id ? 'Switching...' : 'Make primary'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </Cluster>
                            <Space height={10} />
                        </View>
                    ))}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function SummaryMetric({
    label,
    value,
    detail,
    tone,
}: {
    label: string
    value: string
    detail: string
    tone: 'healthy' | 'warning' | 'idle'
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const dotColor = tone === 'healthy'
        ? '#70e2a0'
        : tone === 'warning'
            ? theme.orange
            : theme.oppositeTextColor

    return (
        <View style={{
            flexBasis: '47%',
            flexGrow: 1,
            minHeight: 108,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.06)',
            padding: 14,
            justifyContent: 'space-between',
        }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
            }}>
                <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: dotColor,
                }} />
                <Text style={{
                    ...T.text12,
                    color: theme.oppositeTextColor,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                }}>
                    {label}
                </Text>
            </View>
            <View>
                <Text style={{ ...T.text25, color: theme.textColor }}>
                    {value}
                </Text>
                <Space height={4} />
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                    {detail}
                </Text>
            </View>
        </View>
    )
}
