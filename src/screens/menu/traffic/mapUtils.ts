import { countryCentroids } from '@utils/traffic/geo'
import mapData from '../../../../public/world.json'

export type TrafficCountryPoint = {
    iso: string
    count: number
    lastSeen: number
}

export type ViewBox = {
    x: number
    y: number
    width: number
    height: number
}

export const MAP_WIDTH = 1000
export const MAP_HEIGHT = 500
export const NORWAY: [number, number] = countryCentroids.NO || [62, 10]
export const INITIAL_VIEWBOX: ViewBox = { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT }
export const COUNTRY_EXPIRY_MS = 5 * 60 * 1000
export const POLL_INTERVAL_MS = 5000
export const CAPITAL_MARKERS = [
    { iso: 'NO', label: 'Oslo', coords: [59.9139, 10.7522] as [number, number] },
    { iso: 'GB', label: 'London', coords: [51.5072, -0.1276] as [number, number] },
    { iso: 'FR', label: 'Paris', coords: [48.8566, 2.3522] as [number, number] },
    { iso: 'DE', label: 'Berlin', coords: [52.52, 13.405] as [number, number] },
    { iso: 'US', label: 'Washington', coords: [38.9072, -77.0369] as [number, number] },
    { iso: 'JP', label: 'Tokyo', coords: [35.6762, 139.6503] as [number, number] },
]

export function hydrateCountries(records: TrafficRecord[], previous: Record<string, TrafficCountryPoint>) {
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

export function buildMapPaths() {
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

export function project([lat, lon]: [number, number]): [number, number] {
    return [(lon + 180) * (MAP_WIDTH / 360), (90 - lat) * (MAP_HEIGHT / 180)]
}

export function getCountryFocusView(coords: [number, number]) {
    const [x, y] = project(coords)
    return clampViewBox({ x: x - 140, y: y - 80, width: 280, height: 160 })
}

export function clampViewBox(next: ViewBox) {
    const width = clamp(next.width, MAP_WIDTH * 0.2, MAP_WIDTH)
    const height = clamp(next.height, MAP_HEIGHT * 0.2, MAP_HEIGHT)
    return {
        width,
        height,
        x: clamp(next.x, 0, MAP_WIDTH - width),
        y: clamp(next.y, 0, MAP_HEIGHT - height),
    }
}

export function zoomViewBox(current: ViewBox, factor: number) {
    const centerX = current.x + (current.width / 2)
    const centerY = current.y + (current.height / 2)
    const width = clamp(current.width * factor, MAP_WIDTH * 0.2, MAP_WIDTH)
    const height = clamp(current.height * factor, MAP_HEIGHT * 0.2, MAP_HEIGHT)
    return clampViewBox({ width, height, x: centerX - (width / 2), y: centerY - (height / 2) })
}

export function haversineKilometers([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
    const toRadians = (value: number) => (value * Math.PI) / 180
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    const a = (Math.sin(dLat / 2) ** 2)
        + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * (Math.sin(dLon / 2) ** 2)
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}
