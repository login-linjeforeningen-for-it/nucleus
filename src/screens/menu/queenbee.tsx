import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import QueenbeeGate from '@components/menu/queenbee/gate'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import SummaryListCard from '@components/menu/queenbee/summaryListCard'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import { JSX, useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    RefreshControl,
    ScrollView,
    View
} from 'react-native'
import { useSelector } from 'react-redux'
import { getDashboardSummary } from '@utils/discoveryApi'
import {
    getDatabaseContainerCount,
    getDatabaseOverview,
    getInternalOverview,
    getLoadBalancingSites,
    getVulnerabilitiesOverview,
} from '@utils/queenbeeApi'
import { startLogin } from '@utils/auth'

export default function QueenbeeScreen({ navigation }: MenuProps<'QueenbeeScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login, groups } = useSelector((state: ReduxState) => state.login)
    const [dashboard, setDashboard] = useState<NativeDashboardSummary | null>(null)
    const [internalOverview, setInternalOverview] = useState<NativeInternalOverview | null>(null)
    const [sites, setSites] = useState<{ name: string, primary: boolean, operational: boolean, maintenance: boolean }[]>([])
    const [databaseOverview, setDatabaseOverview] = useState<GetDatabaseOverview | null>(null)
    const [databaseFallbackCount, setDatabaseFallbackCount] = useState<number | null>(null)
    const [vulnerabilities, setVulnerabilities] = useState<unknown>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const hasQueenbee = useMemo(() =>
        groups.map(group => group.toLowerCase()).includes('queenbee'),
    [groups])

    useEffect(() => {
        if (!login || !hasQueenbee) {
            return
        }

        void refresh()
    }, [login, hasQueenbee])

    async function refresh() {
        try {
            setLoading(true)
            setError(null)
            const [
                dashboardPayload,
                systemPayload,
                sitesPayload,
                databasePayload,
                databaseCountPayload,
                vulnerabilityPayload,
            ] = await Promise.all([
                getDashboardSummary().catch(() => null),
                getInternalOverview().catch(() => null),
                getLoadBalancingSites().catch(() => []),
                getDatabaseOverview().catch(() => null),
                getDatabaseContainerCount().catch(() => null),
                getVulnerabilitiesOverview().catch(() => null),
            ])
            setDashboard(dashboardPayload)
            setInternalOverview(systemPayload)
            setSites(sitesPayload)
            setDatabaseOverview(databasePayload)
            setDatabaseFallbackCount(databaseCountPayload)
            setVulnerabilities(vulnerabilityPayload)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load Queenbee.')
        } finally {
            setLoading(false)
        }
    }

    const primarySite = useMemo(() => sites.find(site => site.primary) || null, [sites])
    const healthySites = useMemo(() => sites.filter(site => site.operational && !site.maintenance).length, [sites])
    const databaseCount = useMemo(() => getDatabaseCount(
        databaseOverview,
        internalOverview?.databaseOverview,
        internalOverview?.databaseCount,
        databaseFallbackCount,
    ), [databaseFallbackCount, databaseOverview, internalOverview])
    const vulnerabilityTotals = useMemo(() => getVulnerabilityTotals(
        vulnerabilities,
    ), [vulnerabilities])

    if (!login) {
        return (
            <QueenbeeGate
                backgroundColor={theme.darker}
                textColor={theme.textColor}
                mutedTextColor={theme.oppositeTextColor}
                title='Queenbee'
                body='Sign in to use Queenbee.'
                actionLabel='Sign in'
                actionColor={theme.orange}
                actionTextColor={theme.darker}
                onPress={() => startLogin('queenbee')}
            />
        )
    }

    if (!hasQueenbee) {
        return (
            <QueenbeeGate
                backgroundColor={theme.darker}
                textColor={theme.textColor}
                mutedTextColor={theme.oppositeTextColor}
                title='Queenbee'
                body='Your account is signed in, but it does not currently have Queenbee access.'
            />
        )
    }

    const siteItems = sites.map(site => ({
        title: `${site.name}${site.primary ? ' · primary' : ''}`,
        body: `${site.operational ? 'Operational' : 'Down'}${site.maintenance ? ' · maintenance' : ''}`
    }))

    const clusterItems = (databaseOverview?.clusters || []).map(cluster => ({
        title: cluster.name,
        body: `${getClusterDatabaseCount(cluster)} databases · ${cluster.activeQueries} active queries`
    }))

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='QueenbeeScreen' navigation={navigation} />
                <ScrollView
                    style={GS.content}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    {loading && <ActivityIndicator color={theme.orange} />}
                    {error && <Text style={{ ...T.centered15, color: 'red' }}>{error}</Text>}

                    <OperationsSnapshot
                        system={internalOverview?.system || null}
                        requestsToday={internalOverview?.requestsToday ?? null}
                        primarySite={primarySite}
                        healthySites={healthySites}
                        sitesLength={sites.length}
                        databaseCount={databaseCount}
                        vulnerabilityCount={vulnerabilityTotals.findings}
                        vulnerabilityImages={vulnerabilityTotals.images}
                        onOpenStatus={() => navigation.navigate('StatusScreen')}
                        onOpenTraffic={() => navigation.navigate('TrafficScreen')}
                        onOpenDatabases={() => navigation.navigate('DatabaseScreen')}
                        onOpenVulnerabilities={() => navigation.navigate('VulnerabilitiesScreen')}
                    />
                    <DashboardSummary data={dashboard} />
                    <SummaryListCard title='Traffic targets' items={siteItems} theme={theme} />
                    <SummaryListCard title='Database clusters' items={clusterItems} theme={theme} />
                    <Space height={30} />
                </ScrollView>
            </View>
        </Swipe>
    )
}

function OperationsSnapshot({
    system,
    requestsToday,
    primarySite,
    healthySites,
    sitesLength,
    databaseCount,
    vulnerabilityCount,
    vulnerabilityImages,
    onOpenStatus,
    onOpenTraffic,
    onOpenDatabases,
    onOpenVulnerabilities,
}: {
    system: System | null
    requestsToday: number | null
    primarySite: { name: string, primary: boolean, operational: boolean, maintenance: boolean } | null
    healthySites: number
    sitesLength: number
    databaseCount: number | null
    vulnerabilityCount: number
    vulnerabilityImages: number
    onOpenStatus: () => void
    onOpenTraffic: () => void
    onOpenDatabases: () => void
    onOpenVulnerabilities: () => void
}) {
    return (
        <Cluster>
            <View>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                    <SnapshotPill
                        label='Status'
                        value={system ? `${system.containers} containers` : 'Unavailable'}
                        onPress={onOpenStatus}
                    />
                    <SnapshotPill
                        label='Traffic'
                        value={requestsToday !== null
                            ? `${requestsToday} requests today`
                            : primarySite
                                ? `${primarySite.name} · ${healthySites}/${sitesLength} healthy`
                                : 'Unavailable'}
                        onPress={onOpenTraffic}
                    />
                    <SnapshotPill
                        label='Databases'
                        value={databaseCount !== null ? `${databaseCount} databases` : 'Unavailable'}
                        onPress={onOpenDatabases}
                    />
                    <SnapshotPill
                        label='Vulnerabilities'
                        value={`${vulnerabilityImages} images · ${vulnerabilityCount} findings`}
                        onPress={onOpenVulnerabilities}
                    />
                </View>
            </View>
        </Cluster>
    )
}

function SnapshotPill({
    label,
    value,
    onPress,
}: {
    label: string
    value: string
    onPress: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                minWidth: '47%',
                flex: 1,
                borderRadius: 16,
                backgroundColor: pressed ? 'rgba(255,255,255,0.10)' : theme.contrast,
                padding: 12,
            })}
        >
            <View>
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
                <Space height={4} />
                <Text style={{ ...T.text15, color: theme.textColor }}>{value}</Text>
            </View>
        </Pressable>
    )
}

function getDatabaseCount(...sources: unknown[]) {
    const counts = sources
        .flatMap((source) => getDatabaseCountsFromSource(source))
        .filter((count): count is number => count !== null)

    return counts.length ? Math.max(...counts) : null
}

function getDatabaseCountsFromSource(source: unknown): (number | null)[] {
    const record = unwrapRecord(source, ['data', 'result', 'databaseOverview'])
    if (!record) {
        return [readNumber(source)]
    }

    const clusters = toArray(record.clusters)
    const clusterTotal = clusters.reduce<number>(
        (sum, cluster) => sum + getClusterDatabaseCount(cluster),
        0
    )
    const databases = toArray(record.databases)

    return [
        readNumber(record.databaseCount),
        readNumber(record.count),
        databases.length ? databases.length : null,
        clusterTotal || null,
    ]
}

function getClusterDatabaseCount(cluster: unknown) {
    const record = toRecord(cluster)
    if (!record) {
        return 0
    }

    return Math.max(
        readNumber(record.databaseCount) || 0,
        toArray(record.databases).length
    )
}

function getVulnerabilityTotals(...sources: unknown[]) {
    const totals = sources.map(getVulnerabilityTotalsFromSource)
    const images = Math.max(...totals.map(total => total.images), 0)
    const findings = Math.max(...totals.map(total => total.findings), 0)

    return { images, findings }
}

function getVulnerabilityTotalsFromSource(source: unknown) {
    const record = unwrapRecord(source, ['data', 'result', 'report', 'vulnerabilityReport'])
    if (!record) {
        return { images: 0, findings: 0 }
    }

    const images = toArray(record.images)
    const findings = images.reduce<number>((sum, image) => {
        const imageRecord = toRecord(image)
        if (!imageRecord) {
            return sum
        }

        const detailCount = Math.max(
            toArray(imageRecord.vulnerabilities).length,
            toArray(imageRecord.findings).length,
            toArray(imageRecord.cves).length,
        )
        const severity = toRecord(imageRecord.severity)
        const severityCount = Object.values(severity || {}).reduce<number>(
            (severitySum, value) => severitySum + (typeof value === 'number' ? value : 0),
            0
        )

        return sum + Math.max(
            readNumber(imageRecord.totalVulnerabilities) || 0,
            readNumber(imageRecord.total) || 0,
            detailCount,
            severityCount
        )
    }, 0)
    const topLevelFindings = Math.max(
        readNumber(record.totalVulnerabilities) || 0,
        readNumber(record.totalFindings) || 0,
        readNumber(record.findings) || 0,
        toArray(record.vulnerabilities).length,
    )

    return {
        images: Math.max(readNumber(record.imageCount) || 0, images.length),
        findings: Math.max(findings, topLevelFindings),
    }
}

function unwrapRecord(source: unknown, keys: string[]): Record<string, unknown> | null {
    const record = toRecord(source)
    if (!record) {
        return null
    }

    for (const key of keys) {
        const nested = toRecord(record[key])
        if (nested) {
            return nested
        }
    }

    return record
}

function toRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null
}

function toArray(value: unknown): unknown[] {
    if (Array.isArray(value)) {
        return value
    }

    const record = toRecord(value)
    return record ? Object.values(record) : []
}

function readNumber(value: unknown): number | null {
    const nextValue = Number(value)
    return Number.isFinite(nextValue) ? nextValue : null
}

function DashboardSummary({ data }: { data: NativeDashboardSummary | null }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    if (!data) {
        return null
    }

    return (
        <>
            <Space height={14} />
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>Dashboard</Text>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Metric label='Events' value={data.counts.events} />
                        <Metric label='Jobs' value={data.counts.jobs} />
                    </View>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Metric label='Organizations' value={data.counts.organizations} />
                        <Metric label='Albums' value={data.counts.albums} />
                    </View>
                </View>
            </Cluster>
            <Space height={10} />
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>Top categories</Text>
                    <Space height={8} />
                    {data.categories.slice(0, 6).map((item) => (
                        <View
                            key={item.id}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                gap: 12,
                                marginBottom: 8,
                            }}
                        >
                            <Text style={{ ...T.text15, color: theme.textColor, flex: 1 }}>
                                {item.name_en}
                            </Text>
                            <Text style={{ ...T.text15, color: theme.textColor }}>
                                {item.event_count}
                            </Text>
                        </View>
                    ))}
                </View>
            </Cluster>
            <Space height={10} />
            <Cluster style={{ paddingHorizontal: 0 }}>
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
    )
}

function Metric({ label, value }: { label: string, value: number }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ffffff18',
            borderRadius: 14,
            padding: 12,
        }}>
            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={4} />
            <Text style={{ ...T.text25, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function RecentAdditionRow({
    item,
    showDivider,
}: {
    item: NativeDashboardSummary['additions'][number]
    showDivider: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            paddingVertical: 10,
            borderBottomWidth: showDivider ? 1 : 0,
            borderBottomColor: '#ffffff10',
        }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>
                        {item.name_en}
                    </Text>
                    <Space height={5} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {formatAdditionSource(item.source)}
                    </Text>
                </View>
                <View style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: item.action === 'created' ? theme.orangeTransparentBorder : '#ffffff12',
                    backgroundColor: item.action === 'created' ? theme.orangeTransparent : '#ffffff08',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    alignSelf: 'center',
                }}>
                    <Text style={{
                        ...T.text12,
                        color: item.action === 'created' ? theme.textColor : theme.oppositeTextColor
                    }}>
                        {formatAdditionAction(item.action)}
                    </Text>
                </View>
            </View>
        </View>
    )
}

function formatAdditionSource(source: string) {
    if (!source) {
        return 'Unknown'
    }

    return source
        .split('_')
        .join(' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatAdditionAction(action: 'created' | 'updated') {
    return action === 'created' ? 'Created' : 'Updated'
}
