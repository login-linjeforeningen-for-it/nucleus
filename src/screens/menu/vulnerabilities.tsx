import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import { glassCard, SummaryTile } from '@components/menu/vulnerabilities/primitives'
import VulnerabilityImageCard from '@components/menu/vulnerabilities/vulnerabilityImageCard'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import {
    emptySeverity,
    formatScanStatus,
    SEVERITY_ORDER,
} from '@utils/vulnerabilities'
import { getScoutOverview, getVulnerabilitiesOverview, triggerVulnerabilityScan } from '@utils/queenbee/api'
import { JSX, useEffect, useMemo, useState } from 'react'
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native'
import { useSelector } from 'react-redux'

type ExpandedState = Record<string, boolean>

export default function VulnerabilitiesScreen({ navigation }: MenuProps<'VulnerabilitiesScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<GetVulnerabilities | null>(null)
    const [scout, setScout] = useState<ScoutOverview | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [running, setRunning] = useState(false)
    const [error, setError] = useState('')
    const [expandedImages, setExpandedImages] = useState<ExpandedState>({})
    const [expandedVulnerabilities, setExpandedVulnerabilities] = useState<ExpandedState>({})
    const totals = useVulnerabilityTotals(data, scout)

    async function load() {
        setRefreshing(true)
        const [vulnerabilityPayload, scoutPayload] = await Promise.allSettled([
            getVulnerabilitiesOverview(),
            getScoutOverview(),
        ])

        setData(vulnerabilityPayload.status === 'fulfilled' ? vulnerabilityPayload.value : null)
        setScout(scoutPayload.status === 'fulfilled' ? scoutPayload.value : null)
        setError(getLoadError(vulnerabilityPayload, scoutPayload))
        setRefreshing(false)
    }

    async function runScan() {
        setRunning(true)
        try {
            await triggerVulnerabilityScan()
            await load()
        } catch (scanError) {
            setError(scanError instanceof Error ? scanError.message : 'Failed to start scan')
        } finally {
            setRunning(false)
        }
    }

    function toggleImage(image: string) {
        setExpandedImages((current) => ({ ...current, [image]: !current[image] }))
    }

    function toggleVulnerability(key: string) {
        setExpandedVulnerabilities((current) => ({ ...current, [key]: !current[key] }))
    }

    useEffect(() => {
        void load()
    }, [])

    useEffect(() => {
        if (!data?.scanStatus.isRunning) {
            return
        }

        const timer = setInterval(() => {
            void load()
        }, 3000)

        return () => clearInterval(timer)
    }, [data?.scanStatus.isRunning])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='VulnerabilitiesScreen' navigation={navigation} />
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
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    <RunScanCard
                        isRunning={running || Boolean(data?.scanStatus.isRunning)}
                        scanStatus={data?.scanStatus}
                        onPress={() => void runScan()}
                        theme={theme}
                    />
                    <ErrorCard error={error} />
                    {data || scout ? (
                        <>
                            <VulnerabilitySummary
                                data={data}
                                findings={totals.findings}
                                severity={totals.severity}
                                projectCount={totals.projectCount}
                                theme={theme}
                            />
                            <ProjectFindingList
                                scout={scout}
                                theme={theme}
                            />
                            <ImageList
                                data={data}
                                expandedImages={expandedImages}
                                expandedVulnerabilities={expandedVulnerabilities}
                                onToggleImage={toggleImage}
                                onToggleVulnerability={toggleVulnerability}
                                theme={theme}
                            />
                        </>
                    ) : null}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function RunScanCard({
    isRunning,
    scanStatus,
    onPress,
    theme,
}: {
    isRunning: boolean
    scanStatus?: DockerScoutScanStatus
    onPress: () => void
    theme: Theme
}) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={glassCard(theme.orangeTransparent, theme.orangeTransparentBorder, 14)}>
                <Text style={{ ...T.centered20, color: theme.textColor }}>
                    {isRunning ? 'Scanning...' : 'Run vulnerability scan'}
                </Text>
                <Space height={4} />
                <Text style={{ ...T.text12, color: theme.oppositeTextColor, textAlign: 'center' }}>
                    {formatScanStatus(scanStatus)}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

function ErrorCard({ error }: { error: string }) {
    if (!error) {
        return null
    }

    return (
        <>
            <Space height={10} />
            <Cluster>
                <View style={glassCard('rgba(255, 107, 107, 0.12)', 'rgba(255, 107, 107, 0.24)', 12)}>
                    <Text style={{ ...T.text15, color: '#ffb0b0' }}>{error}</Text>
                </View>
            </Cluster>
        </>
    )
}

function VulnerabilitySummary({
    data,
    findings,
    severity,
    projectCount,
    theme,
}: {
    data: GetVulnerabilities | null
    findings: number
    severity: SeverityCount
    projectCount: number
    theme: Theme
}) {
    return (
        <>
            <Space height={10} />
            <Cluster style={{ paddingHorizontal: 1 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    <SummaryTile label='Images' value={String(data?.imageCount ?? 0)} theme={theme} />
                    <SummaryTile label='Findings' value={String(findings)} theme={theme} />
                    <SummaryTile label='Projects' value={String(projectCount)} theme={theme} />
                    <SummaryTile label='Critical' value={String(severity.critical)} theme={theme} severity='critical' />
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function ImageList({
    data,
    expandedImages,
    expandedVulnerabilities,
    onToggleImage,
    onToggleVulnerability,
    theme,
}: {
    data: GetVulnerabilities | null
    expandedImages: ExpandedState
    expandedVulnerabilities: ExpandedState
    onToggleImage: (image: string) => void
    onToggleVulnerability: (key: string) => void
    theme: Theme
}) {
    if (!data?.images.length) {
        return null
    }

    return (
        <>
            {data.images.map((image) => (
                <VulnerabilityImageCard
                    key={image.image}
                    image={image}
                    isExpanded={expandedImages[image.image] ?? false}
                    expandedVulnerabilities={expandedVulnerabilities}
                    onToggleImage={onToggleImage}
                    onToggleVulnerability={onToggleVulnerability}
                    theme={theme}
                />
            ))}
        </>
    )
}

function ProjectFindingList({
    scout,
    theme,
}: {
    scout: ScoutOverview | null
    theme: Theme
}) {
    const findings = scout?.projects.result?.findings || []
    if (!findings.length) {
        return null
    }

    return (
        <>
            <Cluster>
                <View style={glassCard(theme.greyTransparent, theme.greyTransparentBorder, 14)}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>Project findings</Text>
                    <Space height={6} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        Last scout run: {formatScoutTimestamp(scout?.projects.lastSuccessAt)}
                    </Text>
                </View>
            </Cluster>
            <Space height={10} />
            {findings.map((finding, index) => (
                <ProjectFindingCard
                    key={`${finding.repository}-${finding.folder}-${index}`}
                    finding={finding}
                    theme={theme}
                />
            ))}
        </>
    )
}

function ProjectFindingCard({
    finding,
    theme,
}: {
    finding: ScoutProjectFinding
    theme: Theme
}) {
    const vulnerabilities = finding.vulnerabilities
    const total = getScoutFindingCount(finding)

    return (
        <>
            <Cluster>
                <View style={glassCard(theme.greyTransparent, theme.greyTransparentBorder, 14)}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>{finding.repository}</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {finding.folder}
                    </Text>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <SummaryTile label='Total' value={String(total)} theme={theme} />
                        <SummaryTile label='Critical' value={String(vulnerabilities.critical || 0)} theme={theme} severity='critical' />
                        <SummaryTile label='High' value={String(vulnerabilities.high || 0)} theme={theme} severity='high' />
                        <SummaryTile label='Medium' value={String(vulnerabilities.moderate || vulnerabilities.medium || 0)} theme={theme} severity='medium' />
                    </View>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function useVulnerabilityTotals(data: GetVulnerabilities | null, scout: ScoutOverview | null) {
    return useMemo(() => {
        const severity = emptySeverity()
        let projectFindings = 0

        for (const image of data?.images || []) {
            for (const level of SEVERITY_ORDER) {
                severity[level] += image.severity[level] || 0
            }
        }

        for (const finding of scout?.projects.result?.findings || []) {
            const vulnerabilities = finding.vulnerabilities
            severity.critical += vulnerabilities.critical || 0
            severity.high += vulnerabilities.high || 0
            severity.medium += (vulnerabilities.moderate || 0) + (vulnerabilities.medium || 0)
            severity.low += vulnerabilities.low || 0
            projectFindings += getScoutFindingCount(finding)
        }

        return {
            findings: Math.max(
                (data?.images || []).reduce((sum, image) => sum + image.totalVulnerabilities, 0),
                projectFindings
            ),
            projectCount: scout?.projects.result?.findings.length || 0,
            severity,
        }
    }, [data, scout])
}

function getScoutFindingCount(finding: ScoutProjectFinding) {
    const vulnerabilities = finding.vulnerabilities

    return (vulnerabilities.critical || 0)
        + (vulnerabilities.high || 0)
        + (vulnerabilities.moderate || 0)
        + (vulnerabilities.medium || 0)
        + (vulnerabilities.low || 0)
        + (vulnerabilities.info || 0)
}

function formatScoutTimestamp(value?: string | null) {
    return value ? formatScanStatus({
        isRunning: false,
        startedAt: null,
        finishedAt: value,
        lastSuccessAt: value,
        lastError: null,
        totalImages: null,
        completedImages: 0,
        currentImage: null,
        estimatedCompletionAt: null,
    }) : 'Unknown'
}

function getLoadError(
    vulnerabilityPayload: PromiseSettledResult<GetVulnerabilities>,
    scoutPayload: PromiseSettledResult<ScoutOverview>
) {
    if (vulnerabilityPayload.status === 'fulfilled' || scoutPayload.status === 'fulfilled') {
        return ''
    }

    const reason = vulnerabilityPayload.reason || scoutPayload.reason
    return reason instanceof Error ? reason.message : 'Failed to load vulnerabilities'
}
