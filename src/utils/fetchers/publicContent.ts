import config from '@/constants'

export async function fetchEventDetails(id: number): Promise<GetEventProps> {
    const response = await fetch(`${config.api}/events/${id}`)
    return await response.json()
}

export async function fetchEvents(): Promise<GetEventProps[]> {
    try {
        const response = await fetch(`${config.api}/events`)
        if (!response.ok) throw new Error('Failed to fetch events from API')
        const data = await response.json()
        return data.events
    } catch (error) {
        console.log(error)
        return []
    }
}

export async function fetchAds(): Promise<GetJobProps[]> {
    try {
        const response = await fetch(`${config.api}/jobs`)
        if (!response.ok) throw new Error('Failed to fetch ads from API')
        const data = await response.json()
        return data.jobs || []
    } catch (error) {
        console.log(error)
        return []
    }
}

export async function fetchAdDetails(adID: number): Promise<GetJobProps | null> {
    try {
        const response = await fetch(`${config.api}/jobs/${adID}`)
        if (!response.ok) throw new Error('Failed to fetch ad details from API')
        const adDetails = await response.json()
        return adDetails && typeof adDetails === 'object' && typeof adDetails.id === 'number'
            ? adDetails as GetJobProps
            : null
    } catch {
        return null
    }
}

export async function fetchAlbums(limit = 50, offset = 0): Promise<GetAlbumsProps> {
    try {
        const params = new URLSearchParams({ limit: String(limit), offset: String(offset), sort: 'desc' })
        const response = await fetch(`${config.api}/albums?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch albums from API')
        const data = await response.json()
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
        const response = await fetch(`${config.api}/albums/${albumID}`)
        if (!response.ok) throw new Error('Failed to fetch album details from API')
        const albumDetails = await response.json()
        return albumDetails && typeof albumDetails === 'object' && typeof albumDetails.id === 'number'
            ? albumDetails as GetAlbumProps
            : null
    } catch {
        return null
    }
}

export async function fetchRules(limit = 20): Promise<GetRulesProps> {
    try {
        const response = await fetch(`${config.api}/rules?limit=${limit}`)
        if (!response.ok) throw new Error('Failed to fetch rules')
        const data = await response.json()
        return { rules: Array.isArray(data?.rules) ? data.rules : [], total_count: typeof data?.total_count === 'number' ? data.total_count : 0 }
    } catch {
        return { rules: [], total_count: 0 }
    }
}

export async function fetchLocations(limit = 20): Promise<GetLocationsProps> {
    try {
        const response = await fetch(`${config.api}/locations?limit=${limit}`)
        if (!response.ok) throw new Error('Failed to fetch locations')
        const data = await response.json()
        return { locations: Array.isArray(data?.locations) ? data.locations : [], total_count: typeof data?.total_count === 'number' ? data.total_count : 0 }
    } catch {
        return { locations: [], total_count: 0 }
    }
}

export async function fetchOrganizations(limit = 20): Promise<GetOrganizationsProps> {
    try {
        const response = await fetch(`${config.api}/organizations?limit=${limit}`)
        if (!response.ok) throw new Error('Failed to fetch organizations')
        const data = await response.json()
        return { organizations: Array.isArray(data?.organizations) ? data.organizations : [], total_count: typeof data?.total_count === 'number' ? data.total_count : 0 }
    } catch {
        return { organizations: [], total_count: 0 }
    }
}
