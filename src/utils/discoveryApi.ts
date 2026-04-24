import config from "@/constants"

type RequestOptions = {
    timeoutMs?: number
}

export type NativeMonitoringService = {
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

export type NativeMusicActivity = {
    stats: {
        avg_seconds: number
        total_minutes: number
        total_minutes_this_year: number
        total_songs: number
    }
    currentlyListening: {
        id: number
        type: "track" | "episode"
        name: string
        artist: string
        album: string | null
        image: string
    }[]
    topFiveToday: { name: string, artist: string, image: string, listens: number }[]
    topFiveThisWeek: { name: string, artist: string, image: string, listens: number }[]
    topFiveThisMonth: { name: string, artist: string, image: string, listens: number }[]
}

export type NativeDashboardSummary = {
    counts: {
        events: number
        jobs: number
        organizations: number
        locations: number
        albums: number
    }
    categories: { id: number, name_en: string, event_count: number, color: string }[]
    additions: { id: number, name_en: string, updated_at: string, action: "created" | "updated", source: string }[]
    yearly: { insert_date: string, inserted_count: number }[]
}

async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 5000)

    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
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
    return typeof data[key] === "number" ? data[key] as number : 0
}

export async function getPublicStatus(): Promise<NativeMonitoringService[]> {
    return await requestJson<NativeMonitoringService[]>(`${config.beekeeper_api_url}/monitoring`)
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
            ? data.currentlyListening.map((entry: any) => ({
                id: entry.id,
                type: entry.type,
                name: entry.name,
                artist: entry.artist,
                album: entry.album || null,
                image: entry.image,
            }))
            : [],
        topFiveToday: Array.isArray(data.topFiveToday) ? data.topFiveToday : [],
        topFiveThisWeek: Array.isArray(data.topFiveThisWeek) ? data.topFiveThisWeek : [],
        topFiveThisMonth: Array.isArray(data.topFiveThisMonth) ? data.topFiveThisMonth : [],
    }
}

export async function getDashboardSummary(): Promise<NativeDashboardSummary> {
    const [events, jobs, organizations, locations, albums, categories, additions, yearly] = await Promise.all([
        requestCount("/events?limit=1", "total_count"),
        requestCount("/jobs?limit=1", "total_count"),
        requestCount("/organizations?limit=1", "total_count"),
        requestCount("/locations?limit=1", "total_count"),
        requestCount("/albums?limit=1", "total_count"),
        requestJson<NativeDashboardSummary["categories"]>(`${config.api}/stats/categories`),
        requestJson<NativeDashboardSummary["additions"]>(`${config.api}/stats/new-additions?limit=10`),
        requestJson<NativeDashboardSummary["yearly"]>(`${config.api}/stats/yearly`),
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

export function buildSearchAnimationLink(query: string, engine: "google" | "duckduckgo" | "brave") {
    const payload = JSON.stringify({ query, engine })
    const token = btoa(payload)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "")

    return `${config.login_url}/s?s=${token}&play=1`
}
