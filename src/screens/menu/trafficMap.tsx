import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { countryCentroids } from '@utils/geo'
import {
    getTrafficMetrics,
    getTrafficRecords,
} from '@utils/queenbee/api'
import mapData from '../../../public/world.json'
import { JSX, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, PanResponder, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg'
import { useSelector } from 'react-redux'
import { MetricList, StatusBadge, SummaryCard, TrafficTabs } from './traffic/shared'

type TrafficCountryPoint = {
    iso: string
    count: number
    lastSeen: number
}

type ViewBox = {
    x: number
    y: number
    width: number
    height: number
}

const MAP_WIDTH = 1000
const MAP_HEIGHT = 500
const NORWAY: [number, number] = countryCentroids.NO || [62, 10]
const INITIAL_VIEWBOX: ViewBox = { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT }
const COUNTRY_EXPIRY_MS = 5 * 60 * 1000
const POLL_INTERVAL_MS = 5000
const CAPITAL_MARKERS = [
    { iso: 'NO', label: 'Oslo', coords: [59.9139, 10.7522] as [number, number] },
    { iso: 'GB', label: 'London', coords: [51.5072, -0.1276] as [number, number] },
    { iso: 'FR', label: 'Paris', coords: [48.8566, 2.3522] as [number, number] },
    { iso: 'DE', label: 'Berlin', coords: [52.52, 13.405] as [number, number] },
    { iso: 'US', label: 'Washington', coords: [38.9072, -77.0369] as [number, number] },
    { iso: 'JP', label: 'Tokyo', coords: [35.6762, 139.6503] as [number, number] },
]

export default function TrafficMapScreen({ navigation }: MenuProps<'TrafficMapScreen'>): JSX.Element {
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

    const countryEntries = useMemo(
        () => Object.values(countries).sort((a, b) => b.count - a.count),
        [countries]
    )
    const selectedPoint = countries[selectedCountry] || null
    const selectedCoords = countryCentroids[selectedCountry] || null
    const totalTrackedRequests = countryEntries.reduce((sum, item) => sum + item.count, 0)
    const selectedRank = countryEntries.findIndex(entry => entry.iso === selectedCountry) + 1
    const selectedShare = selectedPoint && totalTrackedRequests
        ? Math.round((selectedPoint.count / totalTrackedRequests) * 100)
        : 0
    const selectedRecords = records
        .filter(record => !selectedCountry || record.country_iso === selectedCountry)
        .slice(0, 6)
    const strongestCountryCount = countryEntries[0]?.count || 1
    const mapPaths = useMemo(() => buildMapPaths(), [])

    return (
        <Swipe left='TrafficRecordsScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='TrafficMapScreen' navigation={navigation} />
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
                    <TrafficTabs active='map' navigation={navigation} />
                    <Space height={12} />
                    {!!error && <Text style={{ ...T.centered15, color: 'red' }}>{error}</Text>}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        <SummaryCard label='Active countries' value={String(countryEntries.length)} />
                        <SummaryCard label='Tracked requests' value={String(totalTrackedRequests)} />
                        <SummaryCard label='Status' value={status} />
                    </View>
                    <Space height={10} />
                    <Cluster style={{
                        borderWidth: 1,
                        borderColor: theme.greyTransparentBorder,
                        backgroundColor: theme.greyTransparent,
                    }}>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>Live Traffic Map</Text>
                            <Space height={4} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                Drag to pan. Use the controls to zoom and reset.
                            </Text>
                            <Space height={10} />
                            <View
                                style={{
                                    height: 320,
                                    borderRadius: 18,
                                    overflow: 'hidden',
                                    backgroundColor: '#071018',
                                }}
                                {...panResponder.panHandlers}
                            >
                                <Svg
                                    viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                                    width='100%'
                                    height='100%'
                                >
                                    {mapPaths.map((path, index) => (
                                        <Path
                                            key={index}
                                            d={path}
                                            fill='#ffffff'
                                            fillOpacity={0.05}
                                            stroke='#ffffff'
                                            strokeOpacity={0.1}
                                            strokeWidth={0.6}
                                        />
                                    ))}
                                    {CAPITAL_MARKERS.map(marker => {
                                        const [x, y] = project(marker.coords)
                                        const active = marker.iso === selectedCountry
                                        return (
                                            <Circle
                                                key={marker.iso}
                                                cx={x}
                                                cy={y}
                                                r={active ? 5 : 3}
                                                fill={active ? theme.orange : '#ffffffaa'}
                                                onPress={() => focusCountry(marker.iso, marker.coords)}
                                            />
                                        )
                                    })}
                                    {countryEntries.map(entry => {
                                        const coords = countryCentroids[entry.iso]
                                        if (!coords) return null
                                        const [x, y] = project(coords)
                                        const [noX, noY] = project(NORWAY)
                                        const radius = 5 + ((entry.count / strongestCountryCount) * 16)
                                        const active = selectedCountry === entry.iso
                                        return (
                                            <G key={entry.iso}>
                                                {entry.iso !== 'NO' && (
                                                    <Line
                                                        x1={x}
                                                        y1={y}
                                                        x2={noX}
                                                        y2={noY}
                                                        stroke={theme.orange}
                                                        strokeOpacity={0.2}
                                                        strokeWidth={1.3}
                                                    />
                                                )}
                                                <Circle
                                                    cx={x}
                                                    cy={y}
                                                    r={radius + 8}
                                                    fill={theme.orange}
                                                    opacity={0.08}
                                                    onPress={() => focusCountry(entry.iso, coords)}
                                                />
                                                <Circle
                                                    cx={x}
                                                    cy={y}
                                                    r={radius}
                                                    fill={active ? theme.orange : '#f5c66f'}
                                                    opacity={active ? 0.45 : 0.75}
                                                    onPress={() => focusCountry(entry.iso, coords)}
                                                />
                                                <SvgText
                                                    x={x}
                                                    y={y - radius - 6}
                                                    fill='#ffffff88'
                                                    fontSize='12'
                                                    textAnchor='middle'
                                                >
                                                    {entry.iso}
                                                </SvgText>
                                            </G>
                                        )
                                    })}
                                    <Circle cx={project(NORWAY)[0]} cy={project(NORWAY)[1]} r={5} fill='#fff' />
                                </Svg>
                            </View>
                            <Space height={10} />
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <MapButton label='−' onPress={() => setViewBox(current => zoomViewBox(current, 1.18))} />
                                <MapButton label='Reset' onPress={() => setViewBox(INITIAL_VIEWBOX)} />
                                <MapButton label='+' onPress={() => setViewBox(current => zoomViewBox(current, 0.84))} />
                            </View>
                        </View>
                    </Cluster>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        <SummaryCard
                            label={`Country · ${selectedCountry}`}
                            value={String(selectedPoint?.count || 0)}
                            detail='Requests observed'
                        />
                        <SummaryCard
                            label='Live share'
                            value={selectedShare ? `${selectedShare}%` : '—'}
                            detail={`Rank ${selectedRank || '—'}`}
                        />
                        <SummaryCard
                            label='Oslo distance'
                            value={selectedCoords ? `${haversineKilometers(selectedCoords, NORWAY)} km` : '—'}
                        />
                    </View>
                    <Space height={10} />
                    <MetricList title='Top Paths' entries={metrics?.top_paths || []} total={metrics?.total_requests || 0} />
                    <Space height={10} />
                    <MetricList title='Methods' entries={metrics?.top_methods || []} total={metrics?.total_requests || 0} />
                    <Space height={10} />
                    {selectedRecords.map(record => (
                        <Cluster
                            key={record.id}
                            style={{
                                borderWidth: 1,
                                borderColor: theme.greyTransparentBorder,
                                backgroundColor: theme.greyTransparent,
                            }}
                        >
                            <View style={{ padding: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                                    <Text
                                        style={{ ...T.text15, color: theme.textColor, flex: 1 }}
                                        numberOfLines={1}
                                    >
                                        {`${record.method} ${record.path}`}
                                    </Text>
                                    <StatusBadge status={record.status} />
                                </View>
                                <Space height={6} />
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                    {`${record.domain} · ${record.request_time}ms`}
                                </Text>
                            </View>
                        </Cluster>
                    ))}
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

function hydrateCountries(records: TrafficRecord[], previous: Record<string, TrafficCountryPoint>) {
    const next = { ...previous }
    records.forEach(record => {
        const iso = (record.country_iso || '').toUpperCase()
        if (!iso || iso === 'UNKNOWN' || !countryCentroids[iso]) return
        const timestamp = new Date(record.timestamp).getTime()
        const current = next[iso]
        next[iso] = {
            iso,
            count: (current?.count || 0) + 1,
            lastSeen: Math.max(current?.lastSeen || 0, Number.isFinite(timestamp) ? timestamp : Date.now()),
        }
    })
    return next
}

function buildMapPaths() {
    return mapData.features.map((feature) => {
        let pathData = ''

        function drawRing(ring: number[][]) {
            return ring.reduce((path, point, pointIndex) => {
                const [x, y] = project([point[1], point[0]])
                return `${path}${pointIndex === 0 ? 'M' : 'L'} ${x} ${y} `
            }, '') + 'Z '
        }

        if (feature.geometry.type === 'Polygon') {
            ;(feature.geometry.coordinates as number[][][]).forEach((ring) => {
                pathData += drawRing(ring)
            })
        } else if (feature.geometry.type === 'MultiPolygon') {
            ;(feature.geometry.coordinates as number[][][][]).forEach((polygon) => {
                polygon.forEach((ring) => {
                    pathData += drawRing(ring)
                })
            })
        }

        return pathData
    })
}

function project([lat, lon]: [number, number]): [number, number] {
    return [(lon + 180) * (MAP_WIDTH / 360), (90 - lat) * (MAP_HEIGHT / 180)]
}

function getCountryFocusView(coords: [number, number]) {
    const [x, y] = project(coords)
    return clampViewBox({ x: x - 140, y: y - 80, width: 280, height: 160 })
}

function clampViewBox(next: ViewBox) {
    const width = clamp(next.width, MAP_WIDTH * 0.2, MAP_WIDTH)
    const height = clamp(next.height, MAP_HEIGHT * 0.2, MAP_HEIGHT)
    return {
        width,
        height,
        x: clamp(next.x, 0, MAP_WIDTH - width),
        y: clamp(next.y, 0, MAP_HEIGHT - height),
    }
}

function zoomViewBox(current: ViewBox, factor: number) {
    const centerX = current.x + (current.width / 2)
    const centerY = current.y + (current.height / 2)
    const width = clamp(current.width * factor, MAP_WIDTH * 0.2, MAP_WIDTH)
    const height = clamp(current.height * factor, MAP_HEIGHT * 0.2, MAP_HEIGHT)
    return clampViewBox({ width, height, x: centerX - (width / 2), y: centerY - (height / 2) })
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

function haversineKilometers([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
    const toRadians = (value: number) => (value * Math.PI) / 180
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    const a = (Math.sin(dLat / 2) ** 2)
        + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * (Math.sin(dLon / 2) ** 2)
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function MapButton({ label, onPress }: { label: string, onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return (
        <Pressable onPress={onPress} style={{
            flex: 1,
            borderRadius: 999,
            backgroundColor: theme.orangeTransparent,
            borderWidth: 1,
            borderColor: theme.orangeTransparentBorder,
            paddingVertical: 10,
        }}>
            <Text style={{ ...T.centered15, color: theme.textColor }}>{label}</Text>
        </Pressable>
    )
}
