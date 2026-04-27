import Space from '@/components/shared/utils'
import {
    ErrorCard,
    ProjectFindingList,
    RunScanCard,
    VulnerabilitySummary,
    getLoadError,
    useVulnerabilityTotals,
} from '@components/menu/vulnerabilities/vulnerabilityOverview'
import VulnerabilityImageCard from '@components/menu/vulnerabilities/vulnerabilityImageCard'
import Swipe from '@components/nav/swipe'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import { getScoutOverview, getVulnerabilitiesOverview, triggerVulnerabilityScan } from '@utils/queenbee/api'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

type ExpandedState = Record<string, boolean>

export default function VulnerabilitiesScreen(): JSX.Element {
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

    useEffect(() => {
        void load()
    }, [])

    useEffect(() => {
        if (!data?.scanStatus.isRunning) return
        const timer = setInterval(() => void load(), 3000)
        return () => clearInterval(timer)
    }, [data?.scanStatus.isRunning])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => void load()}
                        tintColor={theme.orange}
                        colors={[theme.orange]}
                        progressViewOffset={0}
                    />}
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    <RunScanCard isRunning={running || Boolean(data?.scanStatus.isRunning)} scanStatus={data?.scanStatus} onPress={() => void runScan()} theme={theme} />
                    <ErrorCard error={error} />
                    {data || scout ? (
                        <>
                            <VulnerabilitySummary data={data} findings={totals.findings} severity={totals.severity} projectCount={totals.projectCount} theme={theme} />
                            <ProjectFindingList scout={scout} theme={theme} />
                            <ImageList
                                data={data}
                                expandedImages={expandedImages}
                                expandedVulnerabilities={expandedVulnerabilities}
                                onToggleImage={(image) => setExpandedImages(current => ({ ...current, [image]: !current[image] }))}
                                onToggleVulnerability={(key) => setExpandedVulnerabilities(current => ({ ...current, [key]: !current[key] }))}
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
    if (!data?.images.length) return null

    return data.images.map(image => (
        <VulnerabilityImageCard
            key={image.image}
            image={image}
            isExpanded={expandedImages[image.image] ?? false}
            expandedVulnerabilities={expandedVulnerabilities}
            onToggleImage={onToggleImage}
            onToggleVulnerability={onToggleVulnerability}
            theme={theme}
        />
    ))
}
