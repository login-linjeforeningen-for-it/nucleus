export type ServiceStatus = 'live' | 'locked' | 'error'

export type DashboardCounts = {
  events: number
  jobs: number
  announcements: number | null
  organizations: number
  locations: number
  albums: number
}

export type CategoryStat = {
  id?: number
  name_en?: string
  name_no?: string
  event_count?: number
  color?: string
}

export type RecentAddition = {
  id: number | string
  name_en?: string
  name_no?: string
  source?: string
  action?: string
  updated_at?: string
  created_at?: string
}

export type EventItem = {
  id: number | string
  name_en?: string
  name_no?: string
  time_start?: string
  time_end?: string
  image_small?: string
  image_banner?: string
  category?: {
    name_en?: string
    name_no?: string
    color?: string
  } | null
  location?: {
    name?: string
    name_en?: string
    name_no?: string
  } | null
}

export type JobItem = {
  id: number | string
  title?: string
  title_en?: string
  title_no?: string
  name_en?: string
  name_no?: string
  organization?: { name?: string; name_en?: string; name_no?: string } | null
  organizations?: Array<{ name?: string; name_en?: string; name_no?: string }>
  deadline?: string
  updated_at?: string
  created_at?: string
}

export type NamedItem = {
  id: number | string
  name?: string
  name_en?: string
  name_no?: string
  image?: string
  logo?: string
  city?: string
  address?: string
  updated_at?: string
  created_at?: string
}

export type AlbumItem = NamedItem & {
  cover?: string
  cover_image?: string
  image_small?: string
}

export type AnnouncementItem = {
  id: number | string
  title?: string | string[]
  description?: string | string[]
  channel?: string
  roles?: string[] | string | null
  sent?: boolean
  interval?: string | null
  time?: string | null
  updated_at?: string
  created_at?: string
}

export type StatusService = {
  id: number | string
  name: string
  enabled?: boolean
  url?: string
  bars?: Array<{
    status?: boolean | number
    delay?: number
    timestamp?: string
    expectedDown?: boolean
  }>
}

export type InternalOverview = {
  statistics: {
    alerts: number
    databases: number
    sites: number
    monitored: number
    requestsToday: number
  }
  information: {
    primarySite: {
      id: number
      name: string
      ip: string
    }
    system: {
      ram: string
      processes: number
      disk: string
      load: string
      containers: number
    }
  }
  runtime: {
    metrics: {
      system: {
        load: number[]
        memory: {
          used: number
          total: number
          percent: string
        }
        disk: string
        temperature: string
        powerUsage: string
        processes: number
        ipv4: string[]
        ipv6: string[]
        os: string
      }
    }
  }
}

export type DashboardData = {
  counts: DashboardCounts
  categories: CategoryStat[]
  additions: RecentAddition[]
  yearly: Array<{ insert_date: string; inserted_count: number }>
  events: EventItem[]
  jobs: JobItem[]
  organizations: NamedItem[]
  locations: NamedItem[]
  albums: AlbumItem[]
  announcements: AnnouncementItem[]
  statusServices: StatusService[]
  internal: InternalOverview | null
  health: Record<string, ServiceStatus>
  fetchedAt: string
}

type WorkerbeeResponse<T, K extends string> = {
  total_count?: number
} & Record<K, T[] | undefined>

const WORKERBEE = import.meta.env.VITE_WORKERBEE_API ?? 'https://workerbee.login.no/api/v2'
const BEEKEEPER = import.meta.env.VITE_BEEKEEPER_API ?? 'https://beekeeper.login.no/api'
const BOT = import.meta.env.VITE_BOT_API ?? 'https://bot.login.no/api'

async function requestJson<T>(url: string, timeoutMs = 5500): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })
    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      const message = typeof data?.error === 'string' ? data.error : response.statusText
      throw new Error(message || 'Request failed')
    }

    return data as T
  } finally {
    window.clearTimeout(timeout)
  }
}

async function safe<T>(key: string, task: () => Promise<T>, health: Record<string, ServiceStatus>): Promise<T | null> {
  try {
    const value = await task()
    health[key] = 'live'
    return value
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    health[key] = message.includes('unauthorized') || message.includes('401') ? 'locked' : 'error'
    return null
  }
}

function readTotal(value: { total_count?: unknown } | null) {
  return typeof value?.total_count === 'number' ? value.total_count : 0
}

function readRows<T, K extends string>(value: WorkerbeeResponse<T, K> | null, key: K) {
  const rows = value?.[key]
  return Array.isArray(rows) ? rows : []
}

export async function loadDashboardData(): Promise<DashboardData> {
  const health: Record<string, ServiceStatus> = {}
  const [
    eventsPayload,
    jobsPayload,
    organizationsPayload,
    locationsPayload,
    albumsPayload,
    categories,
    additions,
    yearly,
    statusServices,
    internal,
    announcementsPayload,
  ] = await Promise.all([
    safe('events', () => requestJson<WorkerbeeResponse<EventItem, 'events'>>(`${WORKERBEE}/events?limit=24&order_by=time_start&sort=asc`), health),
    safe('jobs', () => requestJson<WorkerbeeResponse<JobItem, 'jobs'>>(`${WORKERBEE}/jobs?limit=24&offset=0`), health),
    safe('organizations', () => requestJson<WorkerbeeResponse<NamedItem, 'organizations'>>(`${WORKERBEE}/organizations?limit=24&offset=0`), health),
    safe('locations', () => requestJson<WorkerbeeResponse<NamedItem, 'locations'>>(`${WORKERBEE}/locations?limit=24&offset=0`), health),
    safe('albums', () => requestJson<WorkerbeeResponse<AlbumItem, 'albums'>>(`${WORKERBEE}/albums?limit=24&offset=0`), health),
    safe('categories', () => requestJson<CategoryStat[]>(`${WORKERBEE}/stats/categories`), health),
    safe('recent-additions', () => requestJson<RecentAddition[]>(`${WORKERBEE}/stats/new-additions?limit=14`), health),
    safe('yearly', () => requestJson<Array<{ insert_date: string; inserted_count: number }>>(`${WORKERBEE}/stats/yearly`), health),
    safe('status', () => requestJson<StatusService[]>(`${BEEKEEPER}/monitoring`), health),
    safe('internal', () => requestJson<InternalOverview>(`${BEEKEEPER}/dashboard/internal`), health),
    safe('announcements', () => requestJson<WorkerbeeResponse<AnnouncementItem, 'announcements'>>(`${BOT}/announcements?limit=24&includePlaceholders=true`), health),
  ])

  return {
    counts: {
      events: readTotal(eventsPayload),
      jobs: readTotal(jobsPayload),
      organizations: readTotal(organizationsPayload),
      locations: readTotal(locationsPayload),
      albums: readTotal(albumsPayload),
      announcements: readTotal(announcementsPayload) || readRows(announcementsPayload, 'announcements').length,
    },
    categories: Array.isArray(categories) ? categories : [],
    additions: Array.isArray(additions) ? additions : [],
    yearly: Array.isArray(yearly) ? yearly : [],
    events: readRows(eventsPayload, 'events'),
    jobs: readRows(jobsPayload, 'jobs'),
    organizations: readRows(organizationsPayload, 'organizations'),
    locations: readRows(locationsPayload, 'locations'),
    albums: readRows(albumsPayload, 'albums'),
    announcements: readRows(announcementsPayload, 'announcements'),
    statusServices: Array.isArray(statusServices) ? statusServices : [],
    internal,
    health,
    fetchedAt: new Date().toISOString(),
  }
}

export function eventImageUrl(filename?: string) {
  return filename ? `https://cdn.login.no/img/events/${filename}` : ''
}

export function albumImageUrl(albumId: number | string, filename?: string) {
  return filename ? `https://cdn.login.no/albums/${albumId}/${filename}` : ''
}
