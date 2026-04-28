import config from '@/constants'

export * from './ai'
export * from './internal'
export * from './monitoring'
export * from './request'
export * from './traffic'

import { isObject, requestApi } from './request'

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
