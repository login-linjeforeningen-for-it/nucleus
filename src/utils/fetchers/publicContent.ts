import config from '@/constants'
import { toRecord } from '@utils/http'

export async function fetchEventDetails(id: number): Promise<GetEventProps> {
    const response = await fetch(`${config.workerbee}/events/${id}`)
    return await response.json()
}

export async function fetchEvents(): Promise<GetEventProps[]> {
    const result = await fetchEventsResult()
    return result.events
}

export async function fetchEventsResult(): Promise<{ events: GetEventProps[], ok: boolean }> {
    try {
        const data = await fetchPublicJson('/events', 'Failed to fetch events from API')
        return {
            events: Array.isArray(data?.events) ? data.events : [],
            ok: true,
        }
    } catch (error) {
        console.log(error)
        return { events: [], ok: false }
    }
}

export async function fetchAds(): Promise<GetJobProps[]> {
    try {
        const data = await fetchPublicJson('/jobs', 'Failed to fetch ads from API')
        return Array.isArray(data?.jobs) ? data.jobs : []
    } catch (error) {
        console.log(error)
        return []
    }
}

export async function fetchAdDetails(adID: number): Promise<GetJobProps | null> {
    try {
        const adDetails = await fetchPublicJson(`/jobs/${adID}`, 'Failed to fetch ad details from API')
        return adDetails && typeof adDetails.id === 'number'
            ? adDetails as GetJobProps
            : null
    } catch {
        return null
    }
}

export async function fetchAlbums(limit = 50, offset = 0): Promise<GetAlbumsProps> {
    try {
        const params = new URLSearchParams({ limit: String(limit), offset: String(offset), sort: 'desc' })
        const data = await fetchPublicJson(`/albums?${params.toString()}`, 'Failed to fetch albums from API')
        return {
            albums: Array.isArray(data?.albums) ? data.albums : [],
            total_count: typeof data?.total_count === 'number' ? data.total_count : 0,
        }
    } catch (error) {
        console.log(error)
        return { albums: [], total_count: 0 }
    }
}

export async function fetchAlbumDetails(albumID: number): Promise<GetAlbumProps | null> {
    try {
        const albumDetails = await fetchPublicJson(`/albums/${albumID}`, 'Failed to fetch album details from API')
        return albumDetails && typeof albumDetails.id === 'number'
            ? albumDetails as GetAlbumProps
            : null
    } catch {
        return null
    }
}

export async function fetchRules(limit = 20): Promise<GetRulesProps> {
    return await fetchCollection('rules', limit)
}

export async function fetchLocations(limit = 20): Promise<GetLocationsProps> {
    return await fetchCollection('locations', limit)
}

export async function fetchOrganizations(limit = 20): Promise<GetOrganizationsProps> {
    return await fetchCollection('organizations', limit)
}

type PublicContentCollections = {
    rules: GetRulesProps
    locations: GetLocationsProps
    organizations: GetOrganizationsProps
}

async function fetchCollection<Key extends keyof PublicContentCollections>(
    key: Key,
    limit: number
): Promise<PublicContentCollections[Key]> {
    try {
        const response = await fetch(`${config.workerbee}/${key}?limit=${limit}`)
        if (!response.ok) throw new Error(`Failed to fetch ${key}`)
        const data = await response.json()

        return {
            [key]: Array.isArray(data?.[key]) ? data[key] : [],
            total_count: typeof data?.total_count === 'number' ? data.total_count : 0,
        } as unknown as PublicContentCollections[Key]
    } catch {
        return { [key]: [], total_count: 0 } as unknown as PublicContentCollections[Key]
    }
}

async function fetchPublicJson(path: string, error: string) {
    const response = await fetch(`${config.workerbee}${path}`)
    if (!response.ok) throw new Error(error)
    return toRecord(await response.json())
}
