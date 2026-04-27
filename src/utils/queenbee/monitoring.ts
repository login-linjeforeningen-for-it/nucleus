import config from '@/constants'
import { isObject, requestApi } from './request'

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

export async function listMonitoringServices(): Promise<NativeMonitoringService[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/monitoring', {
        requiresAuth: false,
    })

    return Array.isArray(payload) ? payload.filter(isMonitoringService) : []
}

export async function getMonitoringService(id: number): Promise<NativeDetailedMonitoringService> {
    return await requestApi<NativeDetailedMonitoringService>(config.beekeeper_api_url, `/monitoring/${id}`, {
        requiresAuth: false,
    })
}

export async function listServiceNotifications(): Promise<NativeServiceNotification[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/monitoring/notifications', {
        requiresAuth: false,
    })

    return Array.isArray(payload) ? payload.filter(isServiceNotification) : []
}

export async function createServiceNotification(body: NativeServiceNotificationForm): Promise<NativeServiceNotification> {
    return await requestApi<NativeServiceNotification>(config.beekeeper_api_url, '/monitoring/notification', {
        method: 'POST',
        body,
    })
}

export async function createMonitoringService(body: NativeMonitoringServiceForm): Promise<NativeMonitoringService> {
    return await requestApi<NativeMonitoringService>(config.beekeeper_api_url, '/monitoring', {
        method: 'POST',
        body,
    })
}

export async function updateMonitoringService(id: number, body: NativeMonitoringServiceForm): Promise<{ message: string }> {
    return await requestApi<{ message: string }>(config.beekeeper_api_url, `/monitoring/${id}`, {
        method: 'PUT',
        body,
    })
}

export async function deleteMonitoringService(id: number): Promise<{ message: string }> {
    return await requestApi<{ message: string }>(config.beekeeper_api_url, `/monitoring/${id}`, {
        method: 'DELETE',
    })
}
