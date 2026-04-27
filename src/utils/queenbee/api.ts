import config from '@/constants'

export * from './ai'
export * from './internal'
export * from './loadBalancing'
export * from './monitoring'
export * from './request'
export * from './traffic'

import { requestApi } from './request'

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
