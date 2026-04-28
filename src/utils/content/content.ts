import { formatNorwegianDate } from '@utils/general'

export function filterByContentQuery<T>(rows: T[], query: string, getValues: (row: T) => unknown[]) {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
        return rows
    }

    return rows.filter((row) => matchesContentQuery(getValues(row), normalizedQuery))
}

export function matchesContentQuery(values: unknown[], normalizedQuery: string) {
    return values.some((value) => String(value || '').toLowerCase().includes(normalizedQuery))
}

export function cleanMarkdown(value: string) {
    return value
        .replace(/\r\n/g, '\n')
        .replace(/\*\*/g, '')
        .trim()
}

export function formatLocationDetails(location: WorkerbeeLocation, fallback: string) {
    const details = [
        location.address_street,
        location.address_postcode,
        location.city_name,
        location.mazemap_campus_id ? `campus ${location.mazemap_campus_id}` : '',
        location.mazemap_poi_id ? `poi ${location.mazemap_poi_id}` : '',
        location.url,
    ].filter(Boolean)

    return details.length ? details.join(' · ') : fallback
}

export function formatContentDate(value: string) {
    return formatNorwegianDate(value, { day: '2-digit', month: 'short', year: 'numeric' }, value)
}
