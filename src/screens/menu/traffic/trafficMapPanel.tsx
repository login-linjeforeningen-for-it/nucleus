import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { countryCentroids } from '@utils/traffic/geo'
import { PanResponderInstance, Pressable, View } from 'react-native'
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg'
import { useSelector } from 'react-redux'
import {
    CAPITAL_MARKERS,
    INITIAL_VIEWBOX,
    NORWAY,
    TrafficCountryPoint,
    ViewBox,
    project,
    zoomViewBox,
} from './mapUtils'

type TrafficMapPanelProps = {
    countryEntries: TrafficCountryPoint[]
    selectedCountry: string
    strongestCountryCount: number
    mapPaths: string[]
    panResponder: PanResponderInstance
    viewBox: ViewBox
    onFocusCountry: (iso: string, coords: [number, number]) => void
    onSetViewBox: (updater: ViewBox | ((current: ViewBox) => ViewBox)) => void
}

export default function TrafficMapPanel({
    countryEntries,
    selectedCountry,
    strongestCountryCount,
    mapPaths,
    panResponder,
    viewBox,
    onFocusCountry,
    onSetViewBox,
}: TrafficMapPanelProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
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
                <MapCanvas
                    countryEntries={countryEntries}
                    selectedCountry={selectedCountry}
                    strongestCountryCount={strongestCountryCount}
                    mapPaths={mapPaths}
                    panResponder={panResponder}
                    viewBox={viewBox}
                    onFocusCountry={onFocusCountry}
                />
                <Space height={10} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <MapButton label='−' onPress={() => onSetViewBox(current => zoomViewBox(current, 1.18))} />
                    <MapButton label='Reset' onPress={() => onSetViewBox(INITIAL_VIEWBOX)} />
                    <MapButton label='+' onPress={() => onSetViewBox(current => zoomViewBox(current, 0.84))} />
                </View>
            </View>
        </Cluster>
    )
}

function MapCanvas({
    countryEntries,
    selectedCountry,
    strongestCountryCount,
    mapPaths,
    panResponder,
    viewBox,
    onFocusCountry,
}: Omit<TrafficMapPanelProps, 'onSetViewBox'>) {
    return (
        <View style={mapFrameStyle} {...panResponder.panHandlers}>
            <Svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} width='100%' height='100%'>
                {mapPaths.map((path, index) => <MapPath key={index} path={path} />)}
                <CapitalMarkers selectedCountry={selectedCountry} onFocusCountry={onFocusCountry} />
                <CountryPulses
                    countryEntries={countryEntries}
                    selectedCountry={selectedCountry}
                    strongestCountryCount={strongestCountryCount}
                    onFocusCountry={onFocusCountry}
                />
                <Circle cx={project(NORWAY)[0]} cy={project(NORWAY)[1]} r={5} fill='#fff' />
            </Svg>
        </View>
    )
}

function MapPath({ path }: { path: string }) {
    return <Path d={path} fill='#ffffff' fillOpacity={0.05} stroke='#ffffff' strokeOpacity={0.1} strokeWidth={0.6} />
}

function CapitalMarkers({
    selectedCountry,
    onFocusCountry,
}: {
    selectedCountry: string
    onFocusCountry: (iso: string, coords: [number, number]) => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return CAPITAL_MARKERS.map(marker => {
        const [x, y] = project(marker.coords)
        const active = marker.iso === selectedCountry
        return (
            <Circle
                key={marker.iso}
                cx={x}
                cy={y}
                r={active ? 5 : 3}
                fill={active ? theme.orange : '#ffffffaa'}
                onPress={() => onFocusCountry(marker.iso, marker.coords)}
            />
        )
    })
}

function CountryPulses({
    countryEntries,
    selectedCountry,
    strongestCountryCount,
    onFocusCountry,
}: Pick<TrafficMapPanelProps, 'countryEntries' | 'selectedCountry' | 'strongestCountryCount' | 'onFocusCountry'>) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [noX, noY] = project(NORWAY)

    return countryEntries.map(entry => {
        const coords = countryCentroids[entry.iso]
        if (!coords) return null
        const [x, y] = project(coords)
        const radius = 5 + ((entry.count / strongestCountryCount) * 16)
        const active = selectedCountry === entry.iso

        return (
            <G key={entry.iso}>
                {entry.iso !== 'NO' && <Line x1={x} y1={y} x2={noX} y2={noY} stroke={theme.orange} strokeOpacity={0.2} strokeWidth={1.3} />}
                <Circle cx={x} cy={y} r={radius + 8} fill={theme.orange} opacity={0.08} onPress={() => onFocusCountry(entry.iso, coords)} />
                <Circle cx={x} cy={y} r={radius} fill={active ? theme.orange : '#f5c66f'} opacity={active ? 0.45 : 0.75} onPress={() => onFocusCountry(entry.iso, coords)} />
                <SvgText x={x} y={y - radius - 6} fill='#ffffff88' fontSize='12' textAnchor='middle'>
                    {entry.iso}
                </SvgText>
            </G>
        )
    })
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

const mapFrameStyle = {
    height: 320,
    borderRadius: 18,
    overflow: 'hidden' as const,
    backgroundColor: '#071018',
}
