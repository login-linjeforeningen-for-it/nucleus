import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export function LoadBalancingSummary({
    sites,
    primary,
    healthy,
}: {
    sites: NativeLoadBalancingSite[]
    primary: NativeLoadBalancingSite | null
    healthy: number
}) {
    return (
        <Cluster>
            <Space height={14} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                <SummaryMetric
                    label='Primary site'
                    value={primary?.name || 'Unset'}
                    detail={primary?.ip || 'No active primary target'}
                    tone={primary?.operational ? 'healthy' : 'idle'}
                />
                <SummaryMetric
                    label='Healthy targets'
                    value={`${healthy}/${sites.length}`}
                    detail={sites.length
                        ? `${sites.length - healthy} unavailable or in maintenance`
                        : 'No targets configured'}
                    tone={healthy === sites.length && sites.length > 0 ? 'healthy' : 'warning'}
                />
            </View>
        </Cluster>
    )
}

export function LoadBalancingSiteCard({
    site,
    switchingId,
    onMakePrimary,
}: {
    site: NativeLoadBalancingSite
    switchingId: number | null
    onMakePrimary: (id: number) => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View>
            <Cluster>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>{site.name}</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{site.ip}</Text>
                    <Space height={8} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`${site.primary ? 'Primary' : 'Secondary'} · ${site.operational ? 'Operational' : 'Down'}${
                            site.maintenance ? ' · Maintenance' : ''
                        }`}
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
                        onPress={() => onMakePrimary(site.id)}
                    >
                        <View style={{
                            borderRadius: 14,
                            backgroundColor: site.primary ? '#ffffff10' : theme.orange,
                            paddingHorizontal: 14,
                            paddingVertical: 10
                        }}>
                            <Text style={{ ...T.centered15, color: site.primary ? theme.textColor : theme.darker }}>
                                {site.primary ? 'Serving traffic' : switchingId === site.id ? 'Switching...' : 'Make primary'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Cluster>
            <Space height={10} />
        </View>
    )
}

function SummaryMetric({ label, value, detail, tone }: {
    label: string
    value: string
    detail: string
    tone: 'healthy' | 'warning' | 'idle'
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const dotColor = tone === 'healthy' ? '#70e2a0' : tone === 'warning' ? theme.orange : theme.oppositeTextColor

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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
                <Text style={{ ...T.text12, color: theme.oppositeTextColor, textTransform: 'uppercase', letterSpacing: 0.6 }}>
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
