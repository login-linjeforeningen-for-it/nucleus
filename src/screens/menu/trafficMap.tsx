import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { countryCentroids } from '@utils/traffic/geo'
import { getTrafficMetrics, getTrafficRecords } from '@utils/queenbee/api'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, PanResponder, RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'
import {
    COUNTRY_EXPIRY_MS, INITIAL_VIEWBOX, NORWAY, POLL_INTERVAL_MS, TrafficCountryPoint, ViewBox,
    buildMapPaths, clampViewBox, getCountryFocusView, haversineKilometers, hydrateCountries,
} from './traffic/mapUtils'
import TrafficMapPanel from './traffic/trafficMapPanel'
import TrafficRecordPreview from './traffic/trafficRecordPreview'
import { MetricList, SummaryCard, TrafficTabs } from './traffic/shared'

export default function TrafficMapScreen({ navigation }: MenuProps<'TrafficMapScreen'>) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [metrics, setMetrics] = useState<TrafficMetricsProps | null>(null)
    const [records, setRecords] = useState<TrafficRecord[]>([])
    const [countries, setCountries] = useState<Record<string, TrafficCountryPoint>>({})
    const [selectedCountry, setSelectedCountry] = useState('NO')
    const [viewBox, setViewBox] = useState<ViewBox>(INITIAL_VIEWBOX)
    const [refreshing, setRefreshing] = useState(false)
    const [status, setStatus] = useState('Connecting')
    const [error, setError] = useState('')
    const latestSeenRef = useRef(0)
    const dragStartRef = useRef<{ x: number, y: number, viewBox: ViewBox } | null>(null)

    async function load() {
        setRefreshing(true)
        try {
            const [metricPayload, recordPayload] = await Promise.all([
                getTrafficMetrics(),
                getTrafficRecords({ limit: 30, page: 1 }),
            ])
            setMetrics(metricPayload)
            setRecords(recordPayload.result)
            applyRecords(recordPayload.result)
            setStatus('Streaming live traffic')
            setError('')
        } catch (loadError) {
            setStatus('Disconnected')
            setError(loadError instanceof Error ? loadError.message : 'Failed to load traffic map')
        } finally {
            setRefreshing(false)
        }
    }

    function applyRecords(nextRecords: TrafficRecord[]) {
        const freshRecords = nextRecords.filter(record => {
            const timestamp = new Date(record.timestamp).getTime()
            return Number.isFinite(timestamp) && timestamp > latestSeenRef.current
        })
        if (!freshRecords.length && latestSeenRef.current !== 0) return

        latestSeenRef.current = Math.max(
            latestSeenRef.current,
            ...nextRecords.map(record => new Date(record.timestamp).getTime()).filter(Number.isFinite)
        )
        setCountries(prev => hydrateCountries([...nextRecords, ...freshRecords], prev))
    }

    useEffect(() => {
        void load()
        const timer = setInterval(() => void load(), POLL_INTERVAL_MS)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now()
            setCountries(prev => Object.fromEntries(
                Object.entries(prev).filter(([, value]) => now - value.lastSeen < COUNTRY_EXPIRY_MS)
            ))
        }, 3000)
        return () => clearInterval(timer)
    }, [])

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gesture) => {
            dragStartRef.current = { x: gesture.x0, y: gesture.y0, viewBox }
        },
        onPanResponderMove: (_, gesture) => {
            if (!dragStartRef.current) return
            const scaleX = dragStartRef.current.viewBox.width / Dimensions.get('window').width
            const scaleY = dragStartRef.current.viewBox.height / 320
            setViewBox(clampViewBox({
                ...dragStartRef.current.viewBox,
                x: dragStartRef.current.viewBox.x - (gesture.dx * scaleX),
                y: dragStartRef.current.viewBox.y - (gesture.dy * scaleY),
            }))
        },
        onPanResponderRelease: () => {
            dragStartRef.current = null
        },
    }), [viewBox])

    const mapState = useTrafficMapState(countries, selectedCountry, records)
    const mapPaths = useMemo(() => buildMapPaths(), [])

    return (
        <Swipe left='TrafficRecordsScreen'>
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
                    <TrafficTabs active='map' navigation={navigation} />
                    <Space height={12} />
                    {!!error && <Text style={{ ...T.centered15, color: 'red' }}>{error}</Text>}
                    <TrafficSummary countryCount={mapState.countryEntries.length} requestCount={mapState.totalTrackedRequests} status={status} />
                    <Space height={10} />
                    <TrafficMapPanel
                        countryEntries={mapState.countryEntries}
                        selectedCountry={selectedCountry}
                        strongestCountryCount={mapState.strongestCountryCount}
                        mapPaths={mapPaths}
                        panResponder={panResponder}
                        viewBox={viewBox}
                        onFocusCountry={focusCountry}
                        onSetViewBox={setViewBox}
                    />
                    <TrafficCountrySummary selectedCountry={selectedCountry} mapState={mapState} />
                    <MetricList title='Top Paths' entries={metrics?.top_paths || []} total={metrics?.total_requests || 0} />
                    <Space height={10} />
                    <MetricList title='Methods' entries={metrics?.top_methods || []} total={metrics?.total_requests || 0} />
                    <Space height={10} />
                    {mapState.selectedRecords.map(record => <TrafficRecordPreview key={record.id} record={record} />)}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )

    function focusCountry(iso: string, coords: [number, number]) {
        setSelectedCountry(iso)
        setViewBox(getCountryFocusView(coords))
    }
}

function useTrafficMapState(countries: Record<string, TrafficCountryPoint>, selectedCountry: string, records: TrafficRecord[]) {
    const countryEntries = useMemo(() => Object.values(countries).sort((a, b) => b.count - a.count), [countries])
    const selectedPoint = countries[selectedCountry] || null
    const selectedCoords = countryCentroids[selectedCountry] || null
    const totalTrackedRequests = countryEntries.reduce((sum, item) => sum + item.count, 0)
    const selectedRank = countryEntries.findIndex(entry => entry.iso === selectedCountry) + 1
    const selectedShare = selectedPoint && totalTrackedRequests
        ? Math.round((selectedPoint.count / totalTrackedRequests) * 100)
        : 0
    const selectedRecords = records.filter(record => !selectedCountry || record.country_iso === selectedCountry).slice(0, 6)
    const strongestCountryCount = countryEntries[0]?.count || 1

    return { countryEntries, selectedCoords, selectedPoint, totalTrackedRequests, selectedRank, selectedShare, selectedRecords, strongestCountryCount }
}

function TrafficSummary({ countryCount, requestCount, status }: { countryCount: number, requestCount: number, status: string }) {
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <SummaryCard label='Active countries' value={String(countryCount)} />
            <SummaryCard label='Tracked requests' value={String(requestCount)} />
            <SummaryCard label='Status' value={status} />
        </View>
    )
}

function TrafficCountrySummary({ selectedCountry, mapState }: { selectedCountry: string, mapState: ReturnType<typeof useTrafficMapState> }) {
    return (
        <>
            <Space height={10} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                <SummaryCard label={`Country · ${selectedCountry}`} value={String(mapState.selectedPoint?.count || 0)} detail='Requests observed' />
                <SummaryCard label='Live share' value={mapState.selectedShare ? `${mapState.selectedShare}%` : '—'} detail={`Rank ${mapState.selectedRank || '—'}`} />
                <SummaryCard label='Oslo distance' value={mapState.selectedCoords ? `${haversineKilometers(mapState.selectedCoords, NORWAY)} km` : '—'} />
            </View>
            <Space height={10} />
        </>
    )
}
