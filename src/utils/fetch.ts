import config from '@/constants'

/**
 * Function for checking when the API was last fetched successfully.
 *
 * @returns String
 */
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

/**
 * Fetches the specific event page for additional details
 *
 * @param {number} id Event id fetch details for
 *
 * @returns All details for passed event
 */
export async function fetchEventDetails(id: number): Promise<GetEventProps> {
    // Fetches events
    const response = await fetch(`${config.api}/events/${id}`)

    // Test API
    // const response = await fetch(`${testapi}events/${id}`)
    const eventDetails: GetEventProps = await response.json()
    return eventDetails
}

/**
 * Fetches data from API, formats the response, sets the cache, updates the
 * events on the screen, catches any errors and fetches localstorage, and
 * handles errors.
 */
export async function fetchEvents(): Promise<GetEventProps[]> {
    try {
        // Fetches events
        const response = await fetch(`${config.api}/events`)
        if (!response.ok) {
            throw new Error('Failed to fetch events from API')
        }

        const data = await response.json()
        return data.events
    } catch (error) {
        console.log(error)
        return []
    }
}

/**
 * Fetches data from API, formats the response, sets the cache, updates the
 * events on the screen, catches any errors and fetches localstorage, and
 * handles errors.
 */
export async function fetchAds(): Promise<GetJobProps[]> {
    try {
        const response = await fetch(`${config.api}/jobs`)
        if (!response.ok) {
            throw new Error('Failed to fetch ads from API')
        }

        const data = await response.json()
        return data.jobs || []
    } catch (error) {
        console.log(error)
        return []
    }
}

/**
 * Fetches the specific ad page for additional details
 *
 * @param {object} adID Ad to fetch details for
 *
 * @returns All details for passed event
 */
export async function fetchAdDetails(adID: number): Promise<GetJobProps | null> {
    try {
        const response = await fetch(`${config.api}/jobs/${adID}`)
        if (!response.ok) {
            throw new Error('Failed to fetch ad details from API')
        }

        // Dev
        // const response = await fetch(`${testapi}jobs/${ad.id}`)
        const adDetails = await response.json()
        return adDetails && typeof adDetails === 'object' && typeof adDetails.id === 'number'
            ? adDetails as GetJobProps
            : null
    } catch {
        return null
    }
}

export async function fetchAlbums(limit = 12, offset = 0): Promise<GetAlbumsProps> {
    try {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
            sort: 'desc',
        })
        const response = await fetch(`${config.api}/albums?${params.toString()}`)
        if (!response.ok) {
            throw new Error('Failed to fetch albums from API')
        }

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
        if (!response.ok) {
            throw new Error('Failed to fetch album details from API')
        }

        const albumDetails = await response.json()
        return albumDetails && typeof albumDetails === 'object' && typeof albumDetails.id === 'number'
            ? albumDetails as GetAlbumProps
            : null
    } catch {
        return null
    }
}

export async function fetchFundHoldings(): Promise<FundHoldingsTotal | null> {
    try {
        const response = await fetch(`${config.login_url}/api/fund/holdings`)
        if (!response.ok) {
            throw new Error('Failed to fetch fund holdings')
        }

        const data = await response.json()
        return typeof data?.totalBase === 'number'
            ? data as FundHoldingsTotal
            : null
    } catch {
        return null
    }
}

export async function fetchFundHoldingsHistory(range: FundHoldingsRange = '1m'): Promise<FundHoldingsHistory | null> {
    try {
        const response = await fetch(`${config.login_url}/api/fund/holdings/history?range=${range}`)
        if (!response.ok) {
            throw new Error('Failed to fetch fund holdings history')
        }

        const data = await response.json()
        return Array.isArray(data?.points)
            ? data as FundHoldingsHistory
            : null
    } catch {
        return null
    }
}

export async function fetchRules(limit = 20): Promise<GetRulesProps> {
    try {
        const response = await fetch(`${config.api}/rules?limit=${limit}`)
        if (!response.ok) {
            throw new Error('Failed to fetch rules')
        }

        const data = await response.json()
        return {
            rules: Array.isArray(data?.rules) ? data.rules : [],
            total_count: typeof data?.total_count === 'number' ? data.total_count : 0,
        }
    } catch {
        return { rules: [], total_count: 0 }
    }
}

export async function fetchLocations(limit = 20): Promise<GetLocationsProps> {
    try {
        const response = await fetch(`${config.api}/locations?limit=${limit}`)
        if (!response.ok) {
            throw new Error('Failed to fetch locations')
        }

        const data = await response.json()
        return {
            locations: Array.isArray(data?.locations) ? data.locations : [],
            total_count: typeof data?.total_count === 'number' ? data.total_count : 0,
        }
    } catch {
        return { locations: [], total_count: 0 }
    }
}

export async function fetchOrganizations(limit = 20): Promise<GetOrganizationsProps> {
    try {
        const response = await fetch(`${config.api}/organizations?limit=${limit}`)
        if (!response.ok) {
            throw new Error('Failed to fetch organizations')
        }

        const data = await response.json()
        return {
            organizations: Array.isArray(data?.organizations) ? data.organizations : [],
            total_count: typeof data?.total_count === 'number' ? data.total_count : 0,
        }
    } catch {
        return { organizations: [], total_count: 0 }
    }
}

/**
 * Checks how long its been since a date object
 *
 * @returns number, seconds
 */
export function timeSince(downloadState: Date): number {
    const now = new Date()
    const before = new Date(downloadState)
    return now.valueOf() - before.valueOf()
}
