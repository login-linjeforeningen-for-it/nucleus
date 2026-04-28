import config from '@/constants'

export * from './ai'
export * from './internal'
export * from './request'

import { isObject, requestApi } from './request'

type TrafficRangeParams = {
    start?: string
    end?: string
    domain?: string
}

type TrafficRecordParams = TrafficRangeParams & {
    limit?: number
    page?: number
}

function isLoadBalancingSite(value: unknown): value is NativeLoadBalancingSite {
    return isObject(value)
        && typeof value.id === 'number'
        && typeof value.name === 'string'
        && typeof value.ip === 'string'
        && typeof value.primary === 'boolean'
        && typeof value.operational === 'boolean'
        && typeof value.maintenance === 'boolean'
        && (value.note === null || typeof value.note === 'string')
        && typeof value.updated_at === 'string'
}

function parseLoadBalancingSite(value: unknown): NativeLoadBalancingSite {
    if (!isLoadBalancingSite(value)) {
        throw new Error('Load balancing site payload is missing a required primary state.')
    }

    return value
}

function parseLoadBalancingSites(value: unknown): NativeLoadBalancingSite[] {
    if (!Array.isArray(value)) {
        throw new Error('Load balancing sites payload must be an array.')
    }

    return value.map(parseLoadBalancingSite)
}

function isMonitoringService(value: unknown): value is NativeMonitoringService {
    return isObject(value)
        && typeof value.id === 'number'
        && typeof value.name === 'string'
        && typeof value.enabled === 'boolean'
        && Array.isArray(value.bars)
}

function isServiceNotification(value: unknown): value is NativeServiceNotification {
    return isObject(value)
        && typeof value.id === 'number'
        && typeof value.name === 'string'
}

export async function listProtectedEvents(limit = 25): Promise<GetEventsProps> {
    return await requestApi<GetEventsProps>(
        config.api,
        `/events/protected?limit=${limit}&offset=0&order_by=time_start&sort=asc&historical=false`
    )
}

export async function getProtectedEvent(id: number): Promise<GetEventProps> {
    return await requestApi<GetEventProps>(config.api, `/events/protected/${id}`)
}

export async function updateProtectedEvent(id: number, body: object): Promise<GetEventProps> {
    return await requestApi<GetEventProps>(config.api, `/events/${id}`, {
        method: 'PUT',
        body
    })
}

export async function getLoadBalancingSites(): Promise<NativeLoadBalancingSite[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api, '/sites')
    return parseLoadBalancingSites(payload)
}

export async function setPrimaryLoadBalancingSite(id: number): Promise<NativeLoadBalancingSite> {
    const payload = await requestApi<unknown>(config.beekeeper_api, `/site/primary/${id}`)
    return parseLoadBalancingSite(payload)
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
        config.beekeeper_api,
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
        config.beekeeper_api,
        query.toString() ? `/traffic/records?${query.toString()}` : '/traffic/records'
    )
}

export async function getTrafficDomains(): Promise<string[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api, '/traffic/domains')
    return Array.isArray(payload) ? payload.filter((domain): domain is string => typeof domain === 'string') : []
}

export async function listMonitoringServices(): Promise<NativeMonitoringService[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api, '/monitoring', {
        requiresAuth: false,
    })

    return Array.isArray(payload) ? payload.filter(isMonitoringService) : []
}

export async function getMonitoringService(id: number): Promise<NativeDetailedMonitoringService> {
    return await requestApi<NativeDetailedMonitoringService>(config.beekeeper_api, `/monitoring/${id}`, {
        requiresAuth: false,
    })
}

export async function listServiceNotifications(): Promise<NativeServiceNotification[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api, '/monitoring/notifications', {
        requiresAuth: false,
    })

    return Array.isArray(payload) ? payload.filter(isServiceNotification) : []
}

export async function createServiceNotification(body: NativeServiceNotificationForm): Promise<NativeServiceNotification> {
    return await requestApi<NativeServiceNotification>(config.beekeeper_api, '/monitoring/notification', {
        method: 'POST',
        body,
    })
}

export async function createMonitoringService(body: NativeMonitoringServiceForm): Promise<NativeMonitoringService> {
    return await requestApi<NativeMonitoringService>(config.beekeeper_api, '/monitoring', {
        method: 'POST',
        body,
    })
}

export async function updateMonitoringService(id: number, body: NativeMonitoringServiceForm): Promise<{ message: string }> {
    return await requestApi<{ message: string }>(config.beekeeper_api, `/monitoring/${id}`, {
        method: 'PUT',
        body,
    })
}

export async function deleteMonitoringService(id: number): Promise<{ message: string }> {
    return await requestApi<{ message: string }>(config.beekeeper_api, `/monitoring/${id}`, {
        method: 'DELETE',
    })
}
