import config from '@/constants'

export async function fetchHoneyServices(): Promise<string[]> {
    try {
        const response = await fetch(`${config.api}/text`)
        if (!response.ok) throw new Error('Failed to fetch honey services')
        const data = await response.json()
        return Array.isArray(data) ? data.filter((service): service is string => typeof service === 'string') : []
    } catch {
        return []
    }
}

export async function fetchHoneyList(service: string, limit = 20): Promise<GetHoneyListProps> {
    try {
        const response = await fetch(`${config.api}/text/${service}?limit=${limit}`)
        if (!response.ok) throw new Error('Failed to fetch honey')
        const data = await response.json()
        return {
            honeys: Array.isArray(data?.honeys) ? data.honeys : [],
            total_count: typeof data?.total_count === 'number' ? data.total_count : 0,
        }
    } catch {
        return { honeys: [], total_count: 0 }
    }
}

export async function fetchAlerts(limit = 20): Promise<GetAlertsProps> {
    try {
        const params = new URLSearchParams({ limit: String(limit) })
        const response = await fetch(`${config.api}/alerts?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch alerts')
        const data = await response.json()
        return {
            alerts: Array.isArray(data?.alerts) ? data.alerts : [],
            total_count: typeof data?.total_count === 'number' ? data.total_count : 0,
        }
    } catch {
        return { alerts: [], total_count: 0 }
    }
}
