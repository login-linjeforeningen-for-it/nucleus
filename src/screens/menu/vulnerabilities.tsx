import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getVulnerabilitiesOverview, triggerVulnerabilityScan } from '@utils/queenbeeApi'
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

const SEVERITY_ORDER: SeverityLevel[] = ['critical', 'high', 'medium', 'low', 'unknown']

export default function VulnerabilitiesScreen({ navigation }: MenuProps<'VulnerabilitiesScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<GetVulnerabilities | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [running, setRunning] = useState(false)
    const [error, setError] = useState('')
    const [expandedImages, setExpandedImages] = useState<ExpandedState>({})
    const [expandedVulnerabilities, setExpandedVulnerabilities] = useState<ExpandedState>({})

    const totals = useMemo(() => {
        const severity = emptySeverity()

        for (const image of data?.images || []) {
            for (const level of SEVERITY_ORDER) {
                severity[level] += image.severity[level] || 0
            }
        }

        return {
            findings: (data?.images || []).reduce((sum, image) => sum + image.totalVulnerabilities, 0),
            severity,
        }
    }, [data])

    async function load() {
        setRefreshing(true)
        try {
            setData(await getVulnerabilitiesOverview())
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load vulnerabilities')
        } finally {
            setRefreshing(false)
        }
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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get('window').height / 8} />

                    <TouchableOpacity onPress={() => void runScan()}>
                        <View style={glassCard(theme, theme.orangeTransparent, theme.orangeTransparentBorder, 14)}>
                            <Text style={{ ...T.centered20, color: theme.textColor }}>
                                {running || data?.scanStatus.isRunning ? 'Scanning...' : 'Run vulnerability scan'}
                            </Text>
                            <Space height={4} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor, textAlign: 'center' }}>
                                {formatScanStatus(data?.scanStatus)}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {!!error && (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={glassCard(theme, 'rgba(255, 107, 107, 0.12)', 'rgba(255, 107, 107, 0.24)', 12)}>
                                    <Text style={{ ...T.text15, color: '#ffb0b0' }}>{error}</Text>
                                </View>
                            </Cluster>
                        </>
                    )}

                    {data && (
                        <>
                            <Space height={10} />
                            <Cluster style={{ paddingHorizontal: 1 }}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                    <SummaryTile label='Images' value={String(data.imageCount)} theme={theme} />
                                    <SummaryTile label='Findings' value={String(totals.findings)} theme={theme} />
                                    <SummaryTile label='Critical' value={String(totals.severity.critical)} theme={theme} severity='critical' />
                                    <SummaryTile label='High' value={String(totals.severity.high)} theme={theme} severity='high' />
                                </View>
                            </Cluster>

                            <Space height={10} />

                            {data.images.map((image) => {
                                const isExpanded = expandedImages[image.image] ?? true

                                return (
                                    <View key={image.image}>
                                        <Cluster>
                                            <View style={glassCard(theme, theme.greyTransparent, theme.greyTransparentBorder, 14)}>
                                                <TouchableOpacity onPress={() => toggleImage(image.image)} activeOpacity={0.85}>
                                                    <View style={{ gap: 10 }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                            gap: 12
                                                        }}>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                                                    {image.image}
                                                                </Text>
                                                                <Space height={4} />
                                                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                                    Scanned {formatDateTime(image.scannedAt)}
                                                                </Text>
                                                            </View>
                                                            <SeverityBadge
                                                                label={isExpanded ? 'Hide details' : 'Show details'}
                                                                color={theme.orangeTransparent}
                                                                borderColor={theme.orangeTransparentBorder}
                                                                textColor={theme.textColor}
                                                            />
                                                        </View>

                                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                            {SEVERITY_ORDER.map((level) => (
                                                                <SeverityBadge
                                                                    key={`${image.image}-${level}`}
                                                                    label={`${severityTitle(level)} ${image.severity[level] || 0}`}
                                                                    color={severityColor(level)}
                                                                    borderColor={severityBorder(level)}
                                                                    textColor={theme.textColor}
                                                                />
                                                            ))}
                                                        </View>

                                                        {!!image.scanError && (
                                                            <View style={glassCard(theme, 'rgba(255, 107, 107, 0.12)', 'rgba(255, 107, 107, 0.24)', 10)}>
                                                                <Text style={{ ...T.text12, color: '#ffb0b0' }}>
                                                                    {image.scanError}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>

                                                {isExpanded && (
                                                    <>
                                                        <Space height={12} />
                                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                            <MetaStat label='Total findings' value={String(image.totalVulnerabilities)} theme={theme} />
                                                            <MetaStat label='Groups' value={String(image.groups.length)} theme={theme} />
                                                            <MetaStat label='Details' value={String(image.vulnerabilities.length)} theme={theme} />
                                                        </View>

                                                        <Space height={12} />

                                                        <View style={{ gap: 10 }}>
                                                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                                Sources
                                                            </Text>
                                                            {image.groups.length ? image.groups.map((group) => (
                                                                <View
                                                                    key={`${image.image}-${group.source}`}
                                                                    style={glassCard(theme, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 12)}
                                                                >
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        gap: 12
                                                                    }}>
                                                                        <View style={{ flex: 1 }}>
                                                                            <Text style={{ ...T.text15, color: theme.textColor }}>
                                                                                {group.source}
                                                                            </Text>
                                                                            <Space height={2} />
                                                                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                                                {group.total} findings
                                                                            </Text>
                                                                        </View>
                                                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                                                                            {SEVERITY_ORDER.filter((level) => group.severity[level] > 0).map((level) => (
                                                                                <SeverityBadge
                                                                                    key={`${image.image}-${group.source}-${level}`}
                                                                                    label={`${severityTitle(level)} ${group.severity[level]}`}
                                                                                    color={severityColor(level)}
                                                                                    borderColor={severityBorder(level)}
                                                                                    textColor={theme.textColor}
                                                                                />
                                                                            ))}
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            )) : (
                                                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                                    No grouped findings available yet.
                                                                </Text>
                                                            )}
                                                        </View>

                                                        <Space height={12} />

                                                        <View style={{ gap: 10 }}>
                                                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                                Vulnerability details
                                                            </Text>
                                                            {image.vulnerabilities.length ? image.vulnerabilities.map((vulnerability) => {
                                                                const key = `${image.image}-${vulnerability.id}-${vulnerability.packageName || 'pkg'}`
                                                                const isOpen = expandedVulnerabilities[key] ?? false

                                                                return (
                                                                    <View
                                                                        key={key}
                                                                        style={glassCard(theme, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 12)}
                                                                    >
                                                                        <TouchableOpacity onPress={() => toggleVulnerability(key)} activeOpacity={0.85}>
                                                                            <View style={{ gap: 8 }}>
                                                                                <View style={{
                                                                                    flexDirection: 'row',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'flex-start',
                                                                                    gap: 10
                                                                                }}>
                                                                                    <View style={{ flex: 1 }}>
                                                                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                                                                            <SeverityBadge
                                                                                                label={severityTitle(vulnerability.severity)}
                                                                                                color={severityColor(vulnerability.severity)}
                                                                                                borderColor={severityBorder(vulnerability.severity)}
                                                                                                textColor={theme.textColor}
                                                                                            />
                                                                                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                                                                {vulnerability.id}
                                                                                            </Text>
                                                                                        </View>
                                                                                        <Space height={6} />
                                                                                        <Text style={{ ...T.text15, color: theme.textColor }}>
                                                                                            {vulnerability.title}
                                                                                        </Text>
                                                                                    </View>
                                                                                    <SeverityBadge
                                                                                        label={isOpen ? 'Less' : 'More'}
                                                                                        color='rgba(255,255,255,0.05)'
                                                                                        borderColor='rgba(255,255,255,0.08)'
                                                                                        textColor={theme.oppositeTextColor}
                                                                                    />
                                                                                </View>

                                                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                                                    <MetaStat label='Package' value={vulnerability.packageName || 'Unknown'} theme={theme} />
                                                                                    <MetaStat label='Installed' value={vulnerability.installedVersion || 'Unknown'} theme={theme} />
                                                                                    <MetaStat label='Fixed in' value={vulnerability.fixedVersion || 'No fix listed'} theme={theme} />
                                                                                </View>

                                                                                {isOpen && (
                                                                                    <>
                                                                                        <View style={{ gap: 6 }}>
                                                                                            <MetaRow label='Type' value={vulnerability.packageType || 'Unknown'} theme={theme} />
                                                                                            <MetaRow label='Source' value={vulnerability.source} theme={theme} />
                                                                                            <MetaRow label='Description' value={vulnerability.description || 'No detailed description available for this finding.'} theme={theme} multiline />
                                                                                        </View>

                                                                                        {vulnerability.references.length ? (
                                                                                            <View style={{ gap: 4 }}>
                                                                                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                                                                    References
                                                                                                </Text>
                                                                                                {vulnerability.references.map((reference) => (
                                                                                                    <Text
                                                                                                        key={reference}
                                                                                                        style={{ ...T.text12, color: theme.textColor }}
                                                                                                    >
                                                                                                        {reference}
                                                                                                    </Text>
                                                                                                ))}
                                                                                            </View>
                                                                                        ) : null}
                                                                                    </>
                                                                                )}
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )
                                                            }) : (
                                                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                                    No per-vulnerability details are stored for this image yet. Run a new scan to populate them.
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        </Cluster>
                                        <Space height={10} />
                                    </View>
                                )
                            })}
                        </>
                    )}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function SummaryTile({
    label,
    value,
    theme,
    severity,
}: {
    label: string
    value: string
    theme: Theme
    severity?: SeverityLevel
}) {
    return (
        <View style={{
            flexBasis: '48%',
            flexGrow: 1,
            ...glassCard(
                theme,
                severity ? severityColor(severity) : theme.greyTransparent,
                severity ? severityBorder(severity) : theme.greyTransparentBorder,
                10
            )
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={3} />
            <Text style={{ ...T.text20, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function MetaStat({
    label,
    value,
    theme,
}: {
    label: string
    value: string
    theme: Theme
}) {
    return (
        <View style={{
            minWidth: 100,
            flexGrow: 1,
            ...glassCard(theme, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 10)
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={3} />
            <Text style={{ ...T.text12, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function MetaRow({
    label,
    value,
    theme,
    multiline = false,
}: {
    label: string
    value: string
    theme: Theme
    multiline?: boolean
}) {
    return (
        <View style={glassCard(theme, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 10)}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={3} />
            <Text style={{
                ...T.text12,
                color: theme.textColor,
                lineHeight: multiline ? 18 : undefined
            }}>
                {value}
            </Text>
        </View>
    )
}

function SeverityBadge({
    label,
    color,
    borderColor,
    textColor,
}: {
    label: string
    color: string
    borderColor: string
    textColor: string
}) {
    return (
        <View style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: color,
            borderWidth: 1,
            borderColor,
            alignSelf: 'flex-start',
        }}>
            <Text style={{ ...T.text12, color: textColor }}>{label}</Text>
        </View>
    )
}

function glassCard(theme: Theme, backgroundColor: string, borderColor: string, padding: number) {
    return {
        borderRadius: 18,
        backgroundColor,
        borderColor,
        borderWidth: 1,
        padding,
        overflow: 'hidden' as const,
    }
}

function severityColor(level: SeverityLevel) {
    if (level === 'critical') return 'rgba(255, 107, 107, 0.14)'
    if (level === 'high') return 'rgba(255, 160, 67, 0.14)'
    if (level === 'medium') return 'rgba(255, 214, 102, 0.14)'
    if (level === 'low') return 'rgba(90, 200, 250, 0.14)'
    return 'rgba(255,255,255,0.05)'
}

function severityBorder(level: SeverityLevel) {
    if (level === 'critical') return 'rgba(255, 107, 107, 0.24)'
    if (level === 'high') return 'rgba(255, 160, 67, 0.24)'
    if (level === 'medium') return 'rgba(255, 214, 102, 0.24)'
    if (level === 'low') return 'rgba(90, 200, 250, 0.24)'
    return 'rgba(255,255,255,0.08)'
}

function severityTitle(level: SeverityLevel) {
    return level.charAt(0).toUpperCase() + level.slice(1)
}

function emptySeverity(): SeverityCount {
    return {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        unknown: 0,
    }
}

function formatScanStatus(scanStatus?: DockerScoutScanStatus) {
    if (!scanStatus) {
        return 'No scan status available yet'
    }

    if (scanStatus.isRunning) {
        const progress = scanStatus.totalImages
            ? `${scanStatus.completedImages}/${scanStatus.totalImages}`
            : `${scanStatus.completedImages}`

        return `Scanning now · ${progress}${scanStatus.currentImage ? ` · ${scanStatus.currentImage}` : ''}`
    }

    if (scanStatus.lastError) {
        return `Last scan error: ${scanStatus.lastError}`
    }

    if (scanStatus.lastSuccessAt) {
        return `Last successful scan ${formatDateTime(scanStatus.lastSuccessAt)}`
    }

    return 'Ready to run a vulnerability scan'
}

function formatDateTime(value: string | null) {
    if (!value) {
        return 'Unknown'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString()
}
