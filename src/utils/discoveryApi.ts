import config from '@/constants'

type RequestOptions = {
    timeoutMs?: number
}

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

function normalizeSpotifyImage(image: unknown) {
    if (typeof image !== 'string' || !image.length) {
        return ''
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image
    }

    return `https://i.scdn.co/image/${image}`
}

function normalizeMusicRow(entry: any, fallbackType: NativeMusicRow['type'] = 'track'): NativeMusicRow {
    return {
        id: entry.id ?? entry.song_id ?? entry.album_id ?? entry.artist_id ?? entry.name,
        type: entry.type || fallbackType,
        name: entry.name || entry.song || entry.artist || entry.album || 'Unknown',
        artist: entry.artist || entry.show || '',
        album: entry.album || null,
        image: normalizeSpotifyImage(entry.image || entry.top_song_image),
        listens: Number(entry.listens || entry.total_listens || 0),
        song_id: typeof entry.song_id === 'string' ? entry.song_id : undefined,
        artist_id: typeof entry.artist_id === 'string' ? entry.artist_id : undefined,
        album_id: typeof entry.album_id === 'string' ? entry.album_id : undefined,
    }
}

async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 5000)

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return await response.json() as T
    } finally {
        clearTimeout(timeout)
    }
}

async function requestCount(path: string, key: string) {
    const data = await requestJson<Record<string, unknown>>(`${config.api}${path}`)
    return typeof data[key] === 'number' ? data[key] as number : 0
}

export async function getPublicStatus(): Promise<PublicMonitoringService[]> {
    return await requestJson<PublicMonitoringService[]>(`${config.beekeeper_api_url}/monitoring`)
}

export async function getSafeMusicActivity(): Promise<NativeMusicActivity> {
    const data = await requestJson<any>(`${config.tekkom_bot_api_url}/activity`)
    return {
        stats: data.stats || {
            avg_seconds: 0,
            total_minutes: 0,
            total_minutes_this_year: 0,
            total_songs: 0,
        },
        currentlyListening: Array.isArray(data.currentlyListening)
            ? data.currentlyListening.map((entry: any) => normalizeMusicRow(entry, entry.type || 'track'))
            : [],
        topFiveToday: Array.isArray(data.topFiveToday)
            ? data.topFiveToday.map((entry: any) => normalizeMusicRow(entry))
            : [],
        topFiveThisWeek: Array.isArray(data.topFiveThisWeek)
            ? data.topFiveThisWeek.map((entry: any) => normalizeMusicRow(entry))
            : [],
        topFiveThisMonth: Array.isArray(data.topFiveThisMonth)
            ? data.topFiveThisMonth.map((entry: any) => normalizeMusicRow(entry))
            : [],
    }
}

export async function getDashboardSummary(): Promise<NativeDashboardSummary> {
    const [events, jobs, organizations, locations, albums, categories, additions, yearly] = await Promise.all([
        requestCount('/events?limit=1', 'total_count'),
        requestCount('/jobs?limit=1', 'total_count'),
        requestCount('/organizations?limit=1', 'total_count'),
        requestCount('/locations?limit=1', 'total_count'),
        requestCount('/albums?limit=1', 'total_count'),
        requestJson<NativeDashboardSummary['categories']>(`${config.api}/stats/categories`),
        requestJson<NativeDashboardSummary['additions']>(`${config.api}/stats/new-additions?limit=10`),
        requestJson<NativeDashboardSummary['yearly']>(`${config.api}/stats/yearly`),
    ])

    return {
        counts: {
            events,
            jobs,
            organizations,
            locations,
            albums,
        },
        categories,
        additions,
        yearly,
    }
}

export function buildSearchAnimationLink(query: string, engine: 'google' | 'duckduckgo' | 'brave') {
    const payload = JSON.stringify({ query, engine })
    const token = btoa(payload)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '')

    return `${config.login_url}/s?s=${token}&play=1`
}

export function buildSearchEngineUrl(query: string, engine: 'google' | 'duckduckgo' | 'brave') {
    const encodedQuery = encodeURIComponent(query)

    switch (engine) {
        case 'duckduckgo':
            return `https://duckduckgo.com/?q=${encodedQuery}`
        case 'google':
            return `https://www.google.com/search?q=${encodedQuery}`
        default:
            return `https://search.brave.com/search?q=${encodedQuery}`
    }
}

export function buildSpotifyUrl(item: Pick<NativeMusicRow, 'type' | 'song_id' | 'artist_id' | 'album_id' | 'id'>) {
    if (item.type === 'episode') {
        return typeof item.id === 'string'
            ? `https://open.spotify.com/episode/${item.id}`
            : null
    }

    if (item.song_id) {
        return `https://open.spotify.com/track/${item.song_id}`
    }

    if (item.album_id) {
        return `https://open.spotify.com/album/${item.album_id}`
    }

    if (item.artist_id) {
        return `https://open.spotify.com/artist/${item.artist_id}`
    }

    return null
}
