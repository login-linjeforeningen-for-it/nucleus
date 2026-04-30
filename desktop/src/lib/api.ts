export type ServiceStatus = 'live' | 'locked' | 'error'

export type DashboardCounts = {
  events: number
  jobs: number
  announcements: number | null
  organizations: number
  locations: number
  albums: number
  rules: number
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

export type AppNotificationHistoryEntry = {
  id: string
  title: string
  body: string
  topic: string
  data?: Record<string, string>
  sentAt?: string
  delivered?: number
  failed?: number
}

export type ScheduledAppNotificationEntry = {
  id: string
  title: string
  body: string
  topic: string
  data?: Record<string, string>
  scheduledAt: string
  status: 'scheduled' | 'processing' | 'sent' | 'failed' | 'cancelled' | string
  lastError?: string | null
  delivered?: number | null
  failed?: number | null
}

export type RuleItem = {
  id: number | string
  name_no?: string
  name_en?: string
  description_no?: string
  description_en?: string
  created_at?: string
  updated_at?: string
}

export type AlertItem = {
  id: number | string
  title_no?: string
  title_en?: string
  description_no?: string
  description_en?: string
  service?: string
  page?: string
  created_at?: string
  updated_at?: string
}

export type HoneyItem = {
  id: number | string
  service?: string
  page?: string
  language?: string
  text?: string | Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export type CompaniesText = {
  service?: string
  page?: string
  language?: string
  text?: Record<string, Record<string, {
    title?: string
    body?: string
    subtitle?: string
  }>>
}

export type MusicActivity = {
  stats: {
    avg_seconds?: number
    total_minutes?: number
    total_minutes_this_year?: number
    total_songs?: number
  }
  currentlyListening?: Array<{
    title?: string
    name?: string
    artist?: string
    album?: string
    image?: string
    song_image?: string
  }>
  mostPlayedAlbums?: Array<{
    album?: string
    artist?: string
    total_listens?: string | number
    top_song?: string
    top_song_image?: string
  }>
  mostPlayedArtists?: Array<{
    artist?: string
    total_listens?: string | number
  }>
  topFiveToday?: Array<{
    title?: string
    name?: string
    artist?: string
    album?: string
    listens?: string | number
    image?: string
    song_image?: string
  }>
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

export type QueenbeeSite = {
  id?: number | string
  name?: string
  domain?: string
  ip?: string
  primary?: boolean
  enabled?: boolean
  status?: string
}

export type TrafficMetrics = {
  total_requests?: number
  error_count?: number
  avg_response_time?: number
  avg_request_time?: number
  error_rate?: number
  top_domains?: Array<{ key: string; count?: number; avg_time?: number }>
  top_paths?: Array<{ key: string; count?: number; avg_time?: number }>
  top_status_codes?: Array<{ key: string; count?: number; avg_time?: number }>
}

export type TrafficRecord = {
  id?: number | string
  timestamp?: string
  method?: string
  path?: string
  domain?: string
  country_iso?: string
  status?: number
  request_time?: number
  user_agent?: string
  referer?: string
}

export type TrafficRecords = {
  result?: TrafficRecord[]
  total?: number
}

export type VulnerabilityReport = {
  generatedAt?: string | null
  imageCount?: number
  images?: Array<{
    image: string
    totalVulnerabilities: number
    severity?: Record<string, number>
    scanError?: string | null
  }>
  scanStatus?: {
    isRunning?: boolean
    lastSuccessAt?: string | null
    lastError?: string | null
    totalImages?: number | null
    completedImages?: number
    currentImage?: string | null
  }
}

export type DockerOverview = {
  status?: string
  count?: number
  containers?: Array<{
    id?: string
    name?: string
    image?: string
    status?: string
    state?: string
  }>
  error?: string
}

export type DockerLogs = {
  containers?: string[]
  logs?: Array<{
    container?: string
    service?: string
    timestamp?: string
    message?: string
    level?: string
  }>
  entries?: Array<{
    container?: string
    service?: string
    timestamp?: string
    message?: string
    level?: string
  }>
}

export type MonitoringNotification = {
  id: number | string
  name?: string
  message?: string
  webhook?: string
}

export type MonitoringTag = {
  id: number | string
  name?: string
  color?: string
}

export type BackupItem = {
  id?: string
  name?: string
  status?: string
  lastBackup?: string | null
  nextBackup?: string | null
  dbSize?: string
  totalStorage?: string
  error?: string
}

export type FundHoldingsTotal = {
  totalBase: number
  currency?: string
  updatedAt?: number
}

export type FundHoldingsHistory = {
  points: Array<{
    date: string
    totalBase: number
  }>
  currency?: string
  updatedAt?: number
}

export type GameItem = {
  id: number | string
  name: string
  endpoint?: string
  description_no?: string
  description_en?: string
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
  rules: RuleItem[]
  alerts: AlertItem[]
  honey: HoneyItem[]
  companiesText: CompaniesText | null
  music: MusicActivity | null
  fund: {
    holdings: FundHoldingsTotal | null
    history: FundHoldingsHistory | null
  }
  games: GameItem[]
  announcements: AnnouncementItem[]
  statusServices: StatusService[]
  internal: InternalOverview | null
  queenbee: {
    sites: QueenbeeSite[]
    databases: unknown | null
    traffic: TrafficMetrics | null
    vulnerabilities: VulnerabilityReport | null
    docker: DockerOverview | null
    logs: DockerLogs | null
    trafficDomains: string[]
    trafficRecords: TrafficRecords | null
    monitoringNotifications: MonitoringNotification[]
    monitoringTags: MonitoringTag[]
    backups: BackupItem[]
  }
  health: Record<string, ServiceStatus>
  fetchedAt: string
}

type WorkerbeeResponse<T, K extends string> = {
  total_count?: number
} & Record<K, T[] | undefined>

const WORKERBEE = import.meta.env.VITE_WORKERBEE_API ?? 'https://workerbee.login.no/api/v2'
const BEEKEEPER = import.meta.env.VITE_BEEKEEPER_API ?? 'https://beekeeper.login.no/api'
const BOT = import.meta.env.VITE_BOT_API ?? 'https://bot.login.no/api'
const APP_API = import.meta.env.VITE_APP_API ?? 'https://app.login.no/api'
const LOGIN = import.meta.env.VITE_LOGIN_URL ?? 'https://login.no'
const BEEKEEPER_TOKEN = import.meta.env.VITE_BEEKEEPER_TOKEN
const QUEENBEE_TOKEN_KEY = 'login-desktop.queenbee-token'
const APP_API_TOKEN_KEY = 'login-desktop.app-api-token'

export type QueenbeeService = 'workerbee' | 'bot' | 'beekeeper'

export function getQueenbeeToken() {
  return window.localStorage.getItem(QUEENBEE_TOKEN_KEY) || ''
}

export function setQueenbeeToken(token: string) {
  const trimmed = token.trim()
  if (trimmed) window.localStorage.setItem(QUEENBEE_TOKEN_KEY, trimmed)
  else window.localStorage.removeItem(QUEENBEE_TOKEN_KEY)
}

export function hasQueenbeeToken() {
  return Boolean(getQueenbeeToken())
}

export function getAppApiAdminToken() {
  return window.localStorage.getItem(APP_API_TOKEN_KEY) || ''
}

export function setAppApiAdminToken(token: string) {
  const trimmed = token.trim()
  if (trimmed) window.localStorage.setItem(APP_API_TOKEN_KEY, trimmed)
  else window.localStorage.removeItem(APP_API_TOKEN_KEY)
}

export function hasAppApiAdminToken() {
  return Boolean(getAppApiAdminToken())
}

function serviceBase(service: QueenbeeService) {
  if (service === 'bot') return BOT
  if (service === 'beekeeper') return BEEKEEPER
  return WORKERBEE
}

async function requestJson<T>(url: string, timeoutMs = 5500): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(BEEKEEPER_TOKEN && url.startsWith(BEEKEEPER) ? { Authorization: `Bearer ${BEEKEEPER_TOKEN}` } : {}),
      },
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

export async function queenbeeRequest<T>({
  service,
  path,
  method = 'GET',
  data,
  timeoutMs = 9000,
}: {
  service: QueenbeeService
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: unknown
  timeoutMs?: number
}): Promise<T> {
  const token = getQueenbeeToken()
  if (!token) throw new Error('Missing Queenbee access token in Settings.')

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  const url = `${serviceBase(service)}/${path.replace(/^\/+/, '')}`
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...(service === 'bot' ? { btg: 'tekkom-bot' } : {}),
      },
      body: data === undefined ? undefined : isFormData ? data : JSON.stringify(data),
      signal: controller.signal,
    })
    const text = await response.text()
    const body = parseJsonResponse(text)
    if (!response.ok) {
      const message = typeof body?.message === 'string' ? body.message : typeof body?.error === 'string' ? body.error : response.statusText
      throw new Error(message || `Queenbee ${method} failed`)
    }
    return body as T
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function appApiRequest<T>({
  path,
  method = 'GET',
  data,
  timeoutMs = 9000,
}: {
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: unknown
  timeoutMs?: number
}): Promise<T> {
  const token = getAppApiAdminToken()
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  const url = `${APP_API}/${path.replace(/^\/+/, '')}`

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: controller.signal,
    })
    const text = await response.text()
    const body = parseJsonResponse(text)
    if (!response.ok) {
      const message = typeof body?.message === 'string' ? body.message : typeof body?.error === 'string' ? body.error : response.statusText
      throw new Error(message || `App API ${method} failed`)
    }
    return body as T
  } finally {
    window.clearTimeout(timeout)
  }
}

function parseJsonResponse(text: string) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

async function safe<T>(key: string, task: () => Promise<T>, health: Record<string, ServiceStatus>): Promise<T | null> {
  try {
    const value = await task()
    health[key] = 'live'
    return value
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    health[key] = message.includes('unauthorized') || message.includes('authorization') || message.includes('401') ? 'locked' : 'error'
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
    rulesPayload,
    alertsPayload,
    honeyPayload,
    companiesText,
    music,
    fundHoldings,
    fundHistory,
    games,
    sites,
    databases,
    traffic,
    vulnerabilities,
    docker,
    logs,
    trafficDomains,
    trafficRecords,
    monitoringNotifications,
    monitoringTags,
    backups,
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
    safe('rules', () => requestJson<WorkerbeeResponse<RuleItem, 'rules'>>(`${WORKERBEE}/rules?limit=24&offset=0`), health),
    safe('alerts', () => requestJson<WorkerbeeResponse<AlertItem, 'alerts'>>(`${WORKERBEE}/alerts?limit=24&offset=0`), health),
    safe('honey', () => requestJson<WorkerbeeResponse<HoneyItem, 'honeys'>>(`${WORKERBEE}/text/beehive?limit=24&offset=0`), health),
    safe('companies-text', () => requestJson<CompaniesText>(`${WORKERBEE}/text/beehive/companies/en`), health),
    safe('music', () => requestJson<MusicActivity>(`${BOT}/activity`, 7500), health),
    safe('fund-holdings', () => requestJson<FundHoldingsTotal>(`${LOGIN}/api/fund/holdings`, 7500), health),
    safe('fund-history', () => requestJson<FundHoldingsHistory>(`${LOGIN}/api/fund/holdings/history?range=1m`, 7500), health),
    safe('games', () => requestJson<GameItem[]>(`${APP_API}/games`, 7500), health),
    safe('sites', () => requestJson<QueenbeeSite[]>(`${BEEKEEPER}/sites`), health),
    safe('db', () => requestJson<unknown>(`${BEEKEEPER}/db`, 7000), health),
    safe('traffic', () => requestJson<TrafficMetrics>(`${BEEKEEPER}/traffic/metrics`, 7000), health),
    safe('vulnerabilities', () => requestJson<VulnerabilityReport>(`${BEEKEEPER}/vulnerabilities`, 7000), health),
    safe('docker', () => requestJson<DockerOverview>(`${BEEKEEPER}/docker`, 7000), health),
    safe('logs', () => requestJson<DockerLogs>(`${BEEKEEPER}/docker/logs?limit=12`, 7000), health),
    safe('traffic-domains', () => requestJson<{ domains?: string[] }>(`${BEEKEEPER}/traffic/domains`, 7000), health),
    safe('traffic-records', () => requestJson<TrafficRecords>(`${BEEKEEPER}/traffic/records?limit=13&page=1`, 7000), health),
    safe('monitoring-notifications', () => requestJson<MonitoringNotification[]>(`${BEEKEEPER}/monitoring/notifications`, 7000), health),
    safe('monitoring-tags', () => requestJson<MonitoringTag[]>(`${BEEKEEPER}/monitoring/tags`, 7000), health),
    safe('backups', () => requestJson<BackupItem[]>(`${BEEKEEPER}/backup`, 9000), health),
  ])

  return {
    counts: {
      events: readTotal(eventsPayload),
      jobs: readTotal(jobsPayload),
      organizations: readTotal(organizationsPayload),
      locations: readTotal(locationsPayload),
      albums: readTotal(albumsPayload),
      rules: readTotal(rulesPayload),
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
    rules: readRows(rulesPayload, 'rules'),
    alerts: readRows(alertsPayload, 'alerts'),
    honey: readRows(honeyPayload, 'honeys'),
    companiesText,
    music,
    fund: {
      holdings: fundHoldings && typeof fundHoldings.totalBase === 'number' ? fundHoldings : null,
      history: fundHistory && Array.isArray(fundHistory.points) ? fundHistory : null,
    },
    games: Array.isArray(games) ? games : [],
    announcements: readRows(announcementsPayload, 'announcements'),
    statusServices: Array.isArray(statusServices) ? statusServices : [],
    internal,
    queenbee: {
      sites: Array.isArray(sites) ? sites : [],
      databases,
      traffic,
      vulnerabilities,
      docker,
      logs,
      trafficDomains: Array.isArray(trafficDomains?.domains) ? trafficDomains.domains : [],
      trafficRecords,
      monitoringNotifications: Array.isArray(monitoringNotifications) ? monitoringNotifications : [],
      monitoringTags: Array.isArray(monitoringTags) ? monitoringTags : [],
      backups: Array.isArray(backups) ? backups : [],
    },
    health,
    fetchedAt: new Date().toISOString(),
  }
}

export function eventImageUrl(filename?: string) {
  return filename ? `https://s3.login.no/beehive/img/events/${filename}` : ''
}

export function albumImageUrl(albumId: number | string, filename?: string) {
  return filename ? `https://s3.login.no/beehive/albums/${albumId}/${encodeURIComponent(filename)}` : ''
}
