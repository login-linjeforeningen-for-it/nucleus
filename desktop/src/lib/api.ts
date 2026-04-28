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

export type AppNotification = {
    id: string
    title: string
    body: string
    topic: string
    data?: Record<string, string>
    sentAt?: string
    delivered?: number
    failed?: number
}

export type ScheduledNotification = {
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

export type WikiPageItem = {
    id: string
    space_id?: string
    space_slug: string
    slug: string
    title: string
    summary: string
    tags?: string[]
    content_markdown?: string
    visibility?: 'public' | 'internal' | string
    required_role?: string
    status: 'draft' | 'published' | 'archived' | string
    updated_at: string
}

export type WikiPageVersion = {
    id: string
    page_id: string
    title: string
    summary: string
    tags?: string[]
    content_markdown: string
    created_by: string
    created_at: string
}

export type WikiRecentVersion = WikiPageVersion & {
    page_title: string
    page_slug: string
    space_slug: string
    page_visibility?: 'public' | 'internal' | string
    page_required_role?: string
}

export type WikiPageLink = {
    from_page_id: string
    from_space_slug: string
    from_slug: string
    from_title: string
    to_page_id: string
    to_space_slug: string
    to_slug: string
    to_title: string
    created_at: string
}

export type WikiPageComment = {
    id: string
    page_id: string
    parent_id?: string | null
    body_markdown: string
    author_name: string
    resolved_at?: string | null
    created_at: string
    updated_at: string
    page_title?: string
    page_slug?: string
    space_slug?: string
}

export type WikiTreeItem = {
    id: string
    slug: string
    title: string
    summary: string
    tags?: string[]
    visibility?: 'public' | 'internal' | string
    required_role?: string
    status: string
    depth: number
    parentSlug: string | null
    url: string
    updated_at: string
    children: WikiTreeItem[]
}

export type WikiTreeSpace = {
    id: string
    slug: string
    name: string
    description: string
    visibility: 'public' | 'internal' | string
    required_role: string
    pages: WikiTreeItem[]
    pageCount: number
}

export type WikiSpace = {
    id: string
    slug: string
    name: string
    description: string
    visibility: 'public' | 'internal' | string
    required_role: string
}

export type WikiSearchResult = {
    id: string
    kind: 'page' | 'asset' | string
    space: string
    slug: string
    title: string
    summary: string
    tags: string[]
    url: string
    updatedAt: string
    score: number
    snippet: string
}

export type WikiAudit = {
    generatedAt: string
    pages: {
        total: number
        published: number
        drafts: number
        archived: number
    }
    spaces: number
    assets: {
        total: number
        unused: number
        totalBytes: number
        largeFiles: number
        unusedFiles: WikiAuditAsset[]
        largestFiles: WikiAuditAsset[]
    }
    links: {
        broken: Array<{
            fromPageId: string
            fromTitle: string
            fromSpace: string
            fromSlug: string
            targetSpace: string
            targetSlug: string
        }>
        brokenCount: number
    }
    migration: {
        legacySources: number
        collisions: Array<{
            pageId: string
            space: string
            slug: string
            title: string
            sourceCount: number
            sourcePaths: string[]
        }>
        collisionCount: number
    }
    review: {
        pages: Array<{
            id: string
            space: string
            slug: string
            title: string
            reason: string
        }>
        pageCount: number
    }
}

export type WikiAccessReview = {
    generatedAt: string
    totals: {
        publicPages: number
        internalPages: number
        roles: number
        issues: number
    }
    roles: Array<{
        visibility: 'public' | 'internal' | string
        requiredRole: string
        pages: number
    }>
    issues: Array<{
        id: string
        kind: 'page' | 'space' | string
        space: string
        slug: string
        title: string
        issue: string
        href: string
    }>
}

export type WikiAuditAsset = {
    id: string
    page_id?: string | null
    fileName: string
    file_name?: string
    mimeType: string
    mime_type?: string
    sizeBytes: number
    size_bytes?: number
    pageTitle: string | null
    page_title?: string | null
    pageSlug: string | null
    page_slug?: string | null
    spaceSlug: string | null
    space_slug?: string | null
    url: string
    storage_key?: string
    checksum_sha256?: string
    alt_text?: string
    created_by?: string
    created_at?: string
}

export type WikiMeta = {
    service?: string
    version?: string
    endpoints?: Record<string, string[]>
    auth?: {
        adminRole?: string
        writeTokensRequired?: boolean
        writeScopes?: string[]
        adminScopes?: string[]
    }
    limits?: {
        bodyBytes?: number
        assetBytes?: number
    }
}

export type WikiTemplate = {
    id: string
    slug: string
    name: string
    description: string
    suggested_space: string
    suggested_slug: string
    tags: string[]
    content_markdown: string
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string
}

export type WikiData = {
    health: {
        status?: string
        service?: string
        database?: string
        uptimeSeconds?: number
        startedAt?: string
    } | null
    meta: WikiMeta | null
    pages: WikiPageItem[]
    spaces: WikiSpace[]
    tree: WikiTreeSpace[]
    assets: WikiAuditAsset[]
    templates: WikiTemplate[]
    comments: WikiPageComment[]
    versions: WikiRecentVersion[]
    accessReview: WikiAccessReview | null
    audit: WikiAudit | null
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
    wiki: WikiData
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
const QUEENBEE = import.meta.env.VITE_QUEENBEE_URL ?? 'https://queenbee.login.no'
const WIKI_API = import.meta.env.VITE_WIKI_API ?? 'http://127.0.0.1:3002'
const BEEKEEPER_TOKEN = import.meta.env.VITE_BEEKEEPER_TOKEN

export type QueenbeeService = 'workerbee' | 'bot' | 'beekeeper'

function getQueenbeeBearerToken() {
    return BEEKEEPER_TOKEN || ''
}

export function hasQueenbeeAuthSource() {
    return Boolean(getQueenbeeBearerToken())
}

function serviceBase(service: QueenbeeService) {
    if (service === 'bot') return BOT
    if (service === 'beekeeper') return BEEKEEPER
    return WORKERBEE
}

async function requestJson<T>(url: string, timeoutMs = 5500): Promise<T> {
    const controller = new AbortController()
    let timeout: number | undefined

    try {
        const queenbeeToken = getQueenbeeBearerToken()
        const request = fetch(url, {
            headers: {
                ...(url.startsWith(BEEKEEPER) && queenbeeToken ? { Authorization: `Bearer ${queenbeeToken}` } : {}),
                ...(url.startsWith(BOT) && queenbeeToken ? { Authorization: `Bearer ${queenbeeToken}`, btg: 'tekkom-bot' } : {}),
            },
            signal: controller.signal,
        })
        const response = await Promise.race([
            request,
            new Promise<never>((_, reject) => {
                timeout = window.setTimeout(() => {
                    controller.abort()
                    reject(new Error(`Request timed out after ${timeoutMs}ms`))
                }, timeoutMs)
            }),
        ])
        const text = await response.text()
        const data = text ? JSON.parse(text) : null

        if (!response.ok) {
            const message = typeof data?.error === 'string' ? data.error : response.statusText
            throw new Error(message || 'Request failed')
        }

        return data as T
    } finally {
        if (timeout) window.clearTimeout(timeout)
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
    const token = getQueenbeeBearerToken()
    if (!token) throw new Error('Queenbee authentication is required before using protected write actions.')

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

export async function queenbeeWebRequest<T>({
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
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
    const url = `${QUEENBEE}/${path.replace(/^\/+/, '')}`

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: data === undefined ? undefined : JSON.stringify(data),
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

export async function wikiRequest<T>(path: string, timeoutMs = 7000): Promise<T> {
    return requestJson<T>(`${WIKI_API}/${path.replace(/^\/+/, '')}`, timeoutMs)
}

export async function wikiActionRequest<T>(path: string, options: { method?: 'POST' | 'PATCH' | 'DELETE'; data?: unknown; timeoutMs?: number } = {}): Promise<T> {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 9000)

    try {
        const response = await fetch(`${WIKI_API}/${path.replace(/^\/+/, '')}`, {
            method: options.method ?? 'POST',
            headers: options.data === undefined ? undefined : { 'Content-Type': 'application/json' },
            body: options.data === undefined ? undefined : JSON.stringify(options.data),
            signal: controller.signal,
        })
        const text = await response.text()
        const body = parseJsonResponse(text)
        if (!response.ok) {
            const message = typeof body?.message === 'string' ? body.message : typeof body?.error === 'string' ? body.error : response.statusText
            throw new Error(message || `Wiki ${options.method ?? 'POST'} failed`)
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
    const queenbeeAuthReady = hasQueenbeeAuthSource()
    const protectedRead = <T>(key: string, task: () => Promise<T>) => {
        if (queenbeeAuthReady) return safe(key, task, health)
        health[key] = 'locked'
        return Promise.resolve<T | null>(null)
    }
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
        wikiHealth,
        wikiMeta,
        wikiPages,
        wikiSpaces,
        wikiTree,
        wikiAssets,
        wikiTemplates,
        wikiComments,
        wikiVersions,
        wikiAccessReview,
        wikiAudit,
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
        protectedRead('announcements', () => requestJson<WorkerbeeResponse<AnnouncementItem, 'announcements'>>(`${BOT}/announcements?limit=24&includePlaceholders=true`)),
        safe('rules', () => requestJson<WorkerbeeResponse<RuleItem, 'rules'>>(`${WORKERBEE}/rules?limit=24&offset=0`), health),
        safe('alerts', () => requestJson<WorkerbeeResponse<AlertItem, 'alerts'>>(`${WORKERBEE}/alerts?limit=24&offset=0`), health),
        safe('honey', () => requestJson<WorkerbeeResponse<HoneyItem, 'honeys'>>(`${WORKERBEE}/text/beehive?limit=24&offset=0`), health),
        safe('companies-text', () => requestJson<CompaniesText>(`${WORKERBEE}/text/beehive/companies/en`), health),
        safe('music', () => requestJson<MusicActivity>(`${BOT}/activity`, 7500), health),
        safe('fund-holdings', () => requestJson<FundHoldingsTotal>(`${LOGIN}/api/fund/holdings`, 7500), health),
        safe('fund-history', () => requestJson<FundHoldingsHistory>(`${LOGIN}/api/fund/holdings/history?range=1m`, 7500), health),
        safe('games', () => requestJson<GameItem[]>(`${APP_API}/games`, 7500), health),
        safe('wiki-health', () => requestJson<WikiData['health']>(`${WIKI_API}/health`, 5000), health),
        safe('wiki-meta', () => requestJson<WikiMeta>(`${WIKI_API}/meta`, 5000), health),
        safe('wiki-pages', () => requestJson<{ pages?: WikiPageItem[] }>(`${WIKI_API}/pages?limit=30`, 7000), health),
        safe('wiki-spaces', () => requestJson<{ spaces?: WikiSpace[] }>(`${WIKI_API}/spaces`, 7000), health),
        safe('wiki-tree', () => requestJson<WikiTreeSpace[]>(`${WIKI_API}/tree`, 7000), health),
        safe('wiki-assets', () => requestJson<{ assets?: WikiAuditAsset[] }>(`${WIKI_API}/assets?limit=25`, 7000), health),
        safe('wiki-templates', () => requestJson<{ templates?: WikiTemplate[] }>(`${WIKI_API}/templates?limit=24`, 7000), health),
        safe('wiki-comments', () => requestJson<{ comments?: WikiPageComment[] }>(`${WIKI_API}/comments?limit=24`, 7000), health),
        safe('wiki-versions', () => requestJson<{ versions?: WikiRecentVersion[] }>(`${WIKI_API}/versions?limit=24`, 7000), health),
        safe('wiki-access-review', () => requestJson<WikiAccessReview>(`${WIKI_API}/admin/access-review`, 9000), health),
        safe('wiki-audit', () => requestJson<WikiAudit>(`${WIKI_API}/admin/audit`, 9000), health),
        safe('sites', () => requestJson<QueenbeeSite[]>(`${BEEKEEPER}/sites`), health),
        protectedRead('db', () => requestJson<unknown>(`${BEEKEEPER}/db`, 7000)),
        protectedRead('traffic', () => requestJson<TrafficMetrics>(`${BEEKEEPER}/traffic/metrics`, 7000)),
        protectedRead('vulnerabilities', () => requestJson<VulnerabilityReport>(`${BEEKEEPER}/vulnerabilities`, 7000)),
        protectedRead('docker', () => requestJson<DockerOverview>(`${BEEKEEPER}/docker`, 7000)),
        protectedRead('logs', () => requestJson<DockerLogs>(`${BEEKEEPER}/docker/logs?limit=12`, 7000)),
        protectedRead('traffic-domains', () => requestJson<{ domains?: string[] }>(`${BEEKEEPER}/traffic/domains`, 7000)),
        protectedRead('traffic-records', () => requestJson<TrafficRecords>(`${BEEKEEPER}/traffic/records?limit=13&page=1`, 7000)),
        protectedRead('monitoring-notifications', () => requestJson<MonitoringNotification[]>(`${BEEKEEPER}/monitoring/notifications`, 7000)),
        protectedRead('monitoring-tags', () => requestJson<MonitoringTag[]>(`${BEEKEEPER}/monitoring/tags`, 7000)),
        protectedRead('backups', () => requestJson<BackupItem[]>(`${BEEKEEPER}/backup`, 9000)),
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
        wiki: {
            health: wikiHealth,
            meta: wikiMeta,
            pages: Array.isArray(wikiPages?.pages) ? wikiPages.pages : [],
            spaces: Array.isArray(wikiSpaces?.spaces) ? wikiSpaces.spaces : [],
            tree: Array.isArray(wikiTree) ? wikiTree : [],
            assets: Array.isArray(wikiAssets?.assets) ? wikiAssets.assets : [],
            templates: Array.isArray(wikiTemplates?.templates) ? wikiTemplates.templates : [],
            comments: Array.isArray(wikiComments?.comments) ? wikiComments.comments : [],
            versions: Array.isArray(wikiVersions?.versions) ? wikiVersions.versions : [],
            accessReview: wikiAccessReview,
            audit: wikiAudit,
        },
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
    return filename ? `https://cdn.login.no/img/events/${filename}` : ''
}

export function albumImageUrl(albumId: number | string, filename?: string) {
    return filename ? `https://cdn.login.no/albums/${albumId}/${filename}` : ''
}
