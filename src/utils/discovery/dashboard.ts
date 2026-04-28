import config from '@/constants'
import { requestJson } from './request'

async function requestCount(path: string, key: string) {
    const data = await requestJson<Record<string, unknown>>(`${config.api}${path}`)
    return typeof data[key] === 'number' ? data[key] as number : 0
}

export async function getDashboardSummary(): Promise<NativeDashboardSummary> {
    const [events, jobs, organizations, locations, albums, categories, additions, yearly] = await Promise.all([
        requestCount('/events?limit=1', 'total_count'),
        requestCount('/jobs?limit=1', 'total_count'),
        requestCount('/organizations?limit=1', 'total_count'),
        requestCount('/locations?limit=1', 'total_count'),
        requestCount('/albums?limit=1', 'total_count'),
        requestJson<NativeDashboardSummary['categories']>(`${config.api}/stats/categories`),
        requestJson<NativeDashboardSummary['additions']>(`${config.api}/stats/new-additions?limit=10`),
        requestJson<NativeDashboardSummary['yearly']>(`${config.api}/stats/yearly`),
    ])

    return {
        counts: {
            events,
            jobs,
            organizations,
            locations,
            albums,
        },
        categories,
        additions,
        yearly,
    }
}
