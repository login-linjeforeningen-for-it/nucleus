import config from '@/constants'

export {
    fetchAdDetails,
    fetchAds,
    fetchAlbumDetails,
    fetchAlbums,
    fetchEventDetails,
    fetchEvents,
    fetchEventsResult,
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
        const data = await fetchJson(`${config.login}/api/fund/holdings`, 'Failed to fetch fund holdings')
        return typeof data?.totalBase === 'number' ? data as FundHoldingsTotal : null
    } catch {
        return null
    }
}

export async function fetchFundHoldingsHistory(range: FundHoldingsRange = '1m'): Promise<FundHoldingsHistory | null> {
    try {
        const data = await fetchJson(
            `${config.login}/api/fund/holdings/history?range=${range}`,
            'Failed to fetch fund holdings history'
        )
        return Array.isArray(data?.points) ? data as FundHoldingsHistory : null
    } catch {
        return null
    }
}

export async function fetchHoneyServices(): Promise<string[]> {
    try {
        const data = await fetchJson(`${config.workerbee}/text`, 'Failed to fetch honey services')
        return Array.isArray(data) ? data.filter((service): service is string => typeof service === 'string') : []
    } catch {
        return []
    }
}

async function fetchJson(url: string, error: string) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(error)
    return await response.json()
}

export async function fetchHoneyList(service: string, limit = 20): Promise<GetHoneyListProps> {
    return await fetchCountedCollection('honeys', `${config.workerbee}/text/${service}?limit=${limit}`)
}

export async function fetchAlerts(limit = 20): Promise<GetAlertsProps> {
    const params = new URLSearchParams({ limit: String(limit) })
    return await fetchCountedCollection('alerts', `${config.workerbee}/alerts?${params.toString()}`)
}

type CountedCollections = {
    honeys: GetHoneyListProps
    alerts: GetAlertsProps
}

async function fetchCountedCollection<Key extends keyof CountedCollections>(
    key: Key,
    url: string
): Promise<CountedCollections[Key]> {
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch ${key}`)
        const data = await response.json()

        return {
            [key]: Array.isArray(data?.[key]) ? data[key] : [],
            total_count: typeof data?.total_count === 'number' ? data.total_count : 0,
        } as unknown as CountedCollections[Key]
    } catch {
        return { [key]: [], total_count: 0 } as unknown as CountedCollections[Key]
    }
}
