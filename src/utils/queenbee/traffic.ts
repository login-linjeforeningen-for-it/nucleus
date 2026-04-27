import config from '@/constants'
import { requestApi } from './request'

type TrafficRangeParams = {
    start?: string
    end?: string
    domain?: string
}

type TrafficRecordParams = TrafficRangeParams & {
    limit?: number
    page?: number
}

export async function getTrafficMetrics({
    start,
    end,
    domain,
}: TrafficRangeParams = {}): Promise<TrafficMetricsProps> {
    const query = new URLSearchParams()
    if (start) query.set('time_start', start)
    if (end) query.set('time_end', end)
    if (domain) query.set('domain', domain)

    return await requestApi<TrafficMetricsProps>(
        config.beekeeper_api_url,
        query.toString() ? `/traffic/metrics?${query.toString()}` : '/traffic/metrics'
    )
}

export async function getTrafficRecords({
    start,
    end,
    limit,
    page,
    domain,
}: TrafficRecordParams = {}): Promise<TrafficRecordsProps> {
    const query = new URLSearchParams()
    if (start) query.set('start', start)
    if (end) query.set('end', end)
    if (limit) query.set('limit', String(limit))
    if (page) query.set('page', String(page))
    if (domain) query.set('domain', domain)

    return await requestApi<TrafficRecordsProps>(
        config.beekeeper_api_url,
        query.toString() ? `/traffic/records?${query.toString()}` : '/traffic/records'
    )
}

export async function getTrafficDomains(): Promise<string[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/traffic/domains')
    return Array.isArray(payload) ? payload.filter((domain): domain is string => typeof domain === 'string') : []
}
