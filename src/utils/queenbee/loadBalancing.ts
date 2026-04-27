import config from '@/constants'
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

export async function getLoadBalancingSites(): Promise<NativeLoadBalancingSite[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/sites')
    return parseLoadBalancingSites(payload)
}

export async function setPrimaryLoadBalancingSite(id: number): Promise<NativeLoadBalancingSite> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, `/site/primary/${id}`)
    return parseLoadBalancingSite(payload)
}
