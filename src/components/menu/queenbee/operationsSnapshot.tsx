import Cluster from '@/components/shared/cluster'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import {
    FailoverButton,
    FailoverState,
    getPrimarySiteColor,
    SnapshotPill,
} from './snapshotPill'

type OperationsSnapshotProps = {
    system: System | null
    requestsToday: number | null
    primarySite: NativeLoadBalancingSite | null
    failoverTarget: NativeLoadBalancingSite | null
    failoverTone: FailoverState
    failoverLoading: boolean
    healthySites: number
    sitesLength: number
    databaseCount: number | null
    databaseSize: number | null
    vulnerabilityValue: SnapshotSummary | null
    onOpenStatus: () => void
    onOpenTraffic: () => void
    onOpenDatabases: () => void
    onOpenVulnerabilities: () => void
    onFailover: () => void
}

export default function OperationsSnapshot({
    system,
    requestsToday,
    primarySite,
    failoverTarget,
    failoverTone,
    failoverLoading,
    healthySites,
    sitesLength,
    databaseCount,
    databaseSize,
    vulnerabilityValue,
    onOpenStatus,
    onOpenTraffic,
    onOpenDatabases,
    onOpenVulnerabilities,
    onFailover,
}: OperationsSnapshotProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const primarySiteColor = getPrimarySiteColor(primarySite, theme)

    return (
        <Cluster>
            <View style={{ gap: 8 }}>
                <SnapshotPill
                    icon='shield'
                    label='Primary site'
                    value={primarySite ? primarySite.name : 'Unknown'}
                    color={primarySiteColor}
                    subvalue={failoverTarget ? `Failover target: ${failoverTarget.name}` : 'No healthy failover target'}
                    action={
                        <FailoverButton
                            disabled={!failoverTarget || failoverLoading}
                            loading={failoverLoading}
                            tone={failoverTone}
                            onPress={onFailover}
                        />
                    }
                    onPress={onOpenStatus}
                />
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                    <SnapshotPill
                        icon='server'
                        label='Containers'
                        value={system ? system.containers : 'Unavailable'}
                        onPress={onOpenStatus}
                    />
                    <SnapshotPill
                        icon='activity'
                        label='Requests today'
                        value={requestsToday !== null
                            ? requestsToday
                            : primarySite
                                ? `${primarySite.name} · ${healthySites}/${sitesLength} healthy`
                                : 'Unavailable'}
                        onPress={onOpenTraffic}
                    />
                    <SnapshotPill
                        icon='database'
                        label='Databases'
                        value={databaseCount !== null ? databaseCount : 'Unavailable'}
                        subvalue={databaseSize !== null ? formatBytes(databaseSize) : null}
                        onPress={onOpenDatabases}
                    />
                    <SnapshotPill
                        icon='shield'
                        label='Vulnerabilities'
                        value={vulnerabilityValue?.value || 'Unavailable'}
                        subvalue={vulnerabilityValue?.subvalue || null}
                        onPress={onOpenVulnerabilities}
                    />
                </View>
            </View>
        </Cluster>
    )
}

function formatBytes(bytes: number) {
    if (!bytes) {
        return '0 B'
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / Math.pow(1024, power)

    return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`
}
