import Cluster from '@/components/shared/cluster'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'
import { ActionButton, BarNote, MetricPill, StatusPill } from './statusPrimitives'

export function ServiceRow({
    service,
    selected,
    showDetails,
    onClose,
    onPress,
    onEdit,
}: {
    service: NativeMonitoringService
    selected: boolean
    showDetails: boolean
    onClose: () => void
    onPress: () => void
    onEdit: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const latest = service.bars?.[0]
    const healthy = Boolean(latest?.status)

    return (
        <Pressable onPress={onPress}>
            <Cluster style={{
                borderWidth: 1,
                borderColor: selected ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
                backgroundColor: theme.greyTransparent,
            }}>
                <View style={{ padding: 12, gap: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>{service.name}</Text>
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                {`${service.enabled ? 'Enabled' : 'Disabled'} · ${service.uptime}% uptime`}
                            </Text>
                        </View>
                        <StatusPill label={healthy ? 'Up' : latest?.expectedDown ? 'Maintenance' : 'Down'} healthy={healthy} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <ActionButton label='View' onPress={onPress} small />
                        <ActionButton label='Edit' onPress={onEdit} small />
                    </View>
                    {showDetails ? (
                        <ServiceDetailsContent
                            service={service}
                            onClose={onClose}
                            onEdit={onEdit}
                        />
                    ) : null}
                </View>
            </Cluster>
        </Pressable>
    )
}

function ServiceDetailsContent({
    service,
    onClose,
    onEdit
}: {
    service: NativeMonitoringService
    onClose: () => void
    onEdit: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderTopColor: theme.greyTransparentBorder,
            borderTopWidth: 1,
            gap: 10,
            paddingTop: 10
        }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>Details</Text>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <ActionButton label='Edit' onPress={onEdit} small />
                    <Pressable
                        onPress={onClose}
                        hitSlop={10}
                        style={{
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: theme.greyTransparentBorder,
                            backgroundColor: '#ffffff08',
                            height: 30,
                            width: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>x</Text>
                    </Pressable>
                </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <MetricPill label='Uptime' value={`${service.uptime}%`} />
                <MetricPill label='Failures' value={String(service.maxConsecutiveFailures)} />
                <MetricPill label='Port' value={service.port ? String(service.port) : 'N/A'} />
            </View>
            {service.bars.slice(0, 8).map((bar, index) => (
                <View key={`${service.id}-${bar.timestamp}-${index}`} style={{
                    borderRadius: 12,
                    backgroundColor: '#00000022',
                    padding: 10,
                }}>
                    <Text style={{ ...T.text12, color: bar.status ? '#7ee787' : '#ff8b8b' }}>
                        {`${bar.status ? 'UP' : bar.expectedDown ? 'MAINTENANCE' : 'DOWN'} · ${
                            Math.round(bar.delay || 0)
                        } ms`}
                    </Text>
                    <BarNote note={bar.note} timestamp={bar.timestamp} />
                </View>
            ))}
        </View>
    )
}
