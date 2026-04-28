import config from '@/constants'

export {
    fetchAdDetails,
    fetchAds,
    fetchAlbumDetails,
    fetchAlbums,
    fetchEventDetails,
    fetchEvents,
    fetchLocations,
    fetchOrganizations,
    fetchRules,
} from './fetchers/publicContent'
export {
    fetchAnnouncementChannels,
    fetchAnnouncementRoles,
    fetchAnnouncements,
} from './fetchers/announcements'

export default function LastFetch(param?: string) {
    const utc = param ? param : new Date().toISOString()
    const time = new Date(utc)
    const day = time.getDate().toString().padStart(2, '0')
    const month = (time.getMonth() + 1).toString().padStart(2, '0')
    const year = time.getFullYear()
    const hour = time.getHours().toString().padStart(2, '0')
    const minute = time.getMinutes().toString().padStart(2, '0')

    return `${hour}:${minute}, ${day}/${month}, ${year}`
}

export function timeSince(downloadState: Date): number {
    const now = new Date()
    const before = new Date(downloadState)
    return now.valueOf() - before.valueOf()
}

export async function fetchFundHoldings(): Promise<FundHoldingsTotal | null> {
    try {
        const response = await fetch(`${config.login}/api/fund/holdings`)
        if (!response.ok) throw new Error('Failed to fetch fund holdings')
        const data = await response.json()
        return typeof data?.totalBase === 'number' ? data as FundHoldingsTotal : null
    } catch {
        return null
    }
}

export async function fetchFundHoldingsHistory(range: FundHoldingsRange = '1m'): Promise<FundHoldingsHistory | null> {
    try {
        const response = await fetch(`${config.login}/api/fund/holdings/history?range=${range}`)
        if (!response.ok) throw new Error('Failed to fetch fund holdings history')
        const data = await response.json()
        return Array.isArray(data?.points) ? data as FundHoldingsHistory : null
    } catch {
        return null
    }
}

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
