import config from '@/constants'
import { requestJson } from './request'

type PublicMonitoringService = {
    id: number
    name: string
    enabled: boolean
    url: string
    port: number
    uptime: string
    tags: string[]
    bars: {
        status: number
        delay: number
        timestamp: string
        note: string
        expectedDown: boolean
    }[]
}

export async function getPublicStatus(): Promise<PublicMonitoringService[]> {
    return await requestJson<PublicMonitoringService[]>(`${config.beekeeper_api}/monitoring`)
}
