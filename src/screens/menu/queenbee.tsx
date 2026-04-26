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
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg'
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
    vulnerabilityCount: number | null
    vulnerabilityImages: number | null
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
                        icon='server'
                        label='Status'
                        value={system ? `${system.containers} containers` : 'Unavailable'}
                        onPress={onOpenStatus}
                    />
                    <SnapshotPill
                        icon='activity'
                        label='Traffic'
                        value={requestsToday !== null
                            ? `${requestsToday} requests today`
                            : primarySite
                                ? `${primarySite.name} · ${healthySites}/${sitesLength} healthy`
                                : 'Unavailable'}
                        onPress={onOpenTraffic}
                    />
                    <SnapshotPill
                        icon='database'
                        label='Databases'
                        value={databaseCount !== null ? `${databaseCount} databases` : 'Unavailable'}
                        onPress={onOpenDatabases}
                    />
                    <SnapshotPill
                        icon='shield'
                        label='Vulnerabilities'
                        value={vulnerabilityImages !== null && vulnerabilityCount !== null
                            ? `${vulnerabilityImages} images · ${vulnerabilityCount} findings`
                            : 'Unavailable'}
                        onPress={onOpenVulnerabilities}
                    />
                </View>
            </View>
        </Cluster>
    )
}

function SnapshotPill({
    icon,
    label,
    value,
    onPress,
}: {
    icon: QueenbeeIconName
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
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <IconBadge name={icon} />
                <View style={{ flex: 1 }}>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text15, color: theme.textColor }}>{value}</Text>
                </View>
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
    const availableTotals = totals.filter((total): total is { images: number, findings: number } => total !== null)
    if (!availableTotals.length) {
        return { images: null, findings: null }
    }

    const images = Math.max(...availableTotals.map(total => total.images), 0)
    const findings = Math.max(...availableTotals.map(total => total.findings), 0)

    return { images, findings }
}

function getVulnerabilityTotalsFromSource(source: unknown) {
    const record = findVulnerabilityReportRecord(source)

    if (!record) {
        return null
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
    const scanStatus = toRecord(record.scanStatus)

    return {
        images: Math.max(
            readNumber(record.imageCount) || 0,
            readNumber(record.totalImages) || 0,
            readNumber(scanStatus?.totalImages) || 0,
            images.length
        ),
        findings: Math.max(findings, topLevelFindings),
    }
}

function findVulnerabilityReportRecord(source: unknown) {
    const queue = [source]
    const visited = new Set<unknown>()
    let fallback: Record<string, unknown> | null = null

    while (queue.length) {
        const current = queue.shift()
        const record = toRecord(current)
        if (!record || visited.has(record)) {
            continue
        }

        visited.add(record)
        if ('images' in record || 'imageCount' in record) {
            return record
        }

        if (!fallback && (
            'totalVulnerabilities' in record
            || 'totalFindings' in record
            || 'vulnerabilities' in record
        )) {
            fallback = record
        }

        for (const value of Object.values(record)) {
            if (toRecord(value)) {
                queue.push(value)
            }
        }
    }

    return fallback
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
                        <Metric icon='calendar' label='Events' value={data.counts.events} />
                        <Metric icon='briefcase' label='Jobs' value={data.counts.jobs} />
                    </View>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Metric icon='building' label='Organizations' value={data.counts.organizations} />
                        <Metric icon='image' label='Albums' value={data.counts.albums} />
                    </View>
                </View>
            </Cluster>
            <Space height={10} />
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>Top categories</Text>
                    <Space height={8} />
                    <CategoryList categories={data.categories.slice(0, 6)} />
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

function Metric({
    icon,
    label,
    value,
}: {
    icon: QueenbeeIconName
    label: string
    value: number
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ffffff18',
            borderRadius: 14,
            backgroundColor: theme.contrast,
            padding: 12,
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <IconBadge name={icon} small />
                <View>
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text25, color: theme.textColor }}>{value}</Text>
                </View>
            </View>
        </View>
    )
}

function CategoryList({ categories }: { categories: NativeDashboardSummary['categories'] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderWidth: 1,
            borderColor: '#ffffff18',
            borderRadius: 14,
            backgroundColor: theme.contrast,
            overflow: 'hidden',
        }}>
            {categories.map((item, index) => (
                <CategoryRow
                    key={item.id}
                    label={item.name_en}
                    value={item.event_count}
                    showDivider={index !== categories.length - 1}
                />
            ))}
        </View>
    )
}

function CategoryRow({
    label,
    value,
    showDivider,
}: {
    label: string
    value: number
    showDivider: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            borderBottomWidth: showDivider ? 1 : 0,
            borderBottomColor: '#ffffff12',
            paddingHorizontal: 12,
            paddingVertical: 10,
        }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <QueenbeeIcon name='tag' size={15} color={theme.orange} />
                <Text style={{ ...T.text15, color: theme.textColor, flex: 1 }}>
                    {label}
                </Text>
            </View>
            <Text style={{ ...T.text15, color: theme.textColor }}>
                {value}
            </Text>
        </View>
    )
}

type QueenbeeIconName =
    | 'activity'
    | 'briefcase'
    | 'building'
    | 'calendar'
    | 'database'
    | 'image'
    | 'server'
    | 'shield'
    | 'tag'

function IconBadge({ name, small = false }: { name: QueenbeeIconName, small?: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const size = small ? 30 : 36

    return (
        <View style={{
            width: size,
            height: size,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.orangeTransparentBorder,
            backgroundColor: theme.orangeTransparent,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <QueenbeeIcon name={name} size={small ? 15 : 17} color={theme.orange} />
        </View>
    )
}

function QueenbeeIcon({
    name,
    size,
    color,
}: {
    name: QueenbeeIconName
    size: number
    color: string
}) {
    const common = {
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        fill: 'none',
    }

    return (
        <Svg width={size} height={size} viewBox='0 0 24 24'>
            {name === 'activity' && (
                <Polyline points='22 12 18 12 15 21 9 3 6 12 2 12' {...common} />
            )}
            {name === 'briefcase' && (
                <>
                    <Rect x='3' y='7' width='18' height='13' rx='2' {...common} />
                    <Path d='M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' {...common} />
                    <Path d='M3 12h18' {...common} />
                </>
            )}
            {name === 'building' && (
                <>
                    <Rect x='4' y='3' width='16' height='18' rx='2' {...common} />
                    <Path d='M9 21v-4h6v4' {...common} />
                    <Path d='M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01' {...common} />
                </>
            )}
            {name === 'calendar' && (
                <>
                    <Rect x='3' y='4' width='18' height='17' rx='2' {...common} />
                    <Path d='M8 2v4M16 2v4M3 10h18' {...common} />
                </>
            )}
            {name === 'database' && (
                <>
                    <Path d='M4 6c0-2 16-2 16 0s-16 2-16 0' {...common} />
                    <Path d='M4 6v12c0 2 16 2 16 0V6' {...common} />
                    <Path d='M4 12c0 2 16 2 16 0' {...common} />
                </>
            )}
            {name === 'image' && (
                <>
                    <Rect x='3' y='5' width='18' height='14' rx='2' {...common} />
                    <Circle cx='8.5' cy='10' r='1.5' {...common} />
                    <Path d='M21 15l-5-5L5 19' {...common} />
                </>
            )}
            {name === 'server' && (
                <>
                    <Rect x='3' y='4' width='18' height='7' rx='2' {...common} />
                    <Rect x='3' y='13' width='18' height='7' rx='2' {...common} />
                    <Line x1='7' y1='8' x2='7.01' y2='8' {...common} />
                    <Line x1='7' y1='17' x2='7.01' y2='17' {...common} />
                </>
            )}
            {name === 'shield' && (
                <Path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z' {...common} />
            )}
            {name === 'tag' && (
                <>
                    <Path d='M20 10l-8.5 8.5a2 2 0 0 1-2.8 0L3 12.8V4h8.8L20 12.2a2 2 0 0 1 0 2.8Z' {...common} />
                    <Circle cx='7.5' cy='8.5' r='.5' {...common} />
                </>
            )}
        </Svg>
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
