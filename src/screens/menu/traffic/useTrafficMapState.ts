import { countryCentroids } from '@utils/traffic/geo'
import { useMemo } from 'react'
import { TrafficCountryPoint } from './mapUtils'

export function useTrafficMapState(
    countries: Record<string, TrafficCountryPoint>,
    selectedCountry: string,
    records: TrafficRecord[],
) {
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
