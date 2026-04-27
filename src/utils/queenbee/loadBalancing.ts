import config from '@/constants'
import { isObject, requestApi } from './request'

function isLoadBalancingSite(value: unknown): value is NativeLoadBalancingSite {
    return isObject(value)
        && typeof value.id === 'number'
        && typeof value.name === 'string'
        && typeof value.primary === 'boolean'
        && typeof value.operational === 'boolean'
}

export async function getLoadBalancingSites(): Promise<NativeLoadBalancingSite[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/sites')
    if (!Array.isArray(payload)) {
        return []
    }

    return payload.filter(isLoadBalancingSite)
}

export async function setPrimaryLoadBalancingSite(id: number) {
    return await requestApi<NativeLoadBalancingSite[]>(config.beekeeper_api_url, `/site/primary/${id}`)
}
