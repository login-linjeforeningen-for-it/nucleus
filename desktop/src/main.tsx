import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot, Root } from 'react-dom/client'
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Bell,
    BookOpen,
    BriefcaseBusiness,
    CalendarClock,
    CalendarDays,
    CheckCircle2,
    Crown,
    Database,
    ExternalLink,
    Eye,
    EyeOff,
    FileText,
    Globe2,
    Grid2X2,
    Handshake,
    Image,
    Images,
    Loader2,
    Logs,
    KeyRound,
    MapPin,
    Megaphone,
    Menu as MenuIcon,
    MessageSquare,
    Monitor,
    Moon,
    Music2,
    Pencil,
    Pin,
    Plus,
    RefreshCcw,
    Scale,
    Search,
    Send,
    SendHorizontal,
    Server,
    Settings,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Sun,
    Trash2,
    Upload,
    UsersRound,
    X,
} from 'lucide-react'
import {
    AlbumItem,
    AnnouncementItem,
    AppNotification,
    DashboardData,
    EventItem,
    JobItem,
    NamedItem,
    RecentAddition,
    RuleItem,
    QueenbeeService,
    ScheduledNotification,
    ServiceStatus,
    WikiAuditAsset,
    WikiAccessReview,
    WikiPageComment,
    WikiPageLink,
    WikiPageItem,
    WikiPageVersion,
    WikiRecentVersion,
    WikiSearchResult,
    WikiSpace,
    WikiTemplate,
    WikiTreeItem,
    albumImageUrl,
    eventImageUrl,
    hasQueenbeeAuthSource,
    loadDashboardData,
    queenbeeRequest,
    queenbeeWebRequest,
    wikiActionRequest,
    wikiRequest,
} from './lib/api'
import { AutoUpdateState, DESKTOP_APP_VERSION, fetchAppUpdateManifest, hasNewerDesktopVersion } from './lib/appUpdate'
import type { BrowserTarget } from './lib/inAppBrowser'
import { openInAppBrowser } from './lib/inAppBrowser'
import './styles.css'
import enText from '../../public/text/en.json'
import aboutText from '../../public/text/menu/about/en.json'

type PageKey = 'dashboard' | 'events' | 'wiki' | 'announcements' | 'albums' | 'albumImages' | 'jobs' | 'organizations' | 'locations' | 'rules' | 'alerts' | 'honey' | 'partners' | 'about' | 'verv' | 'policy' | 'fund' | 'games' | 'pwned' | 'music' | 'status' | 'nucleusAdmin' | 'nucleusDocs' | 'internal' | 'loadbalancing' | 'databases' | 'dbRestore' | 'monitoring' | 'services' | 'serviceDetail' | 'traffic' | 'trafficRecords' | 'trafficMap' | 'backups' | 'vulnerabilities' | 'logs' | 'ai' | 'settings'
type ThemePreference = 'light' | 'dark'
type MenuMode = 'main' | 'queenbee'
type WikiCrawlAudit = {
    generatedAt: string
    pages: WikiPageItem[]
    assets: WikiAuditAsset[]
    byStatus: Record<string, number>
    bySpace: Record<string, number>
    byVisibility: Record<string, number>
    missingSummary: WikiPageItem[]
    missingContent: WikiPageItem[]
    missingTags: WikiPageItem[]
    draftOrArchived: WikiPageItem[]
    restrictedPages: WikiPageItem[]
    roleGatedPages: WikiPageItem[]
    accessMismatches: WikiPageItem[]
    unusedAssets: WikiAuditAsset[]
    assetsMissingAlt: WikiAuditAsset[]
    largeAssets: WikiAuditAsset[]
}
type WikiEndpointSmokeResult = {
    label: string
    path: string
    status: 'live' | 'locked' | 'error'
    durationMs: number
    detail: string
}

type NavItem = { key: PageKey; label: string; icon: React.ComponentType<{ size?: number }> }
type CommandAction = {
    id: string
    label: string
    detail: string
    icon: React.ComponentType<{ size?: number }>
    run: () => void
}
type EditableRow = Record<string, unknown> & { id: number | string }
type FieldType = 'text' | 'textarea' | 'number' | 'datetime' | 'json' | 'boolean'
type EditorField = { name: string; label: string; type?: FieldType; required?: boolean; placeholder?: string }
type EditorConfig<T extends EditableRow> = {
    title: string
    statusKey: string
    service: QueenbeeService
    createPath: string
    updatePath: (id: number | string) => string
    deletePath: (id: number | string) => string
    deleteBody?: (id: number | string) => Record<string, unknown> | undefined
    rows: (data: DashboardData) => T[]
    fields: EditorField[]
    titleOf: (row: T) => string
    metaOf: (row: T) => string
    queenbeePath: string
}

const links = [
    { label: 'login.no', url: 'https://login.no' },
    { label: 'Queenbee', url: 'https://queenbee.login.no' },
    { label: 'Nucleus', url: 'https://login.no/app' },
    { label: 'Status', url: 'https://login.no/status' },
]

const WIKI_WEB = import.meta.env.VITE_WIKI_WEB ?? 'http://127.0.0.1:3000'
const DASHBOARD_CACHE_KEY = 'login-desktop.dashboard-cache'
const DASHBOARD_REFRESH_MS = 1000 * 60
const SIDEBAR_KEY = 'login-desktop.sidebar'
const PINNED_MENU_KEY = 'login-desktop.menu-pinned'
const HIDDEN_MENU_KEY = 'login-desktop.menu-hidden'
const COMPACT_WIDTH = 900
const defaultPinnedPages: PageKey[] = ['dashboard', 'events', 'settings']

const mainMenu: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: Grid2X2 },
    { key: 'events', label: 'Events', icon: CalendarDays },
    { key: 'wiki', label: 'Wiki', icon: BookOpen },
    { key: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
    { key: 'partners', label: 'For Companies', icon: Handshake },
    { key: 'about', label: 'About Login', icon: UsersRound },
    { key: 'verv', label: 'Verv', icon: Handshake },
    { key: 'policy', label: 'Privacy Policy', icon: ShieldCheck },
    { key: 'fund', label: 'Login Fund', icon: Scale },
    { key: 'games', label: 'Games', icon: Sparkles },
    { key: 'pwned', label: 'Pwned', icon: ShieldAlert },
    { key: 'music', label: 'Music', icon: Music2 },
    { key: 'status', label: 'Status', icon: Monitor },
    { key: 'settings', label: 'Settings', icon: Settings },
]

const queenbeeMenu: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: Grid2X2 },
    { key: 'events', label: 'Events', icon: CalendarDays },
    { key: 'announcements', label: 'Announcements', icon: Megaphone },
    { key: 'albums', label: 'Albums', icon: Image },
    { key: 'albumImages', label: 'Album Images', icon: Images },
    { key: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
    { key: 'organizations', label: 'Organizations', icon: UsersRound },
    { key: 'locations', label: 'Locations', icon: MapPin },
    { key: 'rules', label: 'Rules', icon: FileText },
    { key: 'alerts', label: 'Alerts', icon: AlertCircle },
    { key: 'honey', label: 'Honey', icon: Sparkles },
    { key: 'wiki', label: 'Wiki Audit', icon: BookOpen },
    { key: 'nucleusAdmin', label: 'Nucleus', icon: Bell },
    { key: 'nucleusDocs', label: 'Nucleus Docs', icon: FileText },
    { key: 'internal', label: 'Internal', icon: ShieldCheck },
    { key: 'loadbalancing', label: 'Load Balancing', icon: Scale },
    { key: 'databases', label: 'Databases', icon: Database },
    { key: 'dbRestore', label: 'DB Restore', icon: Database },
    { key: 'monitoring', label: 'Monitoring', icon: Monitor },
    { key: 'services', label: 'Services', icon: Server },
    { key: 'serviceDetail', label: 'Service Detail', icon: Server },
    { key: 'traffic', label: 'Traffic', icon: Activity },
    { key: 'trafficRecords', label: 'Traffic Records', icon: Logs },
    { key: 'trafficMap', label: 'Traffic Map', icon: Globe2 },
    { key: 'backups', label: 'Backups', icon: Database },
    { key: 'vulnerabilities', label: 'Vulnerabilities', icon: ShieldAlert },
    { key: 'logs', label: 'Logs', icon: Logs },
    { key: 'ai', label: 'AI', icon: Sparkles },
    { key: 'settings', label: 'Settings', icon: Settings },
]

const allPages = Array.from(new Map([...mainMenu, ...queenbeeMenu].map((item) => [item.key, item])).values())

const themeOptions: Array<{ key: ThemePreference; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
]

const editorConfigs = {
    events: {
        title: 'Events',
        statusKey: 'events',
        service: 'workerbee',
        createPath: 'events',
        updatePath: (id) => `events/${id}`,
        deletePath: (id) => `events/${id}`,
        rows: (data) => data.events as EditableRow[],
        fields: [
            { name: 'name_no', label: 'Name NO', required: true },
            { name: 'name_en', label: 'Name EN', required: true },
            { name: 'informational_no', label: 'Informational NO' },
            { name: 'informational_en', label: 'Informational EN' },
            { name: 'description_no', label: 'Description NO', type: 'textarea', required: true },
            { name: 'description_en', label: 'Description EN', type: 'textarea', required: true },
            { name: 'time_type', label: 'Time type', required: true, placeholder: 'default, no_end, whole_day, tbd' },
            { name: 'time_start', label: 'Start time', type: 'datetime', required: true },
            { name: 'time_end', label: 'End time', type: 'datetime', required: true },
            { name: 'time_publish', label: 'Publish time', type: 'datetime', required: true },
            { name: 'time_signup_release', label: 'Signup release', type: 'datetime' },
            { name: 'time_signup_deadline', label: 'Signup deadline', type: 'datetime' },
            { name: 'category_id', label: 'Category ID', type: 'number', required: true },
            { name: 'location_id', label: 'Location ID', type: 'number' },
            { name: 'organization_id', label: 'Organization ID', type: 'number' },
            { name: 'rule_id', label: 'Rule ID', type: 'number' },
            { name: 'audience_id', label: 'Audience ID', type: 'number' },
            { name: 'parent_id', label: 'Parent event ID', type: 'number' },
            { name: 'capacity', label: 'Capacity', type: 'number' },
            { name: 'image_small', label: 'Small image' },
            { name: 'image_banner', label: 'Banner image' },
            { name: 'link_signup', label: 'Signup URL' },
            { name: 'link_facebook', label: 'Facebook URL' },
            { name: 'link_discord', label: 'Discord URL' },
            { name: 'link_stream', label: 'Stream URL' },
            { name: 'repeat_type', label: 'Repeat type', placeholder: 'weekly or biweekly (create only)' },
            { name: 'repeat_until', label: 'Repeat until', type: 'datetime' },
            { name: 'visible', label: 'Visible', type: 'boolean' },
            { name: 'highlight', label: 'Highlight', type: 'boolean' },
            { name: 'digital', label: 'Digital', type: 'boolean' },
            { name: 'canceled', label: 'Canceled', type: 'boolean' },
            { name: 'is_full', label: 'Is full', type: 'boolean' },
        ],
        titleOf: (row) => stringValue(row.name_en) || stringValue(row.name_no) || `Event #${row.id}`,
        metaOf: (row) => formatDate(stringValue(row.time_start) || stringValue(row.updated_at)),
        queenbeePath: '/events',
    },
    announcements: {
        title: 'Announcements',
        statusKey: 'announcements',
        service: 'bot',
        createPath: 'announcements',
        updatePath: () => 'announcements',
        deletePath: () => 'announcements',
        deleteBody: (id) => ({ id }),
        rows: (data) => data.announcements as EditableRow[],
        fields: [
            { name: 'title', label: 'Title array or text', type: 'json', required: true, placeholder: '["Norwegian title", "English title"]' },
            { name: 'description', label: 'Description array or text', type: 'json', required: true },
            { name: 'channel', label: 'Channel', required: true },
            { name: 'roles', label: 'Roles', type: 'json', placeholder: '["tekkom"]' },
            { name: 'color', label: 'Embed color' },
            { name: 'interval', label: 'Interval' },
            { name: 'time', label: 'Publish time', type: 'datetime' },
            { name: 'active', label: 'Active', type: 'boolean' },
        ],
        titleOf: (row) => stringValue(row.title) || `Announcement #${row.id}`,
        metaOf: (row) => stringValue(row.channel) || formatDate(stringValue(row.updated_at)),
        queenbeePath: '/announcements',
    },
    albums: {
        title: 'Albums',
        statusKey: 'albums',
        service: 'workerbee',
        createPath: 'albums',
        updatePath: (id) => `albums/${id}`,
        deletePath: (id) => `albums/${id}`,
        rows: (data) => data.albums as EditableRow[],
        fields: [
            { name: 'name_no', label: 'Name NO', required: true },
            { name: 'name_en', label: 'Name EN', required: true },
            { name: 'description_no', label: 'Description NO', type: 'textarea', required: true },
            { name: 'description_en', label: 'Description EN', type: 'textarea', required: true },
            { name: 'year', label: 'Year', type: 'number' },
            { name: 'event_id', label: 'Event ID', type: 'number' },
        ],
        titleOf: (row) => displayName(row as NamedItem),
        metaOf: (row) => formatDate(stringValue(row.updated_at) || stringValue(row.created_at)),
        queenbeePath: '/albums',
    },
    jobs: {
        title: 'Jobs',
        statusKey: 'jobs',
        service: 'workerbee',
        createPath: 'jobs',
        updatePath: (id) => `jobs/${id}`,
        deletePath: (id) => `jobs/${id}`,
        rows: (data) => data.jobs as EditableRow[],
        fields: [
            { name: 'title_no', label: 'Title NO', required: true },
            { name: 'title_en', label: 'Title EN', required: true },
            { name: 'position_title_no', label: 'Position title NO', required: true },
            { name: 'position_title_en', label: 'Position title EN', required: true },
            { name: 'description_short_no', label: 'Short description NO', type: 'textarea', required: true },
            { name: 'description_short_en', label: 'Short description EN', type: 'textarea', required: true },
            { name: 'description_long_no', label: 'Long description NO', type: 'textarea', required: true },
            { name: 'description_long_en', label: 'Long description EN', type: 'textarea', required: true },
            { name: 'organization_id', label: 'Organization ID', type: 'number', required: true },
            { name: 'job_type_id', label: 'Job type ID', type: 'number', required: true },
            { name: 'time_publish', label: 'Publish time', type: 'datetime', required: true },
            { name: 'time_expire', label: 'Expire time', type: 'datetime', required: true },
            { name: 'application_url', label: 'Application URL' },
            { name: 'banner_image', label: 'Banner image' },
            { name: 'highlight', label: 'Highlight', type: 'boolean' },
            { name: 'visible', label: 'Visible', type: 'boolean' },
        ],
        titleOf: (row) => jobTitle(row as JobItem),
        metaOf: (row) => jobMeta(row as JobItem),
        queenbeePath: '/jobs',
    },
    organizations: {
        title: 'Organizations',
        statusKey: 'organizations',
        service: 'workerbee',
        createPath: 'organizations',
        updatePath: (id) => `organizations/${id}`,
        deletePath: (id) => `organizations/${id}`,
        rows: (data) => data.organizations as EditableRow[],
        fields: [
            { name: 'name_no', label: 'Name NO', required: true },
            { name: 'name_en', label: 'Name EN', required: true },
            { name: 'description_no', label: 'Description NO', type: 'textarea', required: true },
            { name: 'description_en', label: 'Description EN', type: 'textarea', required: true },
            { name: 'logo', label: 'Logo' },
            { name: 'link_homepage', label: 'Homepage', required: true },
            { name: 'link_facebook', label: 'Facebook' },
            { name: 'link_instagram', label: 'Instagram' },
            { name: 'link_linkedin', label: 'LinkedIn' },
        ],
        titleOf: (row) => displayName(row as NamedItem),
        metaOf: (row) => stringValue(row.link_homepage) || formatDate(stringValue(row.updated_at)),
        queenbeePath: '/organizations',
    },
    locations: {
        title: 'Locations',
        statusKey: 'locations',
        service: 'workerbee',
        createPath: 'locations',
        updatePath: (id) => `locations/${id}`,
        deletePath: (id) => `locations/${id}`,
        rows: (data) => data.locations as EditableRow[],
        fields: [
            { name: 'name_no', label: 'Name NO', required: true },
            { name: 'name_en', label: 'Name EN', required: true },
            { name: 'type', label: 'Type', required: true },
            { name: 'address_street', label: 'Street' },
            { name: 'address_postcode', label: 'Postcode', type: 'number' },
            { name: 'city_name', label: 'City' },
            { name: 'coordinate_lat', label: 'Latitude', type: 'number' },
            { name: 'coordinate_lon', label: 'Longitude', type: 'number' },
            { name: 'mazemap_campus_id', label: 'Mazemap campus', type: 'number' },
            { name: 'mazemap_poi_id', label: 'Mazemap POI', type: 'number' },
            { name: 'url', label: 'URL' },
        ],
        titleOf: (row) => displayName(row as NamedItem),
        metaOf: (row) => stringValue(row.city) || stringValue(row.address) || formatDate(stringValue(row.updated_at)),
        queenbeePath: '/locations',
    },
    rules: {
        title: 'Rules',
        statusKey: 'rules',
        service: 'workerbee',
        createPath: 'rules',
        updatePath: (id) => `rules/${id}`,
        deletePath: (id) => `rules/${id}`,
        rows: (data) => data.rules as EditableRow[],
        fields: [
            { name: 'name_no', label: 'Name NO', required: true },
            { name: 'name_en', label: 'Name EN', required: true },
            { name: 'description_no', label: 'Description NO', type: 'textarea', required: true },
            { name: 'description_en', label: 'Description EN', type: 'textarea', required: true },
        ],
        titleOf: (row) => stringValue(row.name_en) || stringValue(row.name_no) || `Rule #${row.id}`,
        metaOf: (row) => stripMarkdown(stringValue(row.description_en) || stringValue(row.description_no)).slice(0, 80),
        queenbeePath: '/rules',
    },
    alerts: {
        title: 'Alerts',
        statusKey: 'alerts',
        service: 'workerbee',
        createPath: 'alerts',
        updatePath: (id) => `alerts/${id}`,
        deletePath: (id) => `alerts/${id}`,
        rows: (data) => data.alerts as EditableRow[],
        fields: [
            { name: 'title_no', label: 'Title NO', required: true },
            { name: 'title_en', label: 'Title EN', required: true },
            { name: 'description_no', label: 'Description NO', type: 'textarea', required: true },
            { name: 'description_en', label: 'Description EN', type: 'textarea', required: true },
            { name: 'service', label: 'Service', required: true },
            { name: 'page', label: 'Page', required: true },
        ],
        titleOf: (row) => stringValue(row.title_en) || stringValue(row.title_no) || `Alert #${row.id}`,
        metaOf: (row) => `${stringValue(row.service) || 'service'} / ${stringValue(row.page) || 'page'}`,
        queenbeePath: '/internal/alerts',
    },
    honey: {
        title: 'Honey',
        statusKey: 'honey',
        service: 'workerbee',
        createPath: 'honeys',
        updatePath: (id) => `honeys/${id}`,
        deletePath: (id) => `honeys/${id}`,
        rows: (data) => data.honey as EditableRow[],
        fields: [
            { name: 'service', label: 'Service', required: true },
            { name: 'page', label: 'Page', required: true },
            { name: 'language', label: 'Language', required: true },
            { name: 'text', label: 'Text JSON', type: 'json', required: true },
        ],
        titleOf: (row) => `${stringValue(row.service) || 'service'} / ${stringValue(row.page) || 'page'}`,
        metaOf: (row) => stringValue(row.language) || 'language',
        queenbeePath: '/honey',
    },
} satisfies Record<string, EditorConfig<EditableRow>>

function readThemePreference(): ThemePreference {
    const stored = window.localStorage.getItem('login-desktop.theme')
    if (stored === 'light' || stored === 'dark') return stored
    return 'dark'
}

function readInitialPage(): PageKey {
    const page = new URLSearchParams(window.location.search).get('page')
    return allPages.some((item) => item.key === page) ? page as PageKey : 'dashboard'
}

function readSidebarCompact() {
    return window.localStorage.getItem(SIDEBAR_KEY) === 'compact'
}

function readPageList(storageKey: string, defaults: PageKey[] = []) {
    try {
        const raw = window.localStorage.getItem(storageKey)
        if (!raw) return defaults
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return defaults
        return parsed.filter((page): page is PageKey => allPages.some((item) => item.key === page))
    } catch {
        return defaults
    }
}

function writePageList(storageKey: string, pages: PageKey[]) {
    window.localStorage.setItem(storageKey, JSON.stringify(pages))
}

function readCachedDashboard() {
    try {
        const raw = window.localStorage.getItem(DASHBOARD_CACHE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Partial<DashboardData>
        return parsed?.wiki
            && parsed?.health
            && Array.isArray(parsed.wiki.spaces)
            && Array.isArray(parsed.wiki.templates)
            && Array.isArray(parsed.wiki.comments)
            && Array.isArray(parsed.wiki.versions)
            && 'accessReview' in parsed.wiki
            ? parsed as DashboardData
            : null
    } catch {
        return null
    }
}

function cacheDashboard(data: DashboardData) {
    try {
        window.localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data))
    } catch {
        // Local cache is an enhancement; failures should never block live data.
    }
}

function App() {
    const [activePage, setActivePage] = useState<PageKey>(() => readInitialPage())
    const [menuMode, setMenuMode] = useState<MenuMode>(() => queenbeeMenu.some((item) => item.key === readInitialPage()) && !mainMenu.some((item) => item.key === readInitialPage()) ? 'queenbee' : 'main')
    const [sidebarCompact, setSidebarCompact] = useState(() => window.innerWidth < COMPACT_WIDTH || readSidebarCompact())
    const [queenbeeLoggedIn, setQueenbeeLoggedIn] = useState(() => hasQueenbeeAuthSource())
    const [pinnedPages, setPinnedPages] = useState<PageKey[]>(() => readPageList(PINNED_MENU_KEY, defaultPinnedPages))
    const [hiddenPages, setHiddenPages] = useState<PageKey[]>(() => readPageList(HIDDEN_MENU_KEY))
    const [showHiddenPages, setShowHiddenPages] = useState(false)
    const [themePreference, setThemePreference] = useState<ThemePreference>(() => readThemePreference())
    const [data, setData] = useState<DashboardData | null>(() => readCachedDashboard())
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [navQuery, setNavQuery] = useState('')
    const [commandOpen, setCommandOpen] = useState(false)
    const [commandQuery, setCommandQuery] = useState('')
    const [browserTarget, setBrowserTarget] = useState<BrowserTarget | null>(null)
    const [queenbeeUnlockOpen, setQueenbeeUnlockOpen] = useState(false)
    const contentRef = useRef<HTMLElement | null>(null)
    const navSearchRef = useRef<HTMLInputElement | null>(null)
    const [updateState, setUpdateState] = useState<AutoUpdateState>({
        status: 'checking',
        message: 'Checking app-api for signed desktop updates...',
        manifest: null,
    })

    async function refreshDashboard() {
        setRefreshing(true)
        try {
            const next = await loadDashboardData()
            setData(next)
            cacheDashboard(next)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load Login data')
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        window.localStorage.removeItem('login-desktop.queenbee-token')
        window.localStorage.removeItem('login-desktop.app-api-token')
        window.loginOpenInAppBrowser = setBrowserTarget
        window.loginOpenQueenbeeUnlock = () => setQueenbeeUnlockOpen(true)
        return () => {
            delete window.loginOpenInAppBrowser
            delete window.loginOpenQueenbeeUnlock
        }
    }, [])

    useEffect(() => {
        void refreshDashboard()
        const timer = window.setInterval(() => void refreshDashboard(), DASHBOARD_REFRESH_MS)
        return () => window.clearInterval(timer)
    }, [])

    useEffect(() => {
        window.localStorage.setItem('login-desktop.theme', themePreference)
    }, [themePreference])

    useEffect(() => {
        function onResize() {
            const small = window.innerWidth < COMPACT_WIDTH
            setSidebarCompact(small ? true : readSidebarCompact())
        }

        onResize()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    useEffect(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0
        const url = new URL(window.location.href)
        if (activePage === 'dashboard') url.searchParams.delete('page')
        else url.searchParams.set('page', activePage)
        window.history.replaceState(null, '', url)
    }, [activePage])

    useEffect(() => {
        let active = true

        async function runAutoUpdate() {
            try {
                const manifest = await fetchAppUpdateManifest()
                if (!active) return

                setUpdateState(!manifest || !hasNewerDesktopVersion(manifest)
                    ? { status: 'current', message: `Login Desktop ${DESKTOP_APP_VERSION} is current.`, manifest }
                    : { status: 'available', message: `Version ${manifest.version} is published. The signed native updater will install it and restart the app.`, manifest })
            } catch (err) {
                if (!active) return
                setUpdateState({
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Unable to update Login Desktop.',
                    manifest: null,
                })
            }
        }

        runAutoUpdate()
        const timer = window.setInterval(runAutoUpdate, 1000 * 60 * 60 * 6)
        return () => {
            active = false
            window.clearInterval(timer)
        }
    }, [])

    const activeLabel = allPages.find((item) => item.key === activePage)?.label || 'Dashboard'
    const activeMenu = menuMode === 'queenbee' ? visibleQueenbeeMenu(queenbeeLoggedIn) : mainMenu
    const visiblePages = Array.from(new Map([...mainMenu, ...visibleQueenbeeMenu(queenbeeLoggedIn)].map((item) => [item.key, item])).values())
    const normalizedNavQuery = navQuery.trim().toLowerCase()
    const sortedMenu = sortMenuItems(activeMenu, pinnedPages)
    const visibleMenu = showHiddenPages ? sortedMenu : sortedMenu.filter((item) => !hiddenPages.includes(item.key))
    const filteredMenu = normalizedNavQuery
        ? visibleMenu.filter((item) => `${item.label} ${item.key}`.toLowerCase().includes(normalizedNavQuery))
        : visibleMenu
    const hiddenCount = activeMenu.filter((item) => hiddenPages.includes(item.key)).length
    const commands = useMemo<CommandAction[]>(() => [
        ...visiblePages.map((item) => ({
            id: `page-${item.key}`,
            label: `Open ${item.label}`,
            detail: pageMeta(item.key, data).description,
            icon: item.icon,
            run: () => setActivePage(item.key),
        })),
        {
            id: 'refresh',
            label: refreshing ? 'Refreshing Login data' : 'Refresh Login data',
            detail: 'Reload Workerbee, Beekeeper, Queenbee, and Bot dashboard data.',
            icon: RefreshCcw,
            run: () => void refreshDashboard(),
        },
        ...links.map((link) => ({
            id: `link-${link.url}`,
            label: `Open ${link.label}`,
            detail: link.url,
            icon: ExternalLink,
            run: () => void openInAppBrowser({ url: link.url, title: link.label }),
        })),
    ], [data, refreshing, visiblePages])

    function switchMenu(nextMode: MenuMode) {
        if (nextMode === 'queenbee' && !queenbeeLoggedIn) {
            setQueenbeeUnlockOpen(true)
            return
        }

        setMenuMode(nextMode)
        const nextMenu = nextMode === 'queenbee' ? visibleQueenbeeMenu(queenbeeLoggedIn) : mainMenu
        if (!nextMenu.some((item) => item.key === activePage)) {
            setActivePage(nextMode === 'queenbee' ? 'internal' : 'dashboard')
        }
    }

    function toggleSidebar() {
        setSidebarCompact((current) => {
            const next = !current
            if (window.innerWidth >= COMPACT_WIDTH) {
                window.localStorage.setItem(SIDEBAR_KEY, next ? 'compact' : 'expanded')
            }
            return next
        })
    }

    function togglePinnedPage(page: PageKey) {
        setPinnedPages((current) => {
            const next = current.includes(page)
                ? current.filter((item) => item !== page)
                : [page, ...current]
            writePageList(PINNED_MENU_KEY, next)
            return next
        })
    }

    function toggleHiddenPage(page: PageKey) {
        setHiddenPages((current) => {
            const next = current.includes(page)
                ? current.filter((item) => item !== page)
                : [page, ...current]
            writePageList(HIDDEN_MENU_KEY, next)
            return next
        })
    }

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null
            const isTyping = target ? ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable : false
            const key = event.key.toLowerCase()

            if ((event.metaKey || event.ctrlKey) && key === 'k') {
                event.preventDefault()
                setCommandOpen(true)
                setCommandQuery('')
                return
            }

            if ((event.metaKey || event.ctrlKey) && key === 'r') {
                event.preventDefault()
                void refreshDashboard()
                return
            }

            if (!isTyping && event.key === '/') {
                event.preventDefault()
                navSearchRef.current?.focus()
                return
            }

            if (event.key === 'Escape') {
                if (commandOpen) {
                    setCommandOpen(false)
                    return
                }
                if (browserTarget) {
                    setBrowserTarget(null)
                }
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [browserTarget, commandOpen])

    return (
        <main className="app-shell" data-theme={themePreference} data-sidebar={sidebarCompact ? 'compact' : 'expanded'}>
            <aside className="sidebar">
                <div className="brand-lockup">
                    <LoginMark small />
                    <span>Login Desktop</span>
                    <button
                        type="button"
                        className="sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label={sidebarCompact ? 'Expand sidebar' : 'Compact sidebar'}
                        title={sidebarCompact ? 'Expand sidebar' : 'Compact sidebar'}
                    >
                        {sidebarCompact ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                    </button>
                </div>
                <label className="nav-search">
                    <Search size={15} />
                    <input
                        ref={navSearchRef}
                        value={navQuery}
                        onChange={(event) => setNavQuery(event.target.value)}
                        placeholder="Filter surfaces"
                        aria-label="Filter Login surfaces"
                    />
                    <kbd>/</kbd>
                </label>
                <button className="command-trigger" type="button" onClick={() => setCommandOpen(true)}>
                    <Search size={15} />
                    <span>Command center</span>
                    <kbd>Cmd K</kbd>
                </button>
                <div className="menu-mode-switch" role="tablist" aria-label="Sidebar menu mode">
                    <button
                        type="button"
                        className={menuMode === 'main' ? 'active' : ''}
                        onClick={() => switchMenu('main')}
                        aria-label="Show regular Login menu"
                        aria-selected={menuMode === 'main'}
                        role="tab"
                    >
                        <MenuIcon size={18} />
                        <span>Login</span>
                    </button>
                    <button
                        type="button"
                        className={menuMode === 'queenbee' ? 'active queen' : 'queen'}
                        onClick={() => switchMenu('queenbee')}
                        aria-label="Show Queenbee menu"
                        aria-selected={menuMode === 'queenbee'}
                        role="tab"
                    >
                        <Crown size={22} />
                        <span>Queenbee</span>
                    </button>
                </div>
                <nav className="nav-list" aria-label="Login surfaces">
                    {filteredMenu.map(({ key, label, icon: Icon }) => (
                        <div
                            key={key}
                            className={[
                                'nav-row',
                                activePage === key ? 'active' : '',
                                pinnedPages.includes(key) ? 'pinned' : '',
                                hiddenPages.includes(key) ? 'hidden' : '',
                            ].filter(Boolean).join(' ')}
                        >
                            <button type="button" className="nav-item" onClick={() => setActivePage(key)}>
                                <span className="pin-line">{pinnedPages.includes(key) ? <Pin size={9} /> : null}</span>
                                <Icon size={22} />
                                <span>{label}</span>
                            </button>
                            <div className="nav-actions">
                                <button
                                    type="button"
                                    className={pinnedPages.includes(key) ? 'active' : ''}
                                    onClick={() => togglePinnedPage(key)}
                                    aria-label={pinnedPages.includes(key) ? `Unpin ${label}` : `Pin ${label}`}
                                    title={pinnedPages.includes(key) ? `Unpin ${label}` : `Pin ${label}`}
                                >
                                    <Pin size={14} fill={pinnedPages.includes(key) ? 'currentColor' : 'transparent'} />
                                </button>
                                <button
                                    type="button"
                                    className={hiddenPages.includes(key) ? 'active hidden-action' : ''}
                                    onClick={() => toggleHiddenPage(key)}
                                    aria-label={hiddenPages.includes(key) ? `Show ${label}` : `Hide ${label}`}
                                    title={hiddenPages.includes(key) ? `Show ${label}` : `Hide ${label}`}
                                >
                                    {hiddenPages.includes(key) ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                            </div>
                        </div>
                    ))}
                    {!filteredMenu.length ? <p className="nav-empty">No Login surface matches "{navQuery}".</p> : null}
                </nav>
                <button
                    type="button"
                    className={showHiddenPages ? 'hidden-toggle active' : 'hidden-toggle'}
                    onClick={() => setShowHiddenPages((current) => !current)}
                    disabled={!hiddenCount}
                    title={hiddenCount ? (showHiddenPages ? 'Hide hidden menu items' : 'Show hidden menu items') : 'No hidden menu items'}
                >
                    {showHiddenPages ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span>{hiddenCount ? `${hiddenCount} hidden` : 'No hidden items'}</span>
                </button>
                <div className="sidebar-footer">
                    <span className="version">v{DESKTOP_APP_VERSION}</span>
                    <span className="muted">{activeLabel}</span>
                </div>
            </aside>

            <section className="content" ref={contentRef}>
                {activePage === 'dashboard'
                    ? <Hero data={data} refreshing={refreshing} onRefresh={refreshDashboard} />
                    : <PageHero page={activePage} data={data} refreshing={refreshing} onRefresh={refreshDashboard} />}
                {error ? <div className="error-card">{error}</div> : null}
                {activePage === 'settings'
                    ? <SettingsPage themePreference={themePreference} onThemePreferenceChange={setThemePreference} updateState={updateState} />
                    : !data ? <LoadingState /> : <PageRouter page={activePage} data={data} queenbeeLoggedIn={queenbeeLoggedIn} />}
            </section>
            <InAppBrowser target={browserTarget} onClose={() => setBrowserTarget(null)} />
            <QueenbeeUnlockModal
                open={queenbeeUnlockOpen}
                onClose={() => setQueenbeeUnlockOpen(false)}
            />
            <CommandPalette
                open={commandOpen}
                query={commandQuery}
                commands={commands}
                onQueryChange={setCommandQuery}
                onClose={() => setCommandOpen(false)}
            />
        </main>
    )
}

function visibleQueenbeeMenu(queenbeeLoggedIn: boolean) {
    return queenbeeLoggedIn ? queenbeeMenu : queenbeeMenu.filter((item) => item.key !== 'announcements')
}

function sortMenuItems(items: NavItem[], pinnedPages: PageKey[]) {
    return [...items].sort((first, second) => {
        const firstPinnedIndex = pinnedPages.indexOf(first.key)
        const secondPinnedIndex = pinnedPages.indexOf(second.key)
        const firstPinned = firstPinnedIndex !== -1
        const secondPinned = secondPinnedIndex !== -1

        if (firstPinned || secondPinned) {
            return (firstPinned ? firstPinnedIndex : pinnedPages.length)
                - (secondPinned ? secondPinnedIndex : pinnedPages.length)
        }

        return items.indexOf(first) - items.indexOf(second)
    })
}

function CommandPalette({
    open,
    query,
    commands,
    onQueryChange,
    onClose,
}: {
    open: boolean
    query: string
    commands: CommandAction[]
    onQueryChange: (query: string) => void
    onClose: () => void
}) {
    const normalized = query.trim().toLowerCase()
    const filteredCommands = normalized
        ? commands.filter((command) => `${command.label} ${command.detail}`.toLowerCase().includes(normalized)).slice(0, 10)
        : commands.slice(0, 10)

    if (!open) return null

    function runCommand(command: CommandAction) {
        command.run()
        onClose()
    }

    return (
        <div className="command-backdrop" role="presentation" onMouseDown={onClose}>
            <section className="command-panel" role="dialog" aria-modal="true" aria-label="Login command center" onMouseDown={(event) => event.stopPropagation()}>
                <div className="command-search">
                    <Search size={18} />
                    <input
                        autoFocus
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Jump to pages, refresh data, or open Login surfaces"
                    />
                    <kbd>Esc</kbd>
                </div>
                <div className="command-list">
                    {filteredCommands.map((command) => {
                        const Icon = command.icon
                        return (
                            <button key={command.id} type="button" className="command-item" onClick={() => runCommand(command)}>
                                <span className="command-icon"><Icon size={18} /></span>
                                <span>
                                    <strong>{command.label}</strong>
                                    <small>{command.detail}</small>
                                </span>
                            </button>
                        )
                    })}
                    {!filteredCommands.length ? <div className="command-empty">No command found. Try “logs”, “traffic”, “refresh”, or “Queenbee”.</div> : null}
                </div>
            </section>
        </div>
    )
}

function InAppBrowser({ target, onClose }: { target: BrowserTarget | null; onClose: () => void }) {
    const frameRef = useRef<HTMLIFrameElement | null>(null)
    const [loadKey, setLoadKey] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!target) return
        setLoading(true)
        setLoadKey((current) => current + 1)
    }, [target])

    if (!target) return null

    function navigate(direction: 'back' | 'forward') {
        try {
            if (direction === 'back') frameRef.current?.contentWindow?.history.back()
            else frameRef.current?.contentWindow?.history.forward()
        } catch {
            // Cross-origin history can be blocked; the embedded browser remains usable.
        }
    }

    return (
        <section className="browser-shell" aria-label="Login in-app browser">
            <div className="browser-toolbar">
                <div className="browser-controls">
                    <button onClick={() => navigate('back')} aria-label="Go back"><ArrowLeft size={17} /></button>
                    <button onClick={() => navigate('forward')} aria-label="Go forward"><ArrowRight size={17} /></button>
                    <button onClick={() => setLoadKey((current) => current + 1)} aria-label="Reload"><RefreshCcw size={17} /></button>
                </div>
                <div className="browser-address">
                    <Globe2 size={16} />
                    <div>
                        <strong>{target.title || 'Login Browser'}</strong>
                        <span>{target.url}</span>
                    </div>
                </div>
                <button className="browser-close" onClick={onClose} aria-label="Close browser"><X size={18} /></button>
            </div>
            <div className="browser-frame-wrap">
                {loading ? <div className="browser-loading"><Loader2 className="spin" /><span>Loading inside Login Desktop...</span></div> : null}
                <iframe
                    key={`${target.url}-${loadKey}`}
                    ref={frameRef}
                    src={target.url}
                    title={target.title || 'Login Browser'}
                    className="browser-frame"
                    onLoad={() => setLoading(false)}
                />
            </div>
        </section>
    )
}

function QueenbeeUnlockModal({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const [message, setMessage] = useState('Queenbee expects a Login/Authentik session cookie. Desktop can open the login flow, but native write actions still need the session bridge before they can unlock.')

    useEffect(() => {
        if (open) {
            setMessage('Queenbee expects a Login/Authentik session cookie. Desktop can open the login flow, but native write actions still need the session bridge before they can unlock.')
        }
    }, [open])

    if (!open) return null

    function openLogin() {
        openInAppBrowser({ url: 'https://queenbee.login.no/api/auth/login', title: 'Queenbee Login' })
        setMessage('Complete Queenbee login in the in-app window. For protected edits, use the Queenbee window until the Desktop session bridge is wired.')
    }

    return (
        <div className="command-backdrop" role="presentation" onMouseDown={onClose}>
            <section className="unlock-panel" role="dialog" aria-modal="true" aria-label="Unlock Queenbee" onMouseDown={(event) => event.stopPropagation()}>
                <div className="unlock-head">
                    <span><Crown size={24} /></span>
                    <div>
                        <p className="eyebrow">Protected Login operations</p>
                        <h2>Login to Queenbee</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close Queenbee login"><X size={18} /></button>
                </div>
                <p className="unlock-copy">
                    Queenbee uses Login/Authentik and checks the Queenbee role from its session cookie. Desktop no longer asks you to paste write or push access tokens.
                </p>
                <div className="unlock-actions">
                    <button type="button" onClick={openLogin}><KeyRound size={15} />Login with Queenbee</button>
                </div>
                <p className="unlock-message">{message}</p>
            </section>
        </div>
    )
}

function PageRouter({ page, data, queenbeeLoggedIn }: { page: PageKey; data: DashboardData; queenbeeLoggedIn: boolean }) {
    switch (page) {
        case 'events': return <EventsPage data={data} />
        case 'wiki': return <WikiPage data={data} />
        case 'announcements': return <AnnouncementsPage data={data} queenbeeLoggedIn={queenbeeLoggedIn} />
        case 'albums': return <AlbumsPage data={data} />
        case 'albumImages': return <AlbumImagesPage data={data} />
        case 'jobs': return <JobsPage data={data} />
        case 'organizations': return <OrganizationsPage data={data} />
        case 'locations': return <LocationsPage data={data} />
        case 'rules': return <RulesPage data={data} />
        case 'alerts': return <AlertsPage data={data} />
        case 'honey': return <HoneyPage data={data} />
        case 'partners': return <PartnersPage data={data} />
        case 'about': return <AboutPage />
        case 'verv': return <VervPage />
        case 'policy': return <PolicyPage />
        case 'fund': return <FundPage data={data} />
        case 'games': return <GamesPage data={data} />
        case 'pwned': return <PwnedPage />
        case 'music': return <MusicPage data={data} />
        case 'status': return <StatusPage data={data} />
        case 'nucleusAdmin': return <NucleusAdminPage data={data} queenbeeLoggedIn={queenbeeLoggedIn} />
        case 'nucleusDocs': return <NucleusDocsPage />
        case 'internal': return <InternalPage data={data} />
        case 'loadbalancing': return <LoadBalancingPage data={data} />
        case 'databases': return <DatabasesPage data={data} />
        case 'dbRestore': return <DbRestorePage />
        case 'monitoring': return <MonitoringPage data={data} />
        case 'services': return <ServicesPage data={data} />
        case 'serviceDetail': return <ServiceDetailPage data={data} />
        case 'traffic': return <TrafficPage data={data} />
        case 'trafficRecords': return <TrafficRecordsPage data={data} />
        case 'trafficMap': return <TrafficMapPage data={data} />
        case 'backups': return <BackupsPage data={data} />
        case 'vulnerabilities': return <VulnerabilitiesPage data={data} />
        case 'logs': return <LogsPage data={data} />
        case 'ai': return <AiPage data={data} />
        default: return <Dashboard data={data} queenbeeLoggedIn={queenbeeLoggedIn} />
    }
}

function Hero({
    data,
    refreshing,
    onRefresh,
}: {
    data: DashboardData | null
    refreshing: boolean
    onRefresh: () => void
}) {
    return (
        <header className="hero-card">
            <div className="hero-mark"><LoginMark /></div>
            <div className="hero-copy">
                <p className="eyebrow">Launcher for Login services</p>
                <h1>Velkommen til <span>login.no</span></h1>
                <p>Live desktop dashboard for Login content, Queenbee operations, service status, and quick-launch access across the ecosystem.</p>
                <div className="launcher-row">
                    {links.map((link) => (
                        <button key={link.url} className="launcher-button" onClick={() => openInAppBrowser(link.url)}>
                            {link.label}<ExternalLink size={16} />
                        </button>
                    ))}
                </div>
            </div>
            <div className="sync-card">
                <span className="sync-dot" />
                <span>{data ? `Synced ${formatTime(data.fetchedAt)}` : 'Connecting to Login APIs'}</span>
                <button onClick={onRefresh} disabled={refreshing} aria-label="Refresh dashboard">
                    <RefreshCcw size={13} className={refreshing ? 'spin' : ''} />
                </button>
            </div>
        </header>
    )
}

function PageHero({
    page,
    data,
    refreshing,
    onRefresh,
}: {
    page: PageKey
    data: DashboardData | null
    refreshing: boolean
    onRefresh: () => void
}) {
    const meta = pageMeta(page, data)
    const Icon = meta.icon
    return (
        <header className="page-hero">
            <div className="page-icon"><Icon size={30} /></div>
            <div>
                <p className="eyebrow">{meta.kicker}</p>
                <h1>{meta.title}</h1>
                <p>{meta.description}</p>
            </div>
            <div className="sync-card compact-sync">
                <span className="sync-dot" />
                <span>{data ? `Synced ${formatTime(data.fetchedAt)}` : 'Connecting'}</span>
                <button onClick={onRefresh} disabled={refreshing} aria-label="Refresh dashboard">
                    <RefreshCcw size={13} className={refreshing ? 'spin' : ''} />
                </button>
            </div>
        </header>
    )
}

function pageMeta(page: PageKey, data: DashboardData | null) {
    const count = (value: number | null | undefined) => {
        if (!data) return 'loading'
        return typeof value === 'number' ? value : 'locked'
    }
    const map = {
        dashboard: { title: 'Dashboard', kicker: 'Overview', description: 'The complete Login desktop command center.', icon: Grid2X2 },
        events: { title: 'Events', kicker: `${data?.events.length ?? 0} loaded`, description: `${count(data?.counts.events)} public events from Workerbee.`, icon: CalendarDays },
        wiki: { title: 'Wiki Audit', kicker: data?.wiki?.audit ? `${data.wiki.audit.pages.total} pages` : data?.health['wiki-health'] === 'live' ? 'Connected' : 'Local API', description: 'Audit Login Wiki pages, spaces, assets, broken links, migration state, and review queues from the new wiki repository.', icon: BookOpen },
        announcements: { title: 'Announcements', kicker: `${data?.announcements.length ?? 0} loaded`, description: `${count(data?.counts.announcements)} Discord announcements from TekKom Bot.`, icon: Megaphone },
        albums: { title: 'Albums', kicker: `${data?.albums.length ?? 0} loaded`, description: `${count(data?.counts.albums)} albums from Workerbee.`, icon: Image },
        albumImages: { title: 'Album Images', kicker: 'Dynamic', description: 'Queenbee album image upload, cover, delete, and compression workflow.', icon: Images },
        jobs: { title: 'Jobs', kicker: `${data?.jobs.length ?? 0} loaded`, description: `${count(data?.counts.jobs)} career posts from Workerbee.`, icon: BriefcaseBusiness },
        organizations: { title: 'Organizations', kicker: `${data?.organizations.length ?? 0} loaded`, description: `${count(data?.counts.organizations)} organizations from Workerbee.`, icon: UsersRound },
        locations: { title: 'Locations', kicker: `${data?.locations.length ?? 0} loaded`, description: `${count(data?.counts.locations)} locations from Workerbee.`, icon: MapPin },
        rules: { title: 'Rules', kicker: `${data?.rules.length ?? 0} loaded`, description: `${count(data?.counts.rules)} public event and committee rule sets from Workerbee.`, icon: FileText },
        alerts: { title: 'Alerts', kicker: `${data?.alerts.length ?? 0} loaded`, description: 'Queenbee alert banners and page-level notices from Workerbee.', icon: AlertCircle },
        honey: { title: 'Honey', kicker: `${data?.honey.length ?? 0} loaded`, description: 'Structured Login/Queenbee text content from the Workerbee honey store.', icon: Sparkles },
        partners: { title: 'For Companies', kicker: data?.companiesText ? 'Beehive text' : 'Loading', description: 'Company presentation and sponsor information from login.no.', icon: Handshake },
        about: { title: 'About Login', kicker: 'Student association', description: 'Native overview of Login, committees, programmes, and public documents.', icon: UsersRound },
        verv: { title: 'Verv', kicker: 'Committees', description: 'Native committee and application overview inspired by Nucleus mobile.', icon: Handshake },
        policy: { title: 'Privacy Policy', kicker: 'Public document', description: 'The Login app privacy policy, readable without opening the mobile app.', icon: ShieldCheck },
        fund: { title: 'Login Fund', kicker: data?.fund.holdings ? formatCurrency(data.fund.holdings.totalBase) : 'Public', description: 'Native fund holdings, history, support guidance, and board shortcuts.', icon: Scale },
        games: { title: 'Games', kicker: `${data?.games.length ?? 0} decks`, description: 'Native overview of Login party games and community decks from App API.', icon: Sparkles },
        pwned: { title: 'Pwned', kicker: 'Lock screen', description: 'The classic Login reminder to lock your screen, now inside desktop too.', icon: ShieldAlert },
        music: { title: 'Music', kicker: data?.music ? `${formatNumber(data.music.stats.total_songs)} plays` : 'TekKom Bot', description: 'Live public listening stats from login.no/music.', icon: Music2 },
        status: { title: 'Status', kicker: `${data?.statusServices.length ?? 0} monitored`, description: 'Live Beekeeper monitoring data.', icon: Monitor },
        nucleusAdmin: { title: 'Nucleus', kicker: 'Notifications', description: 'Queenbee notification scheduling, resend, history, and Nucleus documentation shortcuts.', icon: Bell },
        nucleusDocs: { title: 'Nucleus Docs', kicker: 'Documentation', description: 'Push notification topics, interval syntax, language prefixes, and examples.', icon: FileText },
        internal: { title: 'Internal', kicker: 'Queenbee', description: 'Internal Beekeeper dashboard and endpoint health.', icon: ShieldCheck },
        loadbalancing: { title: 'Load Balancing', kicker: `${data?.queenbee.sites.length ?? 0} sites`, description: 'Queenbee load-balancer site overview from Beekeeper.', icon: Scale },
        databases: { title: 'Databases', kicker: data?.health.db === 'live' ? 'Live' : 'Protected', description: 'Queenbee database overview and lock status.', icon: Database },
        dbRestore: { title: 'DB Restore', kicker: 'Protected', description: 'Browse backup files and restore database snapshots.', icon: Database },
        monitoring: { title: 'Monitoring', kicker: `${data?.statusServices.length ?? 0} services`, description: 'Queenbee monitoring services and alert routing.', icon: Monitor },
        services: { title: 'Services', kicker: data?.health.docker === 'live' ? `${data.queenbee.docker?.count || 0} containers` : 'Protected', description: 'Queenbee Docker services, deploy controls, and container status.', icon: Server },
        serviceDetail: { title: 'Service Detail', kicker: data?.health.docker === 'live' ? 'Containers' : 'Protected', description: 'Focused Queenbee container detail with deploy, restart, and delete actions.', icon: Server },
        traffic: { title: 'Traffic', kicker: data?.health.traffic === 'live' ? `${formatNumber(data.queenbee.traffic?.total_requests)} requests` : 'Protected', description: 'Queenbee traffic metrics from Beekeeper.', icon: Activity },
        trafficRecords: { title: 'Traffic Records', kicker: 'Protected', description: 'Raw Queenbee traffic records and map analytics.', icon: Logs },
        trafficMap: { title: 'Traffic Map', kicker: data?.health['traffic-records'] === 'live' ? `${formatNumber(data.queenbee.trafficRecords?.result?.length)} records` : 'Protected', description: 'Country and domain traffic rollups from Queenbee request records.', icon: Globe2 },
        backups: { title: 'Backups', kicker: 'Protected', description: 'Queenbee backup overview, file browser, and restore shortcuts.', icon: Database },
        vulnerabilities: { title: 'Vulnerabilities', kicker: data?.health.vulnerabilities === 'live' ? `${data.queenbee.vulnerabilities?.imageCount || 0} images` : 'Protected', description: 'Queenbee Docker vulnerability scan summary.', icon: ShieldAlert },
        logs: { title: 'Logs', kicker: data?.health.logs === 'live' ? 'Live' : 'Protected', description: 'Queenbee Docker log stream status.', icon: Logs },
        ai: { title: 'AI', kicker: 'Queenbee', description: 'Internal AI dashboard shortcut and protected API readiness.', icon: Sparkles },
        settings: { title: 'Settings', kicker: 'Desktop', description: 'Configure the local Login desktop app.', icon: Settings },
    }
    return map[page]
}

function AutoUpdatePanel({ state }: { state: AutoUpdateState }) {
    const Icon = state.status === 'available' || state.status === 'current' ? CheckCircle2 : state.status === 'error' ? AlertCircle : RefreshCcw
    const manifest = state.manifest
    const firstPlatform = manifest?.platforms ? Object.keys(manifest.platforms)[0] : null
    const source = firstPlatform && manifest?.platforms?.[firstPlatform]?.url ? new URL(manifest.platforms[firstPlatform].url).pathname : '/api/app'

    return (
        <section className={`update-panel ${state.status}`} aria-label="Automatic desktop update">
            <div className="update-head">
                <span className="update-icon"><Icon size={17} className={state.status === 'checking' ? 'spin' : ''} /></span>
                <div><p>Auto update</p><strong>{updateTitle(state.status)}</strong></div>
            </div>
            <p className="update-message">{state.message}</p>
            <div className="update-metrics">
                <span><b>Installed</b>{DESKTOP_APP_VERSION}</span>
                <span><b>Latest</b>{manifest?.version ?? 'Checking'}</span>
                <span><b>Source</b>{source}</span>
                <span><b>Mode</b>Signed restart</span>
            </div>
        </section>
    )
}

function updateTitle(status: AutoUpdateState['status']) {
    if (status === 'checking') return 'Checking'
    if (status === 'available') return 'Update published'
    if (status === 'current') return 'Up to date'
    return 'Needs attention'
}

function LoadingState() {
    return <div className="loading-card"><Loader2 className="spin" /><span>Loading live Login dashboard data...</span></div>
}

function Dashboard({ data, queenbeeLoggedIn }: { data: DashboardData; queenbeeLoggedIn: boolean }) {
    return (
        <div className="dashboard-grid">
            <EndpointStrip data={data} queenbeeLoggedIn={queenbeeLoggedIn} />
            <section className="metric-strip full-span">
                <Metric icon={<CalendarDays />} label="Events" value={data.counts.events} status={data.health.events} />
                <Metric icon={<BookOpen />} label="Wiki Pages" value={formatNumber(data.wiki.audit?.pages.total ?? data.wiki.pages.length)} status={combinedStatus(data.health, ['wiki-health', 'wiki-pages', 'wiki-tree'])} />
                <Metric icon={<BriefcaseBusiness />} label="Jobs" value={data.counts.jobs} status={data.health.jobs} />
                {queenbeeLoggedIn || data.health.announcements === 'live'
                    ? <Metric icon={<Megaphone />} label="Announcements" value={data.counts.announcements ?? 'Locked'} status={data.health.announcements} />
                    : null}
                <Metric icon={<UsersRound />} label="Organizations" value={data.counts.organizations} status={data.health.organizations} />
                <Metric icon={<MapPin />} label="Locations" value={data.counts.locations} status={data.health.locations} />
                <Metric icon={<Image />} label="Albums" value={data.counts.albums} status={data.health.albums} />
                <Metric icon={<FileText />} label="Rules" value={data.counts.rules} status={data.health.rules} />
                <Metric icon={<Music2 />} label="Songs" value={formatNumber(data.music?.stats.total_songs)} status={data.health.music} />
            </section>
            <section className="panel recent-panel"><PanelTitle title="Recent Additions" subtitle="Live /stats/new-additions" /><RecentList additions={data.additions} status={data.health['recent-additions']} /></section>
            <section className="panel chart-panel"><PanelTitle title="Event Categories" subtitle="Live /stats/categories" /><CategoryChart data={data.categories} status={data.health.categories} /></section>
            <section className="panel events-panel"><PanelTitle title="Upcoming Events" subtitle="Live /events" /><EventList events={data.events.slice(0, 6)} status={data.health.events} /></section>
            <section className="panel status-panel"><PanelTitle title="Service Status" subtitle="Live /monitoring" /><StatusList services={data.statusServices.slice(0, 6)} status={data.health.status} /></section>
            <section className="panel"><PanelTitle title="Wiki Audit" subtitle="Live /admin/audit" /><WikiSummary data={data} /></section>
            <section className="panel"><PanelTitle title="For Companies" subtitle="Live /text/beehive/companies" /><CompaniesSummary data={data} /></section>
            <section className="panel"><PanelTitle title="Login Music" subtitle="Live /activity" /><MusicSummary data={data} /></section>
            <section className="panel full-span"><PanelTitle title="Queenbee Operations" subtitle="Beekeeper internal surfaces" /><QueenbeeOpsSummary data={data} /></section>
            <section className="panel full-span"><PanelTitle title="More Login Content" subtitle="Live Workerbee collections" /><ContentCollections data={data} queenbeeLoggedIn={queenbeeLoggedIn} /></section>
        </div>
    )
}

function EndpointStrip({ data, queenbeeLoggedIn = hasQueenbeeAuthSource() }: { data: DashboardData; queenbeeLoggedIn?: boolean }) {
    return (
        <section className="source-strip full-span">
            <EndpointPill label="Workerbee" status={combinedStatus(data.health, ['events', 'jobs', 'organizations', 'locations', 'albums', 'categories', 'recent-additions'])} />
            <EndpointPill label="Beekeeper" status={combinedStatus(data.health, ['status', 'internal'])} />
            <EndpointPill label="Queenbee Ops" status={combinedStatus(data.health, ['sites', 'db', 'traffic', 'vulnerabilities', 'logs'])} onUnlock={openQueenbeeUnlock} />
            {queenbeeLoggedIn || data.health.announcements === 'live'
                ? <EndpointPill label="Bot announcements" status={data.health.announcements || 'error'} onUnlock={openQueenbeeUnlock} />
                : null}
        </section>
    )
}

function EventsPage({ data }: { data: DashboardData }) {
    const [query, setQuery] = useState('')
    const [historical, setHistorical] = useState(false)
    const [orderBy, setOrderBy] = useState('id')
    const [sort, setSort] = useState<'asc' | 'desc'>('asc')
    const [page, setPage] = useState(1)
    const [protectedRows, setProtectedRows] = useState<EventItem[] | null>(null)
    const [total, setTotal] = useState(data.counts.events)
    const [message, setMessage] = useState('Public events loaded. Authenticate with Queenbee to query protected/historical rows.')
    const [loading, setLoading] = useState(false)
    const pageSize = 14
    const rows = protectedRows || data.events
    const eventData = { ...data, events: rows, counts: { ...data.counts, events: total || rows.length } }

    async function loadProtectedEvents(event?: React.FormEvent) {
        event?.preventDefault()
        setLoading(true)
        const offset = Math.max(0, page - 1) * pageSize
        const params = new URLSearchParams({
            limit: String(pageSize),
            offset: String(offset),
            order_by: orderBy,
            sort,
        })
        if (query) params.set('search', query)
        if (historical) params.set('historical', 'true')
        try {
            const result = await queenbeeRequest<{ events?: EventItem[]; total_count?: number }>({ service: 'workerbee', path: `events/protected?${params.toString()}`, method: 'GET', timeoutMs: 15000 })
            const nextRows = Array.isArray(result.events) ? result.events : []
            setProtectedRows(nextRows)
            setTotal(typeof result.total_count === 'number' ? result.total_count : nextRows.length)
            setMessage(`Loaded ${nextRows.length} protected event rows from offset ${offset}${historical ? ' including historical events' : ''}.`)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to load protected events.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="stacked-page">
            <section className="panel compact-panel">
                <PanelTitle title="Event Browser" subtitle="Matches Queenbee search, historical, sort, and page controls" />
                <form className="event-browser-controls" onSubmit={loadProtectedEvents}>
                    <label className="editor-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" /></label>
                    <label className="editor-field"><span>Order by</span><select value={orderBy} onChange={(event) => setOrderBy(event.target.value)}><option value="id">id</option><option value="name_no">name_no</option><option value="name_en">name_en</option><option value="time_start">time_start</option><option value="updated_at">updated_at</option></select></label>
                    <label className="editor-field"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as 'asc' | 'desc')}><option value="asc">asc</option><option value="desc">desc</option></select></label>
                    <label className="editor-field"><span>Page</span><input type="number" min="1" value={page} onChange={(event) => setPage(Math.max(1, Number(event.target.value) || 1))} /></label>
                    <label className="editor-check event-browser-check"><span>Historical</span><input type="checkbox" checked={historical} onChange={(event) => setHistorical(event.target.checked)} /></label>
                    <button type="submit" disabled={!hasQueenbeeAuthSource() || loading}>{loading ? 'Loading...' : 'Load protected'}</button>
                </form>
                <p className="editor-message">{message}</p>
            </section>
            <EditorPage data={eventData} config={editorConfigs.events} preview={<EventList events={rows} status={data.health.events} />} />
        </div>
    )
}

function WikiPage({ data }: { data: DashboardData }) {
    const audit = data.wiki.audit
    const [query, setQuery] = useState('')
    const [searching, setSearching] = useState(false)
    const [searchMessage, setSearchMessage] = useState('Search the full wiki index without leaving Desktop.')
    const [results, setResults] = useState<WikiSearchResult[]>([])
    const [selectedPage, setSelectedPage] = useState<WikiPageItem | null>(null)
    const [selectedVersion, setSelectedVersion] = useState<WikiPageVersion | null>(null)
    const [versions, setVersions] = useState<WikiPageVersion[]>([])
    const [links, setLinks] = useState<WikiPageLink[]>([])
    const [backlinks, setBacklinks] = useState<WikiPageLink[]>([])
    const [comments, setComments] = useState<WikiPageComment[]>([])
    const [pageAssets, setPageAssets] = useState<WikiAuditAsset[]>([])
    const [detailMessage, setDetailMessage] = useState('Select any page or audit issue to inspect its full audit context.')
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [browserSpace, setBrowserSpace] = useState('all')
    const [browserStatus, setBrowserStatus] = useState('published')
    const [browserQuery, setBrowserQuery] = useState('')
    const [browserPages, setBrowserPages] = useState<WikiPageItem[]>(data.wiki.pages)
    const [browserCursor, setBrowserCursor] = useState<string | null>(null)
    const [browserMessage, setBrowserMessage] = useState(`${data.wiki.pages.length} recently updated pages loaded.`)
    const [loadingBrowser, setLoadingBrowser] = useState(false)
    const [assetType, setAssetType] = useState('all')
    const [assetQuery, setAssetQuery] = useState('')
    const [assetUnusedOnly, setAssetUnusedOnly] = useState(false)
    const [assetRows, setAssetRows] = useState<WikiAuditAsset[]>(data.wiki.assets)
    const [assetCursor, setAssetCursor] = useState<string | null>(null)
    const [assetMessage, setAssetMessage] = useState(`${data.wiki.assets.length} recent assets loaded.`)
    const [loadingAssets, setLoadingAssets] = useState(false)
    const [searchRefreshMessage, setSearchRefreshMessage] = useState('Search index status comes from /search results and /meta.')
    const [refreshingSearch, setRefreshingSearch] = useState(false)
    const [crawlAudit, setCrawlAudit] = useState<WikiCrawlAudit | null>(null)
    const [crawlMessage, setCrawlMessage] = useState('Run a crawl to audit every page and asset currently exposed by the wiki API.')
    const [crawlingWiki, setCrawlingWiki] = useState(false)
    const [crawlReportText, setCrawlReportText] = useState('')
    const [crawlReportMessage, setCrawlReportMessage] = useState('')
    const [endpointSmokeResults, setEndpointSmokeResults] = useState<WikiEndpointSmokeResult[]>([])
    const [endpointSmokeMessage, setEndpointSmokeMessage] = useState('Run a smoke check to verify the advertised wiki read endpoints against live sample data.')
    const [smokingEndpoints, setSmokingEndpoints] = useState(false)
    const apiStatus = combinedStatus(data.health, ['wiki-health', 'wiki-meta', 'wiki-pages', 'wiki-spaces', 'wiki-tree'])
    const auditStatus = data.health['wiki-audit'] || 'error'
    const pageTotal = audit?.pages.total ?? data.wiki.pages.length
    const visibleTreePages = data.wiki.tree.reduce((sum, space) => sum + space.pageCount, 0)
    const spaces = data.wiki.spaces.length ? data.wiki.spaces : data.wiki.tree

    async function runSearch(event: React.FormEvent) {
        event.preventDefault()
        const term = query.trim()
        if (!term) {
            setResults([])
            setSearchMessage('Type a search term to query the wiki index.')
            return
        }

        setSearching(true)
        setSearchMessage(`Searching "${term}"...`)
        try {
            const response = await wikiRequest<{ results?: WikiSearchResult[]; durationMs?: number; total?: number; indexSize?: number; indexRefreshedAt?: string }>(`search?q=${encodeURIComponent(term)}&limit=20`, 9000)
            const rows = Array.isArray(response.results) ? response.results : []
            setResults(rows)
            setSearchMessage(`Found ${rows.length}${typeof response.total === 'number' ? ` of ${response.total}` : ''} result${rows.length === 1 ? '' : 's'}${typeof response.durationMs === 'number' ? ` in ${Math.round(response.durationMs)}ms` : ''}. Index ${response.indexSize ?? 'unknown'} docs${response.indexRefreshedAt ? `, refreshed ${formatDate(response.indexRefreshedAt)}` : ''}.`)
        } catch (error) {
            setSearchMessage(error instanceof Error ? error.message : 'Wiki search failed.')
        } finally {
            setSearching(false)
        }
    }

    async function inspectPage(page: Pick<WikiPageItem, 'id' | 'space_slug' | 'slug' | 'title'>) {
        setLoadingDetail(true)
        setDetailMessage(`Loading audit context for ${page.title}...`)
        try {
            const [detail, versionPayload, linksPayload, backlinksPayload, commentsPayload, assetsPayload] = await Promise.all([
                wikiRequest<{ page?: WikiPageItem }>(`pages/${encodeURIComponent(page.id)}`, 9000),
                wikiRequest<{ versions?: WikiPageVersion[] }>(`pages/${encodeURIComponent(page.id)}/versions?limit=10`, 9000),
                wikiRequest<{ links?: WikiPageLink[] }>(`pages/${encodeURIComponent(page.id)}/links`, 9000),
                wikiRequest<{ backlinks?: WikiPageLink[] }>(`pages/${encodeURIComponent(page.id)}/backlinks`, 9000),
                wikiRequest<{ comments?: WikiPageComment[] }>(`pages/${encodeURIComponent(page.id)}/comments?limit=20&includeResolved=true`, 9000),
                wikiRequest<{ assets?: WikiAuditAsset[] }>(`assets?pageId=${encodeURIComponent(page.id)}&limit=20`, 9000),
            ])
            const nextPage = detail.page || page as WikiPageItem
            setSelectedPage(nextPage)
            setSelectedVersion(null)
            setVersions(Array.isArray(versionPayload.versions) ? versionPayload.versions : [])
            setLinks(Array.isArray(linksPayload.links) ? linksPayload.links : [])
            setBacklinks(Array.isArray(backlinksPayload.backlinks) ? backlinksPayload.backlinks : [])
            setComments(Array.isArray(commentsPayload.comments) ? commentsPayload.comments : [])
            setPageAssets(Array.isArray(assetsPayload.assets) ? assetsPayload.assets : [])
            setDetailMessage(`Loaded page, ${versionPayload.versions?.length || 0} versions, ${linksPayload.links?.length || 0} links, ${backlinksPayload.backlinks?.length || 0} backlinks, ${commentsPayload.comments?.length || 0} comments, and ${assetsPayload.assets?.length || 0} assets.`)
        } catch (error) {
            setDetailMessage(error instanceof Error ? error.message : 'Unable to load wiki page audit context.')
        } finally {
            setLoadingDetail(false)
        }
    }

    async function inspectVersion(versionId: string) {
        setLoadingDetail(true)
        setDetailMessage('Loading saved wiki version...')
        try {
            const payload = await wikiRequest<{ version?: WikiPageVersion }>(`versions/${encodeURIComponent(versionId)}`, 9000)
            if (!payload.version) throw new Error('Version detail was not returned.')
            if (selectedPage?.id !== payload.version.page_id) {
                await inspectPage({
                    id: payload.version.page_id,
                    title: payload.version.title,
                    space_slug: '',
                    slug: '',
                })
            }
            setSelectedVersion(payload.version)
            setDetailMessage(`Loaded saved version from ${formatDate(payload.version.created_at)} by ${payload.version.created_by || 'system'}.`)
        } catch (error) {
            setDetailMessage(error instanceof Error ? error.message : 'Unable to load wiki version detail.')
        } finally {
            setLoadingDetail(false)
        }
    }

    function inspectKnownVersion(version: WikiRecentVersion) {
        setSelectedPage({
            id: version.page_id,
            space_slug: version.space_slug || 'wiki',
            slug: version.page_slug || '',
            title: version.page_title || version.title,
            summary: version.summary || 'Saved page version.',
            content_markdown: '',
            status: 'version',
            updated_at: version.created_at,
            visibility: version.page_visibility,
            required_role: version.page_required_role,
        })
        setSelectedVersion(version)
        setVersions([version])
        setLinks([])
        setBacklinks([])
        setComments([])
        setPageAssets([])
        setDetailMessage(`Loaded saved version from ${formatDate(version.created_at)} by ${version.created_by || 'system'}.`)
    }

    async function loadPageBrowser(event?: React.FormEvent, append = false) {
        event?.preventDefault()
        setLoadingBrowser(true)
        try {
            const params = new URLSearchParams({ limit: '30', status: browserStatus })
            if (browserSpace !== 'all') params.set('space', browserSpace)
            if (browserQuery.trim()) params.set('q', browserQuery.trim())
            if (append && browserCursor) params.set('cursor', browserCursor)
            const response = await wikiRequest<{ pages?: WikiPageItem[]; nextCursor?: string | null }>(`pages?${params.toString()}`, 9000)
            const rows = Array.isArray(response.pages) ? response.pages : []
            setBrowserPages((current) => append ? [...current, ...rows] : rows)
            setBrowserCursor(response.nextCursor || null)
            setBrowserMessage(`${append ? browserPages.length + rows.length : rows.length} page${(append ? browserPages.length + rows.length : rows.length) === 1 ? '' : 's'} loaded${response.nextCursor ? '; more pages available.' : '.'}`)
        } catch (error) {
            setBrowserMessage(error instanceof Error ? error.message : 'Unable to load wiki pages.')
        } finally {
            setLoadingBrowser(false)
        }
    }

    async function loadAssetBrowser(event?: React.FormEvent, append = false) {
        event?.preventDefault()
        setLoadingAssets(true)
        try {
            const params = new URLSearchParams({ limit: '30' })
            if (assetType !== 'all') params.set('type', assetType)
            if (assetQuery.trim()) params.set('q', assetQuery.trim())
            if (assetUnusedOnly) params.set('unused', 'true')
            if (append && assetCursor) params.set('cursor', assetCursor)
            const response = await wikiRequest<{ assets?: WikiAuditAsset[]; nextCursor?: string | null }>(`assets?${params.toString()}`, 9000)
            const rows = Array.isArray(response.assets) ? response.assets : []
            setAssetRows((current) => append ? [...current, ...rows] : rows)
            setAssetCursor(response.nextCursor || null)
            const count = append ? assetRows.length + rows.length : rows.length
            setAssetMessage(`${count} asset${count === 1 ? '' : 's'} loaded${response.nextCursor ? '; more assets available.' : '.'}`)
        } catch (error) {
            setAssetMessage(error instanceof Error ? error.message : 'Unable to load wiki assets.')
        } finally {
            setLoadingAssets(false)
        }
    }

    async function refreshSearchIndex() {
        setRefreshingSearch(true)
        setSearchRefreshMessage('Refreshing wiki search index...')
        try {
            await wikiActionRequest<{ status?: string }>('search/refresh', { method: 'POST', timeoutMs: 12000 })
            setSearchRefreshMessage('Search index refreshed successfully.')
        } catch (error) {
            setSearchRefreshMessage(error instanceof Error ? error.message : 'Unable to refresh the wiki search index.')
        } finally {
            setRefreshingSearch(false)
        }
    }

    async function runFullWikiCrawl() {
        setCrawlingWiki(true)
        setCrawlMessage('Crawling all wiki pages and assets...')
        try {
            const pages: WikiPageItem[] = []
            const assets: WikiAuditAsset[] = []
            let pageCursor: string | null = null
            let assetCursor: string | null = null

            for (let index = 0; index < 60; index += 1) {
                const params = new URLSearchParams({ limit: '80', status: 'all' })
                if (pageCursor) params.set('cursor', pageCursor)
                const response = await wikiRequest<{ pages?: WikiPageItem[]; nextCursor?: string | null }>(`pages?${params.toString()}`, 12000)
                const rows = Array.isArray(response.pages) ? response.pages : []
                pages.push(...rows)
                pageCursor = response.nextCursor || null
                setCrawlMessage(`Crawled ${pages.length} pages...`)
                if (!pageCursor || rows.length === 0) break
            }

            for (let index = 0; index < 60; index += 1) {
                const params = new URLSearchParams({ limit: '80' })
                if (assetCursor) params.set('cursor', assetCursor)
                const response = await wikiRequest<{ assets?: WikiAuditAsset[]; nextCursor?: string | null }>(`assets?${params.toString()}`, 12000)
                const rows = Array.isArray(response.assets) ? response.assets : []
                assets.push(...rows)
                assetCursor = response.nextCursor || null
                setCrawlMessage(`Crawled ${pages.length} pages and ${assets.length} assets...`)
                if (!assetCursor || rows.length === 0) break
            }

            const byStatus = pages.reduce<Record<string, number>>((counts, page) => {
                counts[page.status] = (counts[page.status] || 0) + 1
                return counts
            }, {})
            const bySpace = pages.reduce<Record<string, number>>((counts, page) => {
                counts[page.space_slug] = (counts[page.space_slug] || 0) + 1
                return counts
            }, {})
            const byVisibility = pages.reduce<Record<string, number>>((counts, page) => {
                const key = page.visibility || 'unknown'
                counts[key] = (counts[key] || 0) + 1
                return counts
            }, {})
            const spaceBySlug = new Map(spaces.map((space) => [space.slug, space]))
            const nextAudit: WikiCrawlAudit = {
                generatedAt: new Date().toISOString(),
                pages,
                assets,
                byStatus,
                bySpace,
                byVisibility,
                missingSummary: pages.filter((page) => !page.summary?.trim()),
                missingContent: pages.filter((page) => !page.content_markdown?.trim()),
                missingTags: pages.filter((page) => !Array.isArray(page.tags) || page.tags.length === 0),
                draftOrArchived: pages.filter((page) => page.status !== 'published'),
                restrictedPages: pages.filter((page) => page.visibility === 'internal'),
                roleGatedPages: pages.filter((page) => Boolean(page.required_role?.trim())),
                accessMismatches: pages.filter((page) => {
                    const space = spaceBySlug.get(page.space_slug)
                    if (!space) return false
                    return page.visibility === 'public' && space.visibility === 'internal'
                }),
                unusedAssets: assets.filter((asset) => !asset.page_id),
                assetsMissingAlt: assets.filter((asset) => assetMime(asset).startsWith('image/') && !asset.alt_text?.trim()),
                largeAssets: assets.filter((asset) => assetSize(asset) >= 5 * 1024 * 1024),
            }
            setCrawlAudit(nextAudit)
            setCrawlReportText(buildWikiCrawlReport(nextAudit))
            setCrawlMessage(`Crawl complete: ${pages.length} pages, ${assets.length} assets, ${nextAudit.missingSummary.length + nextAudit.missingContent.length + nextAudit.assetsMissingAlt.length + nextAudit.unusedAssets.length} actionable cleanup items.`)
        } catch (error) {
            setCrawlMessage(error instanceof Error ? error.message : 'Unable to crawl the full wiki.')
        } finally {
            setCrawlingWiki(false)
        }
    }

    async function copyCrawlReport() {
        if (!crawlAudit) return
        try {
            const report = crawlReportText || buildWikiCrawlReport(crawlAudit)
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable; use the report preview below.')
            await navigator.clipboard.writeText(report)
            setCrawlReportMessage('Copied full wiki audit report to clipboard.')
        } catch (error) {
            setCrawlReportMessage(error instanceof Error ? error.message : 'Unable to copy audit report. Use the report preview below.')
        }
    }

    async function runEndpointSmoke() {
        setSmokingEndpoints(true)
        setEndpointSmokeMessage('Checking wiki endpoints...')
        const samplePage = selectedPage || browserPages[0] || data.wiki.pages[0]
        const checks: Array<{ label: string; path: string }> = [
            { label: 'health', path: 'health' },
            { label: 'meta', path: 'meta' },
            { label: 'spaces', path: 'spaces' },
            { label: 'pages', path: 'pages?limit=1&status=all' },
            { label: 'tree', path: 'tree?status=all' },
            { label: 'assets', path: 'assets?limit=1' },
            { label: 'search', path: 'search?q=login&limit=1' },
            { label: 'audit', path: 'admin/audit' },
            { label: 'access review', path: 'admin/access-review' },
            { label: 'templates', path: 'templates?limit=1' },
            { label: 'versions', path: 'versions?limit=1' },
        ]
        if (samplePage?.id) {
            checks.push(
                { label: 'page detail', path: `pages/${encodeURIComponent(samplePage.id)}` },
                { label: 'page versions', path: `pages/${encodeURIComponent(samplePage.id)}/versions?limit=1` },
                { label: 'page links', path: `pages/${encodeURIComponent(samplePage.id)}/links` },
                { label: 'page backlinks', path: `pages/${encodeURIComponent(samplePage.id)}/backlinks` },
                { label: 'page comments', path: `pages/${encodeURIComponent(samplePage.id)}/comments?limit=1&includeResolved=true` },
                { label: 'page assets', path: `assets?pageId=${encodeURIComponent(samplePage.id)}&limit=1` },
            )
        }

        const results: WikiEndpointSmokeResult[] = []
        for (const check of checks) {
            const started = performance.now()
            try {
                const payload = await wikiRequest<unknown>(check.path, 9000)
                results.push({
                    label: check.label,
                    path: check.path,
                    status: 'live',
                    durationMs: Math.round(performance.now() - started),
                    detail: summarizeWikiPayload(payload),
                })
            } catch (error) {
                const detail = error instanceof Error ? error.message : 'request failed'
                results.push({
                    label: check.label,
                    path: check.path,
                    status: detail.toLowerCase().includes('missing bearer') || detail.toLowerCase().includes('401') || detail.toLowerCase().includes('unauthorized') ? 'locked' : 'error',
                    durationMs: Math.round(performance.now() - started),
                    detail,
                })
            }
            setEndpointSmokeResults([...results])
        }
        const failing = results.filter((result) => result.status !== 'live')
        setEndpointSmokeMessage(failing.length ? `${failing.length} of ${results.length} wiki checks need attention.` : `${results.length} wiki endpoint checks passed.`)
        setSmokingEndpoints(false)
    }

    return (
        <div className="stacked-page wiki-audit-page">
            <section className="source-strip full-span">
                <EndpointPill label="Wiki API" status={apiStatus} />
                <EndpointPill label="Audit" status={auditStatus} />
                <EndpointPill label="Assets" status={data.health['wiki-assets'] || 'error'} />
                <EndpointPill label="Spaces" status={data.health['wiki-spaces'] || 'error'} />
                <button className="endpoint-pill interactive" type="button" onClick={() => openInAppBrowser(WIKI_WEB)}>
                    <i />Open Wiki <ExternalLink size={12} />
                </button>
            </section>

            <section className="metric-strip full-span">
                <Metric icon={<BookOpen />} label="Pages" value={formatNumber(pageTotal)} status={data.health['wiki-pages']} />
                <Metric icon={<Grid2X2 />} label="Spaces" value={formatNumber(audit?.spaces ?? data.wiki.tree.length)} status={data.health['wiki-tree']} />
                <Metric icon={<Upload />} label="Assets" value={formatNumber(audit?.assets.total ?? data.wiki.assets.length)} status={data.health['wiki-assets']} />
                <Metric icon={<AlertCircle />} label="Broken Links" value={formatNumber(audit?.links.brokenCount ?? 0)} status={auditStatus} />
                <Metric icon={<Pencil />} label="Review Queue" value={formatNumber(audit?.review.pageCount ?? 0)} status={auditStatus} />
                <Metric icon={<Database />} label="Legacy Sources" value={formatNumber(audit?.migration.legacySources ?? 0)} status={auditStatus} />
            </section>

            <section className="panel compact-panel">
                <PanelTitle title="Wiki Search" subtitle="Live /search" />
                <form className="event-browser-controls" onSubmit={runSearch}>
                    <label className="editor-field"><span>Query</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages, minutes, runbooks..." /></label>
                    <button type="submit" disabled={searching || data.health['wiki-health'] !== 'live'}>{searching ? 'Searching...' : 'Search wiki'}</button>
                    <button type="button" onClick={() => openInAppBrowser(`${WIKI_WEB}/?q=${encodeURIComponent(query.trim())}`)}>Open web search <ExternalLink size={14} /></button>
                </form>
                <p className="editor-message">{searchMessage}</p>
                {results.length ? <WikiSearchResults results={results} onInspect={inspectPage} /> : null}
            </section>

            <WikiPageInspector
                page={selectedPage}
                selectedVersion={selectedVersion}
                versions={versions}
                links={links}
                backlinks={backlinks}
                comments={comments}
                assets={pageAssets}
                message={detailMessage}
                loading={loadingDetail}
                onInspect={inspectPage}
                onInspectVersion={inspectVersion}
            />

            <section className="panel full-span wiki-browser-panel">
                <PanelTitle title="Full Page Browser" subtitle="Paginated /pages with space, status, and text filters" />
                <form className="event-browser-controls" onSubmit={(event) => void loadPageBrowser(event, false)}>
                    <label className="editor-field"><span>Space</span><select value={browserSpace} onChange={(event) => setBrowserSpace(event.target.value)}><option value="all">All spaces</option>{spaces.map((space) => <option key={space.slug} value={space.slug}>{space.name}</option>)}</select></label>
                    <label className="editor-field"><span>Status</span><select value={browserStatus} onChange={(event) => setBrowserStatus(event.target.value)}><option value="published">Published</option><option value="all">All statuses</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
                    <label className="editor-field"><span>Search</span><input value={browserQuery} onChange={(event) => setBrowserQuery(event.target.value)} placeholder="Filter by page text" /></label>
                    <button type="submit" disabled={loadingBrowser || data.health['wiki-pages'] !== 'live'}>{loadingBrowser ? 'Loading...' : 'Load pages'}</button>
                    <button type="button" disabled={loadingBrowser || !browserCursor} onClick={() => void loadPageBrowser(undefined, true)}>Load more</button>
                </form>
                <p className="editor-message">{browserMessage}</p>
                <WikiPageRows pages={browserPages} onInspect={inspectPage} />
            </section>

            <section className="panel full-span wiki-browser-panel">
                <PanelTitle title="Asset Inventory" subtitle="Paginated /assets with type, unused, and filename filters" />
                <form className="event-browser-controls" onSubmit={(event) => void loadAssetBrowser(event, false)}>
                    <label className="editor-field"><span>Type</span><select value={assetType} onChange={(event) => setAssetType(event.target.value)}><option value="all">All files</option><option value="images">Images</option><option value="pdfs">PDFs</option><option value="spreadsheets">Spreadsheets</option></select></label>
                    <label className="editor-field"><span>Filename</span><input value={assetQuery} onChange={(event) => setAssetQuery(event.target.value)} placeholder="Search asset names" /></label>
                    <label className="editor-field wiki-checkbox"><span>Unused only</span><input type="checkbox" checked={assetUnusedOnly} onChange={(event) => setAssetUnusedOnly(event.target.checked)} /></label>
                    <button type="submit" disabled={loadingAssets || data.health['wiki-assets'] !== 'live'}>{loadingAssets ? 'Loading...' : 'Load assets'}</button>
                    <button type="button" disabled={loadingAssets || !assetCursor} onClick={() => void loadAssetBrowser(undefined, true)}>Load more</button>
                </form>
                <p className="editor-message">{assetMessage}</p>
                <WikiAssetRows assets={assetRows} />
            </section>

            <section className="panel wiki-template-panel">
                <PanelTitle title="Templates" subtitle="Live /templates, used by the Wiki editor" />
                {data.health['wiki-templates'] !== 'live' ? <EmptyState icon={<FileText />} label={`Wiki templates endpoint is ${data.health['wiki-templates'] || 'unavailable'}.`} /> : null}
                {data.health['wiki-templates'] === 'live' ? <WikiTemplateRows templates={data.wiki.templates} /> : null}
            </section>

            <WikiCommentsPanel comments={data.wiki.comments} status={data.health['wiki-comments']} onInspect={inspectPage} />

            <WikiRecentVersionsPanel versions={data.wiki.versions} status={data.health['wiki-versions']} onInspectVersion={inspectKnownVersion} />

            <WikiAccessReviewPanel review={data.wiki.accessReview} status={data.health['wiki-access-review']} />

            <section className="panel">
                <PanelTitle title="Audit Readiness" subtitle="Can the full wiki be audited from Desktop?" />
                {audit ? (
                    <div className="wiki-readiness">
                        <HealthTag label="health" status={data.health['wiki-health'] || 'error'} />
                        <HealthTag label="spaces" status={data.health['wiki-spaces'] || 'error'} />
                        <HealthTag label="tree" status={data.health['wiki-tree'] || 'error'} />
                        <HealthTag label="comments" status={data.health['wiki-comments'] || 'error'} />
                        <HealthTag label="versions" status={data.health['wiki-versions'] || 'error'} />
                        <HealthTag label="templates" status={data.health['wiki-templates'] || 'error'} />
                        <HealthTag label="access" status={data.health['wiki-access-review'] || 'error'} />
                        <HealthTag label="audit" status={auditStatus} />
                        <p>{audit.pages.published} published, {audit.pages.drafts} drafts, {audit.pages.archived} archived. {visibleTreePages} visible in the published tree.</p>
                        <p>{audit.assets.unused} unused assets, {audit.assets.largeFiles} large files, {audit.migration.collisionCount} migration collisions.</p>
                        <p>Generated {formatDate(audit.generatedAt)}.</p>
                        <div className="editor-actions">
                            <button type="button" disabled={refreshingSearch} onClick={() => void refreshSearchIndex()}>{refreshingSearch ? 'Refreshing...' : 'Refresh search index'}</button>
                            <button type="button" disabled={crawlingWiki || data.health['wiki-pages'] !== 'live' || data.health['wiki-assets'] !== 'live'} onClick={() => void runFullWikiCrawl()}>{crawlingWiki ? 'Crawling...' : 'Run full crawl audit'}</button>
                        </div>
                        <p>{searchRefreshMessage}</p>
                        <p>{crawlMessage}</p>
                    </div>
                ) : (
                    <EmptyState icon={<AlertCircle />} label={`Wiki audit endpoint is ${auditStatus}. Start the wiki API or expose /admin/audit to make this complete.`} />
                )}
            </section>

            {crawlAudit ? <WikiCrawlSummary audit={crawlAudit} reportText={crawlReportText} message={crawlReportMessage} onCopyReport={copyCrawlReport} onInspect={inspectPage} /> : null}

            <section className="panel">
                <PanelTitle title="Spaces" subtitle="Live /spaces and /tree" />
                {data.health['wiki-tree'] !== 'live' ? <EmptyState icon={<BookOpen />} label={`Wiki tree endpoint is ${data.health['wiki-tree'] || 'unavailable'}.`} /> : null}
                <div className="wiki-space-list">
                    {spaces.map((space) => <WikiSpaceCard key={space.id} space={space} tree={data.wiki.tree.find((treeSpace) => treeSpace.slug === space.slug)} onInspect={inspectPage} />)}
                </div>
            </section>

            <WikiEndpointCoverage data={data} results={endpointSmokeResults} message={endpointSmokeMessage} loading={smokingEndpoints} onRunSmoke={runEndpointSmoke} />
            <WikiIssueList data={data} onInspect={inspectPage} />
        </div>
    )
}

function WikiSummary({ data }: { data: DashboardData }) {
    const audit = data.wiki.audit
    const status = data.health['wiki-audit'] || data.health['wiki-health']
    if (!audit) return <EmptyState icon={<BookOpen />} label={`Wiki audit endpoint is ${status || 'unavailable'}.`} />
    return (
        <div className="wiki-summary">
            <div><strong>{formatNumber(audit.pages.total)}</strong><span>pages</span></div>
            <div><strong>{formatNumber(audit.links.brokenCount)}</strong><span>broken links</span></div>
            <div><strong>{formatNumber(audit.review.pageCount)}</strong><span>needs review</span></div>
            <button type="button" onClick={() => openInAppBrowser(`${WIKI_WEB}/admin`)}>Open Wiki <ExternalLink size={14} /></button>
        </div>
    )
}

function WikiSearchResults({ results, onInspect }: { results: WikiSearchResult[]; onInspect: (page: Pick<WikiPageItem, 'id' | 'space_slug' | 'slug' | 'title'>) => void }) {
    return (
        <section className="panel wiki-search-results">
            <PanelTitle title="Search Results" subtitle={`${results.length} hits across pages and assets`} />
            <div className="table-list wiki-page-rows">
                {results.map((result) => {
                    const isPage = result.kind === 'page'
                    return (
                        <button className="table-row" key={`${result.kind}-${result.id}`} onClick={() => isPage ? onInspect({ id: result.id, title: result.title, space_slug: result.space, slug: result.slug }) : openInAppBrowser(`${WIKI_WEB}${result.url}`)}>
                            <span className="row-action">{isPage ? 'W' : 'A'}</span>
                            <div>
                                <strong>{result.title}</strong>
                                <small>{result.kind} · {result.space}/{result.slug} · score {formatNumber(result.score)} · {result.snippet || result.summary || 'No snippet'}</small>
                            </div>
                            <time>{formatDate(result.updatedAt)}</time>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

function WikiPageList({ pages, title, onInspect }: { pages: WikiPageItem[]; title: string; onInspect: (page: WikiPageItem) => void }) {
    return (
        <section className="panel">
            <PanelTitle title={title} subtitle={`${pages.length} pages`} />
            {!pages.length ? <EmptyState icon={<BookOpen />} label="No wiki pages returned." /> : null}
            <WikiPageRows pages={pages.slice(0, 12)} onInspect={onInspect} />
        </section>
    )
}

function WikiAssetRows({ assets }: { assets: WikiAuditAsset[] }) {
    return (
        <div className="table-list wiki-page-rows">
            {!assets.length ? <EmptyState icon={<Upload />} label="No assets matched the current filters." /> : null}
            {assets.map((asset) => {
                const pageLabel = asset.pageTitle || asset.page_title || asset.pageSlug || asset.page_slug || 'unused'
                return (
                    <button className="table-row" key={asset.id} onClick={() => openInAppBrowser(`${WIKI_WEB}/assets/${asset.id}`)}>
                        <span className="row-action">A</span>
                        <div>
                            <strong>{assetName(asset)}</strong>
                            <small>{assetMime(asset)} · {formatBytes(assetSize(asset))} · {pageLabel} · {asset.alt_text || 'No alt text'}</small>
                        </div>
                        <time>{formatDate(asset.created_at)}</time>
                    </button>
                )
            })}
        </div>
    )
}

function WikiTemplateRows({ templates }: { templates: WikiTemplate[] }) {
    if (!templates.length) {
        return <EmptyState icon={<FileText />} label="No page templates returned." />
    }

    return (
        <div className="table-list wiki-page-rows">
            {templates.slice(0, 8).map((template) => (
                <button className="table-row" key={template.id} onClick={() => openInAppBrowser(`${WIKI_WEB}/admin/templates`)}>
                    <span className="row-action">T</span>
                    <div>
                        <strong>{template.name}</strong>
                        <small>{template.slug} · {template.suggested_space}/{template.suggested_slug || 'new-page'} · {(template.tags || []).join(', ') || 'no tags'}</small>
                    </div>
                    <time>{formatDate(template.updated_at)}</time>
                </button>
            ))}
        </div>
    )
}

function WikiCommentsPanel({
    comments,
    status,
    onInspect,
}: {
    comments: WikiPageComment[]
    status?: ServiceStatus
    onInspect: (page: Pick<WikiPageItem, 'id' | 'space_slug' | 'slug' | 'title'>) => void
}) {
    return (
        <section className="panel wiki-comments-panel">
            <PanelTitle title="Recent Comments" subtitle="Live /comments unresolved review queue" />
            {status !== 'live' ? <EmptyState icon={<MessageSquare />} label={`Wiki comments endpoint is ${status || 'unavailable'}.`} /> : null}
            {status === 'live' && !comments.length ? <EmptyState icon={<CheckCircle2 />} label="No unresolved wiki comments returned." /> : null}
            {status === 'live' && comments.length ? (
                <div className="table-list wiki-page-rows compact-list">
                    {comments.slice(0, 8).map((comment) => (
                        <button className="table-row" key={comment.id} onClick={() => onInspect({
                            id: comment.page_id,
                            title: comment.page_title || 'Commented page',
                            space_slug: comment.space_slug || 'public',
                            slug: comment.page_slug || '',
                        })}>
                            <span className="row-action">C</span>
                            <div>
                                <strong>{comment.page_title || 'Commented page'}</strong>
                                <small>{comment.author_name || 'anonymous'} · {comment.space_slug || 'wiki'}/{comment.page_slug || comment.page_id} · {comment.body_markdown.slice(0, 120)}</small>
                            </div>
                            <time>{formatDate(comment.created_at)}</time>
                        </button>
                    ))}
                </div>
            ) : null}
        </section>
    )
}

function WikiRecentVersionsPanel({
    versions,
    status,
    onInspectVersion,
}: {
    versions: WikiRecentVersion[]
    status?: ServiceStatus
    onInspectVersion: (version: WikiRecentVersion) => void
}) {
    return (
        <section className="panel wiki-versions-panel">
            <PanelTitle title="Recent Versions" subtitle="Live /versions saved page history" />
            {status !== 'live' ? <EmptyState icon={<RefreshCcw />} label={`Wiki versions endpoint is ${status || 'unavailable'}.`} /> : null}
            {status === 'live' && !versions.length ? <EmptyState icon={<CheckCircle2 />} label="No saved wiki versions returned." /> : null}
            {status === 'live' && versions.length ? (
                <div className="table-list wiki-page-rows compact-list">
                    {versions.slice(0, 8).map((version) => (
                        <button className="table-row" key={version.id} onClick={() => onInspectVersion(version)}>
                            <span className="row-action">V</span>
                            <div>
                                <strong>{version.page_title || version.title}</strong>
                                <small>{version.space_slug}/{version.page_slug} · {version.created_by || 'system'} · {formatNumber(version.content_markdown.length)} chars</small>
                            </div>
                            <time>{formatDate(version.created_at)}</time>
                        </button>
                    ))}
                </div>
            ) : null}
        </section>
    )
}

function WikiAccessReviewPanel({ review, status }: { review: WikiAccessReview | null; status?: ServiceStatus }) {
    const topRoles = (review?.roles || [])
        .filter((role) => role.requiredRole !== 'none')
        .sort((left, right) => right.pages - left.pages)
        .slice(0, 8)

    return (
        <section className="panel wiki-access-panel">
            <PanelTitle title="Access Review" subtitle="Live /admin/access-review" />
            {status !== 'live' || !review ? <EmptyState icon={<ShieldAlert />} label={`Wiki access review endpoint is ${status || 'unavailable'}.`} /> : null}
            {review ? (
                <>
                    <div className="wiki-access-stats">
                        <div><strong>{formatNumber(review.totals.publicPages)}</strong><span>public</span></div>
                        <div><strong>{formatNumber(review.totals.internalPages)}</strong><span>internal</span></div>
                        <div><strong>{formatNumber(review.totals.roles)}</strong><span>roles</span></div>
                        <div><strong>{formatNumber(review.totals.issues)}</strong><span>issues</span></div>
                    </div>
                    <div className="wiki-access-columns">
                        <WikiIssueColumn title="Access Issues" rows={review.issues.slice(0, 12).map((issue) => ({
                            id: issue.id,
                            title: issue.title,
                            meta: `${issue.kind} · ${issue.space}/${issue.slug} · ${issue.issue}`,
                            action: () => openInAppBrowser(`${WIKI_WEB}${issue.href}`),
                        }))} />
                        <div className="wiki-role-list">
                            <h3>Role Coverage</h3>
                            {!topRoles.length ? <small>No role-gated pages returned.</small> : null}
                            {topRoles.map((role) => (
                                <button type="button" key={`${role.visibility}-${role.requiredRole}`} onClick={() => openInAppBrowser(`${WIKI_WEB}/admin/pages?status=all&q=${encodeURIComponent(role.requiredRole)}`)}>
                                    <strong>{role.requiredRole}</strong>
                                    <span>{role.visibility} · {formatNumber(role.pages)} pages</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    )
}

function WikiSpaceCard({ space, tree, onInspect }: { space: WikiSpace; tree?: { pageCount: number; pages: WikiTreeItem[] }; onInspect: (page: Pick<WikiPageItem, 'id' | 'space_slug' | 'slug' | 'title'>) => void }) {
    const pageCount = tree?.pageCount ?? 0
    return (
        <article className="resource-card wiki-space-card">
            <h3>{space.name}</h3>
            <p>{pageCount} visible pages</p>
            <code>{space.slug} · {space.visibility}{space.required_role ? ` · ${space.required_role}` : ''}</code>
            <small>{space.description || 'No space description.'}</small>
            <div className="wiki-tree-mini">{(tree?.pages || []).slice(0, 7).map((page) => <WikiTreeLink key={page.id} page={page} space={space.slug} onInspect={onInspect} />)}</div>
            {!tree?.pages?.length ? <small>No published tree pages in this space yet.</small> : null}
        </article>
    )
}

function WikiEndpointCoverage({
    data,
    results,
    message,
    loading,
    onRunSmoke,
}: {
    data: DashboardData
    results: WikiEndpointSmokeResult[]
    message: string
    loading: boolean
    onRunSmoke: () => void
}) {
    const endpoints = data.wiki.meta?.endpoints || {}
    const groups = Object.entries(endpoints)
    const totalEndpoints = groups.reduce((sum, [, rows]) => sum + rows.length, 0)
    const writeRequired = data.wiki.meta?.auth?.writeTokensRequired
    return (
        <section className="panel full-span">
            <PanelTitle title="API Coverage" subtitle={`${groups.length} endpoint groups, ${totalEndpoints} operations advertised by /meta`} />
            <div className="editor-actions">
                <button type="button" disabled={loading} onClick={onRunSmoke}>{loading ? 'Checking...' : 'Run endpoint smoke'}</button>
            </div>
            <p className="editor-message">{message}</p>
            {results.length ? (
                <div className="wiki-smoke-list">
                    {results.map((result) => (
                        <article className="content-card wiki-smoke-row" key={result.path}>
                            <h3>{result.label}<EndpointPill label={result.status} status={result.status} compact /></h3>
                            <code>{result.path}</code>
                            <small>{result.durationMs}ms · {result.detail}</small>
                        </article>
                    ))}
                </div>
            ) : null}
            <div className="wiki-endpoint-grid">
                <article className="resource-card wiki-space-card">
                    <h3>Auth Model</h3>
                    <p>{writeRequired ? 'Write tokens required' : 'Local writes unrestricted'}</p>
                    <code>admin role: {data.wiki.meta?.auth?.adminRole || 'queenbee'} · max asset {formatBytes(data.wiki.meta?.limits?.assetBytes)}</code>
                    <small>Desktop audits public/read endpoints directly and labels gated write/admin actions instead of hiding them.</small>
                </article>
                {groups.map(([group, rows]) => (
                    <article className="content-card wiki-endpoint-card" key={group}>
                        <h3>{group}<EndpointPill label={String(rows.length)} status="live" compact /></h3>
                        <div className="wiki-scroll-list compact">
                            {rows.map((row) => (
                                <code key={row}>{row}</code>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

function WikiCrawlSummary({
    audit,
    reportText,
    message,
    onCopyReport,
    onInspect,
}: {
    audit: WikiCrawlAudit
    reportText: string
    message: string
    onCopyReport: () => void
    onInspect: (page: Pick<WikiPageItem, 'id' | 'space_slug' | 'slug' | 'title'>) => void
}) {
    const topSpaces = Object.entries(audit.bySpace).sort((a, b) => b[1] - a[1]).slice(0, 8)
    const cleanupCount = audit.missingSummary.length + audit.missingContent.length + audit.assetsMissingAlt.length + audit.unusedAssets.length + audit.accessMismatches.length
    return (
        <section className="panel full-span wiki-crawl-panel">
            <PanelTitle title="Full Crawl Audit" subtitle={`Generated ${formatDate(audit.generatedAt)} from paginated /pages and /assets`} />
            <div className="editor-actions">
                <button type="button" onClick={onCopyReport}>Copy audit report</button>
            </div>
            {message ? <p className="editor-message">{message}</p> : null}
            <details className="wiki-report-preview">
                <summary>Audit report preview</summary>
                <textarea readOnly value={reportText} />
            </details>
            <div className="wiki-crawl-summary">
                <div><strong>{formatNumber(audit.pages.length)}</strong><span>pages crawled</span></div>
                <div><strong>{formatNumber(audit.assets.length)}</strong><span>assets crawled</span></div>
                <div><strong>{formatNumber(cleanupCount)}</strong><span>cleanup items</span></div>
                <div><strong>{formatNumber(audit.draftOrArchived.length)}</strong><span>non-published</span></div>
                <div><strong>{formatNumber(audit.restrictedPages.length)}</strong><span>internal pages</span></div>
                <div><strong>{formatNumber(audit.roleGatedPages.length)}</strong><span>role-gated</span></div>
            </div>
            <div className="wiki-crawl-grid">
                <WikiIssueColumn title="Access Mismatch" rows={audit.accessMismatches.slice(0, 80).map((page) => ({
                    id: page.id,
                    title: page.title,
                    meta: `${page.space_slug}/${page.slug} · ${pageAccessLabel(page)}`,
                    action: () => onInspect(page),
                }))} />
                <WikiIssueColumn title="Missing Summary" rows={audit.missingSummary.slice(0, 80).map((page) => ({
                    id: page.id,
                    title: page.title,
                    meta: `${page.space_slug}/${page.slug} · ${pageAccessLabel(page)}`,
                    action: () => onInspect(page),
                }))} />
                <WikiIssueColumn title="Missing Content" rows={audit.missingContent.slice(0, 80).map((page) => ({
                    id: page.id,
                    title: page.title,
                    meta: `${page.space_slug}/${page.slug} · ${pageAccessLabel(page)}`,
                    action: () => onInspect(page),
                }))} />
                <WikiIssueColumn title="Images Missing Alt" rows={audit.assetsMissingAlt.slice(0, 80).map((asset) => ({
                    id: asset.id,
                    title: assetName(asset),
                    meta: `${asset.spaceSlug || asset.space_slug || 'assets'} · ${formatBytes(assetSize(asset))}`,
                    action: () => openInAppBrowser(`${WIKI_WEB}/assets/${asset.id}`),
                }))} />
                <WikiIssueColumn title="Unused Assets" rows={audit.unusedAssets.slice(0, 80).map((asset) => ({
                    id: asset.id,
                    title: assetName(asset),
                    meta: `${assetMime(asset)} · ${formatBytes(assetSize(asset))}`,
                    action: () => openInAppBrowser(`${WIKI_WEB}/assets/${asset.id}`),
                }))} />
            </div>
            <div className="wiki-crawl-meta">
                <article>
                    <h3>Status</h3>
                    {Object.entries(audit.byStatus).map(([status, count]) => <code key={status}>{status}: {count}</code>)}
                </article>
                <article>
                    <h3>Visibility</h3>
                    {Object.entries(audit.byVisibility).map(([visibility, count]) => <code key={visibility}>{visibility}: {count}</code>)}
                </article>
                <article>
                    <h3>Largest Spaces</h3>
                    {topSpaces.map(([space, count]) => <code key={space}>{space}: {count}</code>)}
                </article>
            </div>
        </section>
    )
}

function WikiPageRows({ pages, onInspect }: { pages: WikiPageItem[]; onInspect: (page: WikiPageItem) => void }) {
    return (
        <div className="table-list wiki-page-rows">
            {pages.map((page) => (
                <button className="table-row" key={page.id} onClick={() => onInspect(page)}>
                    <span className="row-action">W</span>
                    <div>
                        <strong>{page.title}</strong>
                        <small>{page.space_slug}/{page.slug} · {page.status} · {pageAccessLabel(page)} · {page.summary || 'No summary'}</small>
                    </div>
                    <time>{formatDate(page.updated_at)}</time>
                </button>
            ))}
        </div>
    )
}

function WikiPageInspector({
    page,
    selectedVersion,
    versions,
    links,
    backlinks,
    comments,
    assets,
    message,
    loading,
    onInspect,
    onInspectVersion,
}: {
    page: WikiPageItem | null
    selectedVersion: WikiPageVersion | null
    versions: WikiPageVersion[]
    links: WikiPageLink[]
    backlinks: WikiPageLink[]
    comments: WikiPageComment[]
    assets: WikiAuditAsset[]
    message: string
    loading: boolean
    onInspect: (page: Pick<WikiPageItem, 'id' | 'space_slug' | 'slug' | 'title'>) => void
    onInspectVersion: (versionId: string) => void
}) {
    return (
        <section className="panel full-span wiki-inspector">
            <PanelTitle title="Page Audit Inspector" subtitle="Live /pages/:id, /versions, /links, /backlinks, and /assets?pageId" />
            <p className="editor-message">{loading ? 'Loading page audit context...' : message}</p>
            {!page ? <EmptyState icon={<BookOpen />} label="Select a page, broken link, review candidate, or migration collision to inspect it here." /> : null}
            {page ? (
                <div className="wiki-inspector-grid">
                    <article className="resource-card wiki-page-detail">
                        <h3>{page.title}</h3>
                        <p>{page.space_slug}/{page.slug}</p>
                        <code>{page.status} · {pageAccessLabel(page)} · updated {formatDate(page.updated_at)}</code>
                        <small>{page.summary || 'No summary'}</small>
                        <div className="editor-actions">
                            <button type="button" onClick={() => openWikiPage(page.space_slug, page.slug)}>Open reader <ExternalLink size={14} /></button>
                            <button type="button" onClick={() => openInAppBrowser(`${WIKI_WEB}/edit/${page.id}`)}>Open editor <Pencil size={14} /></button>
                        </div>
                    </article>
                    <article className="wiki-markdown-preview">
                        <h3>{selectedVersion ? 'Version Preview' : 'Markdown Preview'}</h3>
                        {selectedVersion ? (
                            <p>{selectedVersion.title} · {selectedVersion.created_by || 'system'} · {formatDate(selectedVersion.created_at)} · {(selectedVersion.tags || []).join(', ') || 'no tags'}</p>
                        ) : null}
                        <pre>{((selectedVersion?.content_markdown || page.content_markdown) || '').slice(0, 3200) || 'No markdown body returned.'}</pre>
                    </article>
                    <WikiRelationColumn title="Outgoing Links" empty="No outgoing wiki links." rows={links.map((link) => ({
                        id: `${link.to_page_id}-${link.to_slug}`,
                        title: link.to_title,
                        meta: `${link.to_space_slug}/${link.to_slug}`,
                        action: () => onInspect({ id: link.to_page_id, title: link.to_title, space_slug: link.to_space_slug, slug: link.to_slug }),
                    }))} />
                    <WikiRelationColumn title="Backlinks" empty="No backlinks." rows={backlinks.map((link) => ({
                        id: `${link.from_page_id}-${link.from_slug}`,
                        title: link.from_title,
                        meta: `${link.from_space_slug}/${link.from_slug}`,
                        action: () => onInspect({ id: link.from_page_id, title: link.from_title, space_slug: link.from_space_slug, slug: link.from_slug }),
                    }))} />
                    <WikiRelationColumn title="Versions" empty="No saved versions." rows={versions.map((version) => ({
                        id: version.id,
                        title: version.title,
                        meta: `${version.created_by} · ${formatDate(version.created_at)} · ${formatNumber(version.content_markdown.length)} chars`,
                        action: () => onInspectVersion(version.id),
                    }))} />
                    <WikiRelationColumn title="Comments" empty="No page comments." rows={comments.map((comment) => ({
                        id: comment.id,
                        title: comment.body_markdown.slice(0, 120) || 'Empty comment',
                        meta: `${comment.author_name || 'anonymous'} · ${comment.resolved_at ? 'resolved' : 'open'} · ${formatDate(comment.created_at)}`,
                        action: () => openWikiPage(page.space_slug, page.slug),
                    }))} />
                    <WikiRelationColumn title="Page Assets" empty="No assets attached to this page." rows={assets.map((asset) => ({
                        id: asset.id,
                        title: assetName(asset),
                        meta: `${assetMime(asset)} · ${formatBytes(assetSize(asset))}`,
                        action: () => openInAppBrowser(`${WIKI_WEB}/assets/${asset.id}`),
                    }))} />
                </div>
            ) : null}
        </section>
    )
}

function WikiRelationColumn({ title, empty, rows }: { title: string; empty: string; rows: Array<{ id: string; title: string; meta: string; action: () => void }> }) {
    return (
        <article className="content-card wiki-relation-column">
            <h3>{title}<EndpointPill label={String(rows.length)} status="live" compact /></h3>
            {!rows.length ? <EmptyState icon={<CheckCircle2 />} label={empty} /> : null}
            {rows.slice(0, 10).map((row) => (
                <button className="content-row" key={row.id} onClick={row.action}>
                    <span>{row.title.slice(0, 1) || 'W'}</span>
                    <div><strong>{row.title}</strong><small>{row.meta}</small></div>
                </button>
            ))}
        </article>
    )
}

function WikiIssueList({ data, onInspect }: { data: DashboardData; onInspect: (page: Pick<WikiPageItem, 'id' | 'space_slug' | 'slug' | 'title'>) => void }) {
    const audit = data.wiki.audit
    if (!audit) {
        return <section className="panel"><PanelTitle title="Audit Issues" subtitle="Waiting for /admin/audit" /><EmptyState icon={<AlertCircle />} label="No audit payload available yet." /></section>
    }

    return (
        <section className="panel full-span">
            <PanelTitle title="Audit Issues" subtitle="Broken links, migration collisions, review candidates, and asset cleanup" />
            <div className="wiki-issue-grid">
                <WikiIssueColumn
                    title="Broken Links"
                    rows={audit.links.broken.map((item) => ({
                        id: `${item.fromPageId}-${item.targetSpace}-${item.targetSlug}`,
                        title: item.fromTitle,
                        meta: `${item.fromSpace}/${item.fromSlug} -> ${item.targetSpace}/${item.targetSlug}`,
                        action: () => onInspect({ id: item.fromPageId, title: item.fromTitle, space_slug: item.fromSpace, slug: item.fromSlug }),
                    }))}
                />
                <WikiIssueColumn
                    title="Review Queue"
                    rows={audit.review.pages.map((item) => ({
                        id: item.id,
                        title: item.title,
                        meta: `${item.space}/${item.slug} · ${item.reason}`,
                        action: () => onInspect({ id: item.id, title: item.title, space_slug: item.space, slug: item.slug }),
                    }))}
                />
                <WikiIssueColumn
                    title="Unused Assets"
                    rows={audit.assets.unusedFiles.map((item) => ({
                        id: item.id,
                        title: assetName(item),
                        meta: `${assetMime(item)} · ${formatBytes(assetSize(item))}`,
                        action: () => openInAppBrowser(`${WIKI_WEB}${item.url}`),
                    }))}
                />
                <WikiIssueColumn
                    title="Migration Collisions"
                    rows={audit.migration.collisions.map((item) => ({
                        id: item.pageId,
                        title: item.title,
                        meta: `${item.sourceCount} sources · ${item.sourcePaths.slice(0, 2).join(', ')}`,
                        action: () => onInspect({ id: item.pageId, title: item.title, space_slug: item.space, slug: item.slug }),
                    }))}
                />
            </div>
        </section>
    )
}

function WikiIssueColumn({ title, rows }: { title: string; rows: Array<{ id: string; title: string; meta: string; action: () => void }> }) {
    return (
        <article className="content-card wiki-issue-column">
            <h3>{title}<EndpointPill label={`${rows.length}`} status="live" compact /></h3>
            {!rows.length ? <EmptyState icon={<CheckCircle2 />} label="No issues in this bucket." /> : null}
            <div className="wiki-scroll-list">
            {rows.map((row) => (
                <button className="content-row" key={row.id} onClick={row.action}>
                    <span>{row.title.slice(0, 1) || 'W'}</span>
                    <div><strong>{row.title}</strong><small>{row.meta}</small></div>
                </button>
            ))}
            </div>
        </article>
    )
}

function WikiTreeLink({ page, space, onInspect }: { page: WikiTreeItem; space: string; onInspect: (page: Pick<WikiPageItem, 'id' | 'space_slug' | 'slug' | 'title'>) => void }) {
    return (
        <button type="button" onClick={() => onInspect({ id: page.id, title: page.title, space_slug: space, slug: page.slug })}>
            <span>{page.children.length ? '▸' : '•'}</span>
            <strong>{page.title}</strong>
        </button>
    )
}

function AnnouncementsPage({ data, queenbeeLoggedIn }: { data: DashboardData; queenbeeLoggedIn: boolean }) {
    if (!queenbeeLoggedIn && data.health.announcements !== 'live') {
        return <ProtectedBotAnnouncements />
    }

    return <EditorPage data={data} config={editorConfigs.announcements} preview={<AnnouncementList announcements={data.announcements} status={data.health.announcements} />} />
}

function AlbumsPage({ data }: { data: DashboardData }) {
    return <EditorPage data={data} config={editorConfigs.albums} preview={<TileGrid rows={data.albums} status={data.health.albums} kind="album" />} />
}

function AlbumImagesPage({ data }: { data: DashboardData }) {
    const [albumId, setAlbumId] = useState(String(data.albums[0]?.id || ''))
    const [album, setAlbum] = useState<Record<string, unknown> | null>(null)
    const [message, setMessage] = useState('Choose an album and load its images.')
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const images = Array.isArray(album?.images) ? album.images as string[] : []

    async function loadAlbum(event?: React.FormEvent) {
        event?.preventDefault()
        if (!albumId) return
        setMessage('Loading album images...')
        try {
            const response = await fetch(`https://workerbee.login.no/api/v2/albums/${albumId}`)
            const next = await response.json()
            if (!response.ok) throw new Error(next?.message || next?.error || 'Unable to load album')
            setAlbum(next)
            setMessage(`Loaded ${Array.isArray(next.images) ? next.images.length : 0} images.`)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to load album.')
        }
    }

    async function setCover(imageName: string) {
        if (!window.confirm(`Set ${imageName} as album cover?`)) return
        try {
            await queenbeeRequest({ service: 'workerbee', path: `albums/${albumId}/cover/${encodeURIComponent(imageName)}`, method: 'PUT' })
            setMessage('Cover image updated.')
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to update cover.')
        }
    }

    async function deleteImage(imageName: string) {
        if (!window.confirm(`Delete ${imageName} from album ${albumId}?`)) return
        try {
            await queenbeeRequest({ service: 'workerbee', path: `albums/${albumId}/images/${encodeURIComponent(imageName)}`, method: 'DELETE' })
            setMessage('Image deleted. Reload the album to refresh.')
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to delete image.')
        }
    }

    async function compressAlbums() {
        if (!window.confirm('Run album image compression across Workerbee?')) return
        try {
            await queenbeeRequest({ service: 'workerbee', path: 'albums/compress', method: 'PUT' })
            setMessage('Album compression triggered.')
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to trigger compression.')
        }
    }

    async function uploadImages() {
        if (!albumId || !files.length) {
            setMessage('Choose an album and at least one image first.')
            return
        }
        if (!window.confirm(`Upload ${files.length} image${files.length === 1 ? '' : 's'} to album ${albumId}? This pushes files to Workerbee object storage.`)) return
        setUploading(true)
        try {
            const form = new FormData()
            files.forEach((file) => form.append('images', file))
            await queenbeeRequest({ service: 'workerbee', path: `albums/${albumId}/images`, method: 'POST', data: form, timeoutMs: 45000 })
            setFiles([])
            setMessage('Images uploaded. Reloading album images...')
            await loadAlbum()
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to upload album images.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <PagePanel title="Album Images" status={data.health.albums}>
            <form className="mini-admin-form inline" onSubmit={loadAlbum}>
                <h3>Load album</h3>
                <label className="editor-field"><span>Album ID</span><input value={albumId} onChange={(event) => setAlbumId(event.target.value)} list="album-id-options" /></label>
                <datalist id="album-id-options">{data.albums.map((item) => <option key={item.id} value={String(item.id)}>{displayName(item)}</option>)}</datalist>
                <button type="submit"><RefreshCcw size={14} />Load</button>
                <button type="button" disabled={!hasQueenbeeAuthSource()} onClick={compressAlbums}>Compress all albums</button>
            </form>
            <div className="media-upload-panel">
                <div>
                    <h3>Upload album images</h3>
                    <p>Select one or more images and push them to the live album media endpoint.</p>
                </div>
                <label className="file-picker">
                    <Upload size={16} />
                    <span>{files.length ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : 'Choose images'}</span>
                    <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} />
                </label>
                <button type="button" disabled={!hasQueenbeeAuthSource() || uploading || !files.length} onClick={uploadImages}>{uploading ? 'Uploading...' : 'Upload to album'}</button>
            </div>
            <p className="editor-message">{message}</p>
            <div className="album-image-grid">
                {images.map((imageName) => (
                    <article className="album-image-card" key={imageName}>
                        <img src={albumImageUrl(albumId, imageName)} alt="" />
                        <strong>{imageName}</strong>
                        <div className="editor-actions">
                            <button onClick={() => setCover(imageName)}>Set cover</button>
                            <button className="danger-action" onClick={() => deleteImage(imageName)}>Delete</button>
                        </div>
                    </article>
                ))}
                {!images.length ? <EmptyState icon={<Images />} label="Load an album to manage images." /> : null}
            </div>
            <div className="editor-toolbar"><button onClick={() => openInAppBrowser(`https://queenbee.login.no/albums/images/${albumId || ''}`)}>Open Queenbee <ExternalLink size={14} /></button></div>
        </PagePanel>
    )
}

function JobsPage({ data }: { data: DashboardData }) {
    return <EditorPage data={data} config={editorConfigs.jobs} preview={<JobList jobs={data.jobs} status={data.health.jobs} />} />
}

function OrganizationsPage({ data }: { data: DashboardData }) {
    const [query, setQuery] = useState('')
    const [orderBy, setOrderBy] = useState('id')
    const [sort, setSort] = useState<'asc' | 'desc'>('asc')
    const [page, setPage] = useState(1)
    const [rows, setRows] = useState<NamedItem[] | null>(null)
    const [total, setTotal] = useState(data.counts.organizations)
    const [message, setMessage] = useState('Public organizations loaded. Use the browser controls for Queenbee-style search, sort, and pagination.')
    const [loading, setLoading] = useState(false)
    const pageSize = 14
    const organizationRows = rows || data.organizations
    const organizationData = { ...data, organizations: organizationRows, counts: { ...data.counts, organizations: total || organizationRows.length } }

    async function loadOrganizations(event?: React.FormEvent) {
        event?.preventDefault()
        setLoading(true)
        const params = new URLSearchParams({
            limit: String(pageSize),
            offset: String(Math.max(0, page - 1) * pageSize),
            order_by: orderBy,
            sort,
        })
        if (query) params.set('search', query)
        try {
            const result = await fetch(`https://workerbee.login.no/api/v2/organizations?${params.toString()}`)
            const payload = await result.json()
            if (!result.ok) throw new Error(payload?.error || payload?.message || 'Unable to load organizations')
            const nextRows = Array.isArray(payload.organizations) ? payload.organizations : []
            setRows(nextRows)
            setTotal(typeof payload.total_count === 'number' ? payload.total_count : nextRows.length)
            setMessage(`Loaded ${nextRows.length} organizations from Workerbee.`)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to load organizations.')
        } finally {
            setLoading(false)
        }
    }

    function applyExample() {
        window.dispatchEvent(new CustomEvent('login-desktop-editor-example', {
            detail: {
                title: 'Organizations',
                values: {
                    name_no: 'Login - Linjeforeningen for IT',
                    name_en: 'Login - Student Organization for IT',
                    description_no: 'Login er linjeforeningen for IT- og teknologistudenter ved NTNU Gjovik.\\n- Arrangerer sosiale og faglige aktiviteter\\n- Nettverksbygging med naeringslivet\\n- Stotte til studenter gjennom semesteret',
                    description_en: 'Login is the student organization for IT and technology students at NTNU Gjovik.\\n- Organizes social and academic events\\n- Networking opportunities with companies\\n- Student support throughout the semester',
                    link_homepage: 'https://login.no/',
                    link_linkedin: 'https://www.linkedin.com/company/login-student-organization/',
                    link_facebook: 'https://www.facebook.com/loginlinjeforeningen',
                    link_instagram: 'https://www.instagram.com/loginlinjeforeningen/',
                    logo: 'tekkom_32.png',
                },
            },
        }))
    }

    return (
        <div className="stacked-page">
            <section className="panel compact-panel">
                <PanelTitle title="Organizations Browser" subtitle="Matches Queenbee search, sort, and page controls" />
                <form className="event-browser-controls" onSubmit={loadOrganizations}>
                    <label className="editor-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search organizations" /></label>
                    <label className="editor-field"><span>Order by</span><select value={orderBy} onChange={(event) => setOrderBy(event.target.value)}><option value="id">id</option><option value="name_en">name_en</option><option value="name_no">name_no</option><option value="updated_at">updated_at</option></select></label>
                    <label className="editor-field"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as 'asc' | 'desc')}><option value="asc">asc</option><option value="desc">desc</option></select></label>
                    <label className="editor-field"><span>Page</span><input type="number" min="1" value={page} onChange={(event) => setPage(Math.max(1, Number(event.target.value) || 1))} /></label>
                    <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Load organizations'}</button>
                    <button type="button" onClick={applyExample}>Example</button>
                </form>
                <p className="editor-message">{message}</p>
            </section>
            <EditorPage data={organizationData} config={editorConfigs.organizations} preview={<TileGrid rows={organizationRows} status={data.health.organizations} kind="organization" />} />
        </div>
    )
}

function LocationsPage({ data }: { data: DashboardData }) {
    const [type, setType] = useState('all')
    const locationRows = data.locations.filter((row) => type === 'all' || stringValue((row as EditableRow).type).toLowerCase() === type)
    const locationData = { ...data, locations: locationRows }
    return (
        <div className="stacked-page">
            <section className="panel compact-panel">
                <PanelTitle title="Location Type" subtitle="Matches Queenbee address / coordinate / mazemap / digital filters" />
                <div className="segment-row">
                    {['all', 'address', 'coordinate', 'mazemap', 'digital'].map((item) => <button key={item} className={type === item ? 'active' : ''} onClick={() => setType(item)}>{item}</button>)}
                </div>
            </section>
            <EditorPage data={locationData} config={editorConfigs.locations} preview={<TileGrid rows={locationRows} status={data.health.locations} kind="location" />} />
        </div>
    )
}

function RulesPage({ data }: { data: DashboardData }) {
    const [query, setQuery] = useState('')
    const [orderBy, setOrderBy] = useState('id')
    const [sort, setSort] = useState<'asc' | 'desc'>('asc')
    const [page, setPage] = useState(1)
    const [rows, setRows] = useState<RuleItem[] | null>(null)
    const [total, setTotal] = useState(data.counts.rules)
    const [message, setMessage] = useState('Public rules loaded. Use the browser controls for Queenbee-style search, sort, and pagination.')
    const [loading, setLoading] = useState(false)
    const pageSize = 14
    const ruleRows = rows || data.rules
    const ruleData = { ...data, rules: ruleRows, counts: { ...data.counts, rules: total || ruleRows.length } }

    async function loadRules(event?: React.FormEvent) {
        event?.preventDefault()
        setLoading(true)
        const offset = Math.max(0, page - 1) * pageSize
        const params = new URLSearchParams({
            limit: String(pageSize),
            offset: String(offset),
            order_by: orderBy,
            sort,
        })
        if (query) params.set('search', query)
        try {
            const result = await fetch(`https://workerbee.login.no/api/v2/rules?${params.toString()}`)
            const payload = await result.json()
            if (!result.ok) throw new Error(payload?.error || payload?.message || 'Unable to load rules')
            const nextRows = Array.isArray(payload.rules) ? payload.rules : []
            setRows(nextRows)
            setTotal(typeof payload.total_count === 'number' ? payload.total_count : nextRows.length)
            setMessage(`Loaded ${nextRows.length} rules from Workerbee offset ${offset}.`)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to load rules.')
        } finally {
            setLoading(false)
        }
    }

    function applyExample() {
        window.dispatchEvent(new CustomEvent('login-desktop-editor-example', {
            detail: {
                title: 'Rules',
                values: {
                    name_no: 'Deltakerretningslinjer',
                    name_en: 'Participant Guidelines',
                    description_no: 'Vennligst følg disse retningslinjene under arrangementet:\\n- Mot opp til avtalt tid\\n- Respekter andre deltakere og arrangorer\\n- Folg sikkerhetsinstruksjoner\\n- Hold omradet ryddig\\n- Still sporsmal ved behov',
                    description_en: 'Please follow these guidelines during the event:\\n- Arrive on time\\n- Respect other participants and organizers\\n- Follow safety instructions\\n- Keep the area tidy\\n- Ask questions when needed',
                },
            },
        }))
    }

    return (
        <div className="stacked-page">
            <section className="panel compact-panel">
                <PanelTitle title="Rules Browser" subtitle="Matches Queenbee search, sort, and page controls" />
                <form className="event-browser-controls" onSubmit={loadRules}>
                    <label className="editor-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rules" /></label>
                    <label className="editor-field"><span>Order by</span><select value={orderBy} onChange={(event) => setOrderBy(event.target.value)}><option value="id">id</option><option value="name_no">name_no</option><option value="name_en">name_en</option><option value="updated_at">updated_at</option></select></label>
                    <label className="editor-field"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as 'asc' | 'desc')}><option value="asc">asc</option><option value="desc">desc</option></select></label>
                    <label className="editor-field"><span>Page</span><input type="number" min="1" value={page} onChange={(event) => setPage(Math.max(1, Number(event.target.value) || 1))} /></label>
                    <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Load rules'}</button>
                    <button type="button" onClick={applyExample}>Example</button>
                </form>
                <p className="editor-message">{message}</p>
            </section>
            <EditorPage data={ruleData} config={editorConfigs.rules} preview={<RuleList rules={ruleRows} status={data.health.rules} />} />
        </div>
    )
}

function AlertsPage({ data }: { data: DashboardData }) {
    return <EditorPage data={data} config={editorConfigs.alerts} />
}

function HoneyPage({ data }: { data: DashboardData }) {
    return <EditorPage data={data} config={editorConfigs.honey} />
}

function EditorPage<T extends EditableRow>({ data, config, preview }: { data: DashboardData; config: EditorConfig<T>; preview?: React.ReactNode }) {
    const rows = config.rows(data)
    const status = data.health[config.statusKey]
    const [editing, setEditing] = useState<T | null>(rows[0] || null)
    const [mode, setMode] = useState<'create' | 'update'>(rows[0] ? 'update' : 'create')
    const [message, setMessage] = useState('Ready. Authenticate with Queenbee to push changes.')
    const [query, setQuery] = useState('')
    const [busy, setBusy] = useState(false)
    const [mediaMessage, setMediaMessage] = useState('')
    const [exampleDefaults, setExampleDefaults] = useState<EditableRow | null>(null)
    const authReady = hasQueenbeeAuthSource()
    const filteredRows = rows.filter((row) => `${config.titleOf(row)} ${config.metaOf(row)} ${row.id}`.toLowerCase().includes(query.toLowerCase()))
    const imageUploadPath = imagePathForEditor(config.title)

    function startCreate() {
        setMode('create')
        setEditing(null)
        setExampleDefaults(null)
        setMessage('Create mode. Fill the fields, then publish when ready.')
    }

    function startEdit(row: T) {
        setMode('update')
        setEditing(row)
        setExampleDefaults(null)
        setMessage(`Editing ${config.titleOf(row)}.`)
    }

    useEffect(() => {
        function onExample(event: Event) {
            const detail = (event as CustomEvent<{ title?: string; values?: Record<string, unknown> }>).detail
            if (detail?.title !== config.title || !detail.values) return
            setMode('create')
            setEditing(null)
            setExampleDefaults({ id: 'example', ...detail.values })
            setMessage(`Example ${config.title.toLowerCase()} loaded. Review before publishing.`)
        }
        window.addEventListener('login-desktop-editor-example', onExample)
        return () => window.removeEventListener('login-desktop-editor-example', onExample)
    }, [config.title])

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const payload = buildEditorPayload(config.fields, new FormData(event.currentTarget))
        if (mode === 'update' && editing && config.service === 'bot') payload.id = editing.id
        let target = mode === 'create' ? config.createPath : editing ? config.updatePath(editing.id) : config.createPath
        if (config.title === 'Events') {
            payload.time_type ||= 'default'
            const repeatType = stringValue(payload.repeat_type)
            const repeatUntil = stringValue(payload.repeat_until)
            delete payload.repeat_type
            delete payload.repeat_until
            if (mode === 'create' && repeatType) {
                const params = new URLSearchParams({ repeat_type: repeatType })
                if (repeatUntil) params.set('repeat_until', repeatUntil.slice(0, 10))
                target = `${target}?${params.toString()}`
            }
        }
        const method = mode === 'create' ? 'POST' : 'PUT'
        const title = mode === 'create' ? `create a new ${config.title}` : `update ${editing ? config.titleOf(editing) : config.title}`
        if (!window.confirm(`Push this live Queenbee change now?\n\nAction: ${title}\nEndpoint: ${config.service}/${target}`)) return
        setBusy(true)
        try {
            await queenbeeRequest({ service: config.service, path: target, method, data: payload })
            setMessage(`${title} succeeded. Refresh the dashboard to reload live data.`)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Queenbee write failed.')
        } finally {
            setBusy(false)
        }
    }

    async function remove(row: T) {
        if (!window.confirm(`Delete ${config.titleOf(row)} from Queenbee?\n\nThis removes live content and cannot be undone here.`)) return
        setBusy(true)
        try {
            await queenbeeRequest({ service: config.service, path: config.deletePath(row.id), method: 'DELETE', data: config.deleteBody?.(row.id) })
            setMessage(`Deleted ${config.titleOf(row)}. Refresh the dashboard to reload live data.`)
            if (editing?.id === row.id) startCreate()
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Queenbee delete failed.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="editor-layout">
            <section className="panel full-span editor-console">
                <PanelTitle title={`${config.title} Editor`} subtitle={`${config.service}/${mode === 'create' ? config.createPath : editing ? config.updatePath(editing.id) : config.createPath}`} />
                <div className="editor-toolbar">
                    <EndpointPill label={config.service} status={status || 'error'} compact />
                    <span className={authReady ? 'editor-token ready' : 'editor-token'}><KeyRound size={14} />{authReady ? 'Queenbee auth ready' : 'Read-only until Queenbee auth'}</span>
                    <button onClick={startCreate}><Plus size={14} />New</button>
                    <button onClick={() => openInAppBrowser(`https://queenbee.login.no${config.queenbeePath}`)}>Open Queenbee <ExternalLink size={14} /></button>
                </div>
                <form className="editor-form" onSubmit={submit} key={`${config.title}-${mode}-${editing?.id || exampleDefaults?.id || 'new'}`}>
                    {config.fields.map((field) => <EditorInput key={field.name} field={field} row={editing || exampleDefaults} />)}
                    <div className="editor-actions">
                        <button className="primary-action" type="submit" disabled={busy || !authReady}><Pencil size={15} />{busy ? 'Pushing...' : mode === 'create' ? 'Create and publish' : 'Save live update'}</button>
                        {mode === 'update' && editing ? <button type="button" className="danger-action" disabled={busy || !authReady} onClick={() => remove(editing)}><Trash2 size={15} />Delete</button> : null}
                    </div>
                </form>
                {imageUploadPath ? <EditorMediaTools path={imageUploadPath} fields={config.fields} onMessage={setMediaMessage} /> : null}
                <p className="editor-message">{message}</p>
                {mediaMessage ? <p className="editor-message">{mediaMessage}</p> : null}
            </section>

            <section className="panel editor-list-panel">
                <PanelTitle title={`${config.title} Rows`} subtitle={`${filteredRows.length} of ${rows.length} loaded from Queenbee`} />
                <label className="editor-field editor-search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}`} /></label>
                {status !== 'live' ? <EmptyState icon={<AlertCircle />} label={`${config.title} endpoint is ${status || 'unavailable'}.`} /> : null}
                <div className="editor-row-list">
                    {filteredRows.map((row) => (
                        <article className={editing?.id === row.id ? 'editor-row-card active' : 'editor-row-card'} key={row.id}>
                            <div>
                                <strong>{config.titleOf(row)}</strong>
                                <span>{config.metaOf(row)}</span>
                            </div>
                            <button onClick={() => startEdit(row)}><Pencil size={13} />Edit</button>
                        </article>
                    ))}
                </div>
            </section>

            {preview ? <section className="panel editor-preview-panel"><PanelTitle title="Public Preview" subtitle="Read-only current output" />{preview}</section> : null}
        </div>
    )
}

function imagePathForEditor(title: string) {
    if (title === 'Events') return 'events'
    if (title === 'Jobs') return 'jobs'
    if (title === 'Organizations') return 'organizations'
    return ''
}

function EditorMediaTools({ path, fields, onMessage }: { path: string; fields: EditorField[]; onMessage: (message: string) => void }) {
    const [file, setFile] = useState<File | null>(null)
    const [images, setImages] = useState<string[]>([])
    const [busy, setBusy] = useState('')
    const imageFields = fields.filter((field) => field.name.includes('image'))

    async function loadImages() {
        setBusy('load')
        try {
            const result = await queenbeeRequest<string[]>({ service: 'workerbee', path: `images/${path}`, method: 'GET', timeoutMs: 15000 })
            setImages(Array.isArray(result) ? result : [])
            onMessage(`Loaded ${Array.isArray(result) ? result.length : 0} ${path} media files.`)
        } catch (error) {
            onMessage(error instanceof Error ? error.message : `Unable to load ${path} images.`)
        } finally {
            setBusy('')
        }
    }

    async function uploadImage() {
        if (!file) {
            onMessage('Choose an image first.')
            return
        }
        if (!window.confirm(`Upload ${file.name} to ${path} images? This pushes a file to Workerbee object storage.`)) return
        setBusy('upload')
        try {
            const form = new FormData()
            form.append('image', file)
            const result = await queenbeeRequest<{ image?: string; name?: string }>({ service: 'workerbee', path: `images/${path}`, method: 'POST', data: form, timeoutMs: 30000 })
            const name = result?.name || file.name
            setImages((current) => current.includes(name) ? current : [name, ...current])
            onMessage(`Uploaded ${name}. Use it in ${imageFields.map((field) => field.label).join(' or ')}.`)
        } catch (error) {
            onMessage(error instanceof Error ? error.message : `Unable to upload ${path} image.`)
        } finally {
            setBusy('')
        }
    }

    async function deleteImage(name: string) {
        if (!window.confirm(`Delete ${name} from ${path} media? This removes the live file.`)) return
        setBusy(`delete-${name}`)
        try {
            await queenbeeRequest({ service: 'workerbee', path: `images/${path}/${encodeURIComponent(name)}`, method: 'DELETE' })
            setImages((current) => current.filter((image) => image !== name))
            onMessage(`Deleted ${name}.`)
        } catch (error) {
            onMessage(error instanceof Error ? error.message : `Unable to delete ${name}.`)
        } finally {
            setBusy('')
        }
    }

    return (
        <div className="media-upload-panel editor-media-tools">
            <div>
                <h3>{path} media</h3>
                <p>Upload, list, and delete images used by this Queenbee page.</p>
            </div>
            <label className="file-picker">
                <Upload size={16} />
                <span>{file ? file.name : 'Choose image'}</span>
                <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
            <button type="button" disabled={!hasQueenbeeAuthSource() || busy === 'upload' || !file} onClick={uploadImage}>Upload</button>
            <button type="button" disabled={!hasQueenbeeAuthSource() || busy === 'load'} onClick={loadImages}>List existing</button>
            {images.length ? <div className="media-chip-list">{images.slice(0, 18).map((name) => <span key={name}>{name}<button type="button" disabled={busy === `delete-${name}`} onClick={() => void deleteImage(name)}><X size={12} /></button></span>)}</div> : null}
        </div>
    )
}

function EditorInput({ field, row }: { field: EditorField; row: EditableRow | null }) {
    const value = row ? row[field.name] : undefined
    const label = <span>{field.label}{field.required ? <b>*</b> : null}</span>
    if (field.type === 'boolean') {
        const defaultChecked = value === undefined ? field.name === 'visible' || field.name === 'active' : Boolean(value)
        return <label className="editor-check">{label}<input name={field.name} type="checkbox" defaultChecked={defaultChecked} /></label>
    }
    if (field.type === 'textarea' || field.type === 'json') {
        return <label className="editor-field">{label}<textarea name={field.name} required={field.required} placeholder={field.placeholder} defaultValue={field.type === 'json' ? jsonEditorValue(value) : stringValue(value)} /></label>
    }
    if (field.name === 'time_type') {
        return <label className="editor-field">{label}<select name={field.name} required={field.required} defaultValue={stringValue(value) || 'default'}><option value="default">default</option><option value="no_end">no_end</option><option value="whole_day">whole_day</option><option value="tbd">tbd</option></select></label>
    }
    if (field.name === 'repeat_type') {
        return <label className="editor-field">{label}<select name={field.name} defaultValue=""><option value="">none</option><option value="weekly">weekly</option><option value="biweekly">biweekly</option></select></label>
    }
    return <label className="editor-field">{label}<input name={field.name} type={field.type === 'number' ? 'number' : field.type === 'datetime' ? 'datetime-local' : 'text'} required={field.required} placeholder={field.placeholder} defaultValue={field.type === 'datetime' ? dateInputValue(value) : stringValue(value)} /></label>
}

function buildEditorPayload(fields: EditorField[], form: FormData) {
    return fields.reduce<Record<string, unknown>>((payload, field) => {
        if (field.type === 'boolean') {
            payload[field.name] = form.get(field.name) === 'on'
            return payload
        }
        const raw = String(form.get(field.name) || '').trim()
        if (!raw && !field.required) return payload
        if (field.type === 'number') payload[field.name] = raw ? Number(raw) : null
        else if (field.type === 'json') payload[field.name] = parseEditorJson(raw)
        else payload[field.name] = raw
        return payload
    }, {})
}

function parseEditorJson(value: string) {
    if (!value) return null
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

function jsonEditorValue(value: unknown) {
    if (value === undefined || value === null || value === '') return ''
    if (typeof value === 'string') return value
    return JSON.stringify(value, null, 2)
}

function dateInputValue(value: unknown) {
    const raw = stringValue(value)
    if (!raw) return ''
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) return raw
    return date.toISOString().slice(0, 16)
}

function PartnersPage({ data }: { data: DashboardData }) {
    return <PagePanel title="For Companies" status={data.health['companies-text']}><CompaniesContent data={data} /></PagePanel>
}

function AboutPage() {
    const committees = aboutText.committeeSection.info
    const programmes = [
        { title: 'Bachelor', rows: Object.values(aboutText.bachelor) },
        { title: 'Master', rows: Object.values(aboutText.master) },
        { title: 'PhD', rows: Object.values(aboutText.phd) },
    ]

    return (
        <PagePanel title="About Login" status="live">
            <section className="docs-card">
                <h3>{aboutText.title}</h3>
                <p>{aboutText.intro}</p>
            </section>
            <div className="queenbee-grid">
                {programmes.map((group) => (
                    <article className="queenbee-card" key={group.title}>
                        <UsersRound size={18} />
                        <h3>{group.title}</h3>
                        <p>{group.rows.join(' · ')}</p>
                        <span>Automatic Login membership</span>
                    </article>
                ))}
            </div>
            <section className="docs-card">
                <h3>{aboutText.about.title}</h3>
                <p>{aboutText.about.intro}</p>
                <p>{aboutText.about.body.p1}</p>
                <p>{aboutText.about.body.p2}</p>
            </section>
            <section className="docs-card">
                <h3>{aboutText.committeeSection.title}</h3>
                <p>{aboutText.committeeSection.intro}</p>
                <div className="committee-grid">
                    {committees.map((committee) => (
                        <article className="queenbee-card" key={committee.id}>
                            <Handshake size={18} />
                            <h3>{committee.title}</h3>
                            <p>{committee.description}</p>
                            <span>{committee.quote || 'Login committee'}</span>
                        </article>
                    ))}
                </div>
            </section>
            <div className="editor-toolbar">
                <button onClick={() => openInAppBrowser('https://wiki.login.no')}>Open public docs <ExternalLink size={14} /></button>
                <button onClick={() => openInAppBrowser('https://login.no')}>Open login.no <ExternalLink size={14} /></button>
            </div>
        </PagePanel>
    )
}

function VervPage() {
    const text = enText.verv
    const [activeCommittee, setActiveCommittee] = useState(text.committees[0]?.id || '')
    const committee = text.committees.find((item) => item.id === activeCommittee) || text.committees[0]
    const leader = committee ? text.leaderData[committee.leaderKey as keyof typeof text.leaderData] : null
    const leaderTitle = committee ? text.leaders[committee.leaderKey as keyof typeof text.leaders] : ''

    return (
        <PagePanel title="Verv" status="live">
            <section className="docs-card">
                <h3>{text.title}</h3>
                <p>{text.intro}</p>
                <p>{text.intro2}</p>
            </section>
            <div className="verv-photo-rail">
                {text.photos.map((photo) => (
                    <article key={photo.image}>
                        <img src={`https://cdn.login.no/img/imagecarousel/${photo.image}`} alt="" />
                        <strong>{photo.title}</strong>
                        <span>{photo.description}</span>
                    </article>
                ))}
            </div>
            <section className="docs-card">
                <h3>{text.committeeTitle}</h3>
                <p>{text.committeeIntro}</p>
                <div className="docs-chip-grid">
                    {text.committees.map((item) => (
                        <button key={item.id} className={item.id === activeCommittee ? 'active-chip' : ''} onClick={() => setActiveCommittee(item.id)}>{item.title}</button>
                    ))}
                </div>
                {committee ? (
                    <article className="verv-leader-card">
                        <div>
                            <h3>{committee.title}</h3>
                            <p>{committee.intro}</p>
                            <p>{committee.body}</p>
                        </div>
                        <div className="leader-lockup">
                            {leader?.image ? <img src={`https://cdn.login.no/img/board/portraits/2026/${leader.image}`} alt="" /> : <span>{(leader?.name || committee.title).slice(0, 1)}</span>}
                            <strong>{leader?.name || committee.title}</strong>
                            <small>{leaderTitle}{leader?.discord ? ` · ${leader.discord}` : ''}</small>
                        </div>
                    </article>
                ) : null}
            </section>
            <section className="docs-card">
                <h3>{text.apply.title}</h3>
                <p>{text.apply.body}</p>
                <button onClick={() => openInAppBrowser('https://forms.gle/nQrJuqo3C9URLRM29')}>{text.apply.action} <ExternalLink size={14} /></button>
            </section>
        </PagePanel>
    )
}

function PolicyPage() {
    const text = enText.policy
    return (
        <PagePanel title="Privacy Policy" status="live">
            <section className="docs-card">
                <h3>{text.title}</h3>
                <p>{text.organization}</p>
            </section>
            <div className="queenbee-grid">
                {text.sections.map((section) => (
                    <article className="queenbee-card" key={section.title}>
                        <ShieldCheck size={18} />
                        <h3>{section.title}</h3>
                        <p>{section.body}</p>
                        <span>Login app policy</span>
                    </article>
                ))}
            </div>
            <section className="docs-card">
                <p>{text.download}</p>
                <button onClick={() => openInAppBrowser('mailto:kontakt@login.no')}>kontakt@login.no</button>
            </section>
        </PagePanel>
    )
}

function FundPage({ data }: { data: DashboardData }) {
    const fundText = enText.fund
    const holdings = data.fund.holdings
    const history = data.fund.history
    const points = history?.points || []
    const first = points[0]?.totalBase
    const last = points[points.length - 1]?.totalBase
    const delta = typeof first === 'number' && typeof last === 'number' ? last - first : null
    const status = combinedStatus(data.health, ['fund-holdings', 'fund-history'])

    return (
        <PagePanel title="Login Fund" status={status}>
            <div className="queenbee-grid">
                <article className="music-stat-card">
                    <span>{fundText.holdings.title}</span>
                    <strong>{holdings ? formatCurrency(holdings.totalBase) : 'Unavailable'}</strong>
                    <small>{holdings?.updatedAt ? `${fundText.holdings.updated} ${new Date(holdings.updatedAt).toLocaleString('no-NO')}` : 'Public fund endpoint'}</small>
                </article>
                <article className="music-stat-card">
                    <span>{fundText.holdings.change}</span>
                    <strong>{delta === null ? 'No history' : formatSignedCurrency(delta)}</strong>
                    <small>{points.length ? `${points.length} points in the last month` : fundText.holdings.empty}</small>
                </article>
                <article className="queenbee-card">
                    <Scale size={18} />
                    <h3>{fundText.support.title}</h3>
                    <p>{fundText.support.intro}</p>
                    <span>{fundText.support.period}</span>
                </article>
            </div>
            <section className="docs-card">
                <h3>{fundText.holdings.history}</h3>
                {points.length ? <FundSparkline points={points} /> : <EmptyState icon={<Scale />} label={fundText.holdings.empty} />}
            </section>
            <div className="queenbee-grid">
                {fundText.sections.map((section) => (
                    <article className="queenbee-card" key={section.title}>
                        <FileText size={18} />
                        <h3>{section.title}</h3>
                        <p>{section.body}</p>
                        <span>Login Fund</span>
                    </article>
                ))}
                <button className="queenbee-card" onClick={() => openInAppBrowser('mailto:fondet@login.no')}>
                    <SendHorizontal size={18} />
                    <h3>Apply or ask</h3>
                    <p>{fundText.support.apply}</p>
                    <span>fondet@login.no</span>
                </button>
            </div>
        </PagePanel>
    )
}

function FundSparkline({ points }: { points: NonNullable<DashboardData['fund']['history']>['points'] }) {
    const width = 720
    const height = 150
    const values = points.map((point) => point.totalBase)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const spread = max - min || 1
    const coordinates = points.map((point, index) => {
        const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width
        const y = 16 + ((max - point.totalBase) / spread) * (height - 32)
        return `${x},${y}`
    }).join(' ')

    return (
        <svg className="fund-sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Fund holdings history">
            <defs>
                <linearGradient id="fundLine" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#f58b45" />
                    <stop offset="100%" stopColor="#ffd0a8" />
                </linearGradient>
            </defs>
            <polyline points={coordinates} fill="none" stroke="url(#fundLine)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function GamesPage({ data }: { data: DashboardData }) {
    const gamesText = enText.games
    return (
        <PagePanel title="Games" status={data.health.games}>
            <div className="queenbee-grid">
                <article className="queenbee-card">
                    <Sparkles size={18} />
                    <h3>{gamesText.diceTitle}</h3>
                    <p>{gamesText.diceBody}</p>
                    <span>{gamesText.featured}</span>
                </article>
                {data.games.map((game) => (
                    <article className="queenbee-card" key={game.id}>
                        <Sparkles size={18} />
                        <h3>{game.name}</h3>
                        <p>{game.description_en || game.description_no || gamesText.communityDeck}</p>
                        <span>{game.endpoint || gamesText.tapToOpen}</span>
                    </article>
                ))}
                {data.health.games === 'live' && !data.games.length ? <EmptyState icon={<Sparkles />} label="No games returned from App API." /> : null}
            </div>
            <div className="editor-toolbar">
                <button onClick={() => openInAppBrowser('https://login.no/app')}>Open Nucleus app <ExternalLink size={14} /></button>
                <button onClick={() => openInAppBrowser('https://app.login.no/api/games')}>Inspect App API <ExternalLink size={14} /></button>
            </div>
        </PagePanel>
    )
}

function PwnedPage() {
    const pwnedText = enText.pwned
    const memes = pwnedText.pwned
    const [secondsElapsed, setSecondsElapsed] = useState(1)
    const [memeIndex, setMemeIndex] = useState(() => Math.floor(Math.random() * memes.length))
    const meme = memes[memeIndex] || memes[0]

    useEffect(() => {
        const startedAt = Date.now()
        const timer = window.setInterval(() => {
            setSecondsElapsed(Math.max(1, Math.floor((Date.now() - startedAt) / 1000)))
        }, 1000)
        return () => window.clearInterval(timer)
    }, [])

    return (
        <PagePanel title="Pwned" status="live">
            <section className="docs-card pwned-card">
                <h3>{meme.text}</h3>
                <img src={`https://cdn.login.no/img/pwned/${meme.image}`} alt="" />
                <p>{pwnedText.text.replace('{time}', `${secondsElapsed} ${secondsElapsed === 1 ? pwnedText.second : pwnedText.seconds}`)}</p>
                <button onClick={() => setMemeIndex((current) => (current + 1) % memes.length)}>{pwnedText.shuffle}</button>
            </section>
        </PagePanel>
    )
}

function MusicPage({ data }: { data: DashboardData }) {
    return <PagePanel title="Login Music" status={data.health.music}><MusicContent data={data} /></PagePanel>
}

function StatusPage({ data }: { data: DashboardData }) {
    return <PagePanel title="Service Status" status={data.health.status}><StatusList services={data.statusServices} status={data.health.status} expanded /></PagePanel>
}

function InternalPage({ data }: { data: DashboardData }) {
    return (
        <div className="dashboard-grid">
            <EndpointStrip data={data} />
            <section className="panel full-span"><PanelTitle title="Queenbee Internal Overview" subtitle="Live /dashboard/internal" /><InternalOverview data={data.internal} health={data.health} /></section>
        </div>
    )
}

function NucleusAdminPage({ data, queenbeeLoggedIn }: { data: DashboardData; queenbeeLoggedIn: boolean }) {
    const [formValues, setFormValues] = useState({ title: '', body: '', topic: 'maintenance', screen: '', scheduledAt: '' })
    const [history, setHistory] = useState<AppNotification[]>([])
    const [scheduled, setScheduled] = useState<ScheduledNotification[]>([])
    const [message, setMessage] = useState('Ready to manage Nucleus notifications.')
    const [busy, setBusy] = useState('')
    const authReady = queenbeeLoggedIn
    const status: ServiceStatus = authReady ? 'live' : 'locked'

    async function loadHistory() {
        if (!authReady) {
            setHistory([])
            setMessage('Authenticate with Queenbee to load notification history.')
            return
        }
        setBusy('history')
        try {
            const result = await queenbeeWebRequest<AppNotification[]>({ path: 'api/notification/history?limit=12' })
            setHistory(Array.isArray(result) ? result : [])
            setMessage(`Loaded ${Array.isArray(result) ? result.length : 0} sent notifications.`)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to load notification history.')
        } finally {
            setBusy('')
        }
    }

    async function loadScheduled() {
        if (!authReady) {
            setScheduled([])
            setMessage('Authenticate with Queenbee to load scheduled notifications.')
            return
        }
        setBusy('scheduled')
        try {
            const result = await queenbeeWebRequest<ScheduledNotification[]>({ path: 'api/notification/scheduled?limit=12' })
            setScheduled(Array.isArray(result) ? result : [])
            setMessage(`Loaded ${Array.isArray(result) ? result.length : 0} scheduled notifications.`)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to load scheduled notifications.')
        } finally {
            setBusy('')
        }
    }

    useEffect(() => {
        if (!authReady) return
        void loadHistory()
        void loadScheduled()
    }, [authReady])

    async function pushNotification(schedule: boolean) {
        if (!authReady) {
            setMessage('Authenticate with Queenbee before sending notifications.')
            return
        }
        if (!formValues.title || !formValues.body) {
            setMessage('Title and body are required.')
            return
        }
        if (schedule && !formValues.scheduledAt) {
            setMessage('Choose a schedule time first.')
            return
        }
        const action = schedule ? 'schedule this Nucleus push notification' : 'send this Nucleus push notification now'
        if (!window.confirm(`Confirm ${action} to topic "${formValues.topic || 'maintenance'}"? This may notify subscribed app users.`)) return
        setBusy(schedule ? 'schedule-submit' : 'send')
        try {
            const payload = {
                title: formValues.title,
                body: formValues.body,
                topic: formValues.topic || 'maintenance',
                data: normalizeNotificationScreen(formValues.screen),
                ...(schedule ? { scheduledAt: new Date(formValues.scheduledAt).toISOString() } : {}),
            }
            await queenbeeWebRequest({
                path: schedule ? 'api/notification/scheduled' : 'api/notification',
                method: 'POST',
                data: schedule ? payload : {
                    title: formValues.title,
                    description: formValues.body,
                    screen: formValues.screen,
                    topic: formValues.topic || 'maintenance',
                },
                timeoutMs: 15000,
            })
            setMessage(schedule ? 'Notification scheduled.' : 'Notification sent.')
            await Promise.all([loadHistory(), loadScheduled()])
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Notification request failed.')
        } finally {
            setBusy('')
        }
    }

    async function runScheduled(item: ScheduledNotification) {
        if (!authReady) {
            setMessage('Authenticate with Queenbee before sending scheduled notifications.')
            return
        }
        if (!window.confirm(`Send scheduled notification "${item.title}" now? This may notify subscribed app users.`)) return
        setBusy(`run-${item.id}`)
        try {
            await queenbeeWebRequest({ path: `api/notification/scheduled/${item.id}/send`, method: 'POST', timeoutMs: 15000 })
            setMessage('Scheduled notification sent.')
            await Promise.all([loadHistory(), loadScheduled()])
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to send scheduled notification.')
        } finally {
            setBusy('')
        }
    }

    async function cancelScheduled(item: ScheduledNotification) {
        if (!authReady) {
            setMessage('Authenticate with Queenbee before cancelling scheduled notifications.')
            return
        }
        if (!window.confirm(`Cancel scheduled notification "${item.title}"?`)) return
        setBusy(`cancel-${item.id}`)
        try {
            await queenbeeWebRequest({ path: `api/notification/scheduled/${item.id}`, method: 'DELETE' })
            setMessage('Scheduled notification cancelled.')
            await loadScheduled()
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to cancel scheduled notification.')
        } finally {
            setBusy('')
        }
    }

    async function resendHistory(item: AppNotification) {
        if (!authReady) {
            setMessage('Authenticate with Queenbee before resending notifications.')
            return
        }
        if (!window.confirm(`Resend notification "${item.title}" to topic "${item.topic}"? This may notify subscribed app users.`)) return
        setBusy(`resend-${item.id}`)
        try {
            await queenbeeWebRequest({ path: `api/notification/resend/${item.id}`, method: 'POST', timeoutMs: 15000 })
            setMessage('Notification resent.')
            await loadHistory()
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to resend notification.')
        } finally {
            setBusy('')
        }
    }

    return (
        <PagePanel title="Nucleus Admin" status={status}>
            {!authReady ? (
                <div className="locked-notice">
                    <KeyRound size={18} />
                    <span>Authenticate with Queenbee to load notification history, schedule pushes, or send/resend notifications.</span>
                    <button type="button" onClick={openQueenbeeUnlock}><KeyRound size={14} />Login</button>
                </div>
            ) : null}
            <div className="nucleus-admin-layout">
                <form className="mini-admin-form nucleus-send-form" onSubmit={(event) => { event.preventDefault(); void pushNotification(false) }}>
                    <h3>Send notification</h3>
                    <label className="editor-field"><span>Title</span><input value={formValues.title} onChange={(event) => setFormValues({ ...formValues, title: event.target.value })} required /></label>
                    <label className="editor-field"><span>Body</span><textarea value={formValues.body} onChange={(event) => setFormValues({ ...formValues, body: event.target.value })} required /></label>
                    <label className="editor-field"><span>Topic</span><input value={formValues.topic} onChange={(event) => setFormValues({ ...formValues, topic: event.target.value })} /></label>
                    <label className="editor-field"><span>Screen</span><input value={formValues.screen} onChange={(event) => setFormValues({ ...formValues, screen: event.target.value })} placeholder="event:123, ad:456, ai, admin, login" /></label>
                    <label className="editor-field"><span>Schedule for</span><input type="datetime-local" value={formValues.scheduledAt} onChange={(event) => setFormValues({ ...formValues, scheduledAt: event.target.value })} /></label>
                    <div className="editor-actions">
                        <button type="button" onClick={() => setFormValues({ title: 'Welcome to Nucleus', body: 'This is a test push notification.', topic: 'example', screen: 'login', scheduledAt: '' })}><Plus size={14} />Example</button>
                        <button type="submit" disabled={!authReady || busy === 'send'}><Send size={14} />Send</button>
                        <button type="button" disabled={!authReady || busy === 'schedule-submit'} onClick={() => void pushNotification(true)}><CalendarClock size={14} />Schedule</button>
                    </div>
                    <p className="editor-message">{message}</p>
                </form>
                <div className="notification-preview">
                    <span>Nucleus preview</span>
                    <strong>{formValues.title || 'Notification title'}</strong>
                    <p>{formValues.body || 'Notification body preview appears here while you type.'}</p>
                    <small>{formValues.topic || 'maintenance'} · {Object.values(normalizeNotificationScreen(formValues.screen)).join(' / ') || 'NotificationScreen'}</small>
                </div>
            </div>
            <div className="traffic-grid">
                <NotificationList title="Scheduled notifications" icon={<CalendarClock size={16} />} loading={busy === 'scheduled'} isEmpty={!scheduled.length} onRefresh={loadScheduled}>
                    {scheduled.map((item) => (
                        <article className="notification-row" key={item.id}>
                            <div><strong>{item.title}</strong><p>{item.body}</p><span>{item.topic} · {item.status} · {formatDate(item.scheduledAt)}</span>{item.lastError ? <small>{item.lastError}</small> : null}</div>
                            <div className="editor-actions">
                                <button onClick={() => void runScheduled(item)} disabled={busy === `run-${item.id}`}><SendHorizontal size={14} />Send now</button>
                                {item.status !== 'cancelled' && item.status !== 'sent' ? <button className="danger-action" onClick={() => void cancelScheduled(item)} disabled={busy === `cancel-${item.id}`}><Trash2 size={14} />Cancel</button> : null}
                            </div>
                        </article>
                    ))}
                </NotificationList>
                <NotificationList title="Recent notifications" icon={<Bell size={16} />} loading={busy === 'history'} isEmpty={!history.length} onRefresh={loadHistory}>
                    {history.map((item) => (
                        <article className="notification-row" key={item.id}>
                            <div><strong>{item.title}</strong><p>{item.body}</p><span>{item.topic} · delivered {item.delivered ?? 0} · failed {item.failed ?? 0}</span>{item.sentAt ? <small>{formatDate(item.sentAt)}</small> : null}</div>
                            <button onClick={() => void resendHistory(item)} disabled={busy === `resend-${item.id}`}><SendHorizontal size={14} />Resend</button>
                        </article>
                    ))}
                </NotificationList>
            </div>
            <div className="editor-toolbar">
                <button onClick={() => openInAppBrowser('https://queenbee.login.no/nucleus')}>Open Queenbee Nucleus <ExternalLink size={14} /></button>
                <button onClick={() => openInAppBrowser('https://queenbee.login.no/nucleus/documentation')}>Documentation <ExternalLink size={14} /></button>
            </div>
        </PagePanel>
    )
}

function normalizeNotificationScreen(screen: string) {
    const value = screen.trim()
    const lower = value.toLowerCase()
    if (!value) return {}
    if (lower.startsWith('event:')) return { target: 'event', id: value.split(':')[1] || '' }
    if (lower.startsWith('ad:')) return { target: 'ad', id: value.split(':')[1] || '' }
    if (lower.startsWith('menu:')) return { target: 'menu', screen: value.split(':')[1] || 'NotificationScreen' }
    if (lower === 'ai') return { target: 'menu', screen: 'AiScreen' }
    if (lower === 'admin') return { target: 'menu', screen: 'AdminScreen' }
    if (lower === 'login') return { target: 'menu', screen: 'LoginScreen' }
    return { target: 'menu', screen: 'NotificationScreen' }
}

function NotificationList({
    title,
    icon,
    loading,
    isEmpty,
    onRefresh,
    children,
}: {
    title: string
    icon: React.ReactNode
    loading: boolean
    isEmpty: boolean
    onRefresh: () => void
    children: React.ReactNode
}) {
    return (
        <section className="notification-panel">
            <div className="notification-panel-head">
                <div>{icon}<h3>{title}</h3></div>
                <button onClick={() => void onRefresh()}><RefreshCcw className={loading ? 'spin' : ''} size={14} />Refresh</button>
            </div>
            <div className="notification-list">{isEmpty ? <EmptyState icon={<Bell />} label="No notifications returned." /> : children}</div>
        </section>
    )
}

function NucleusDocsPage() {
    const topics = ['TEKKOM', 'SOCIAL', 'CTF', 'KARRIEREDAG', 'FADDERUKA', 'BEDPRES', 'LOGIN', 'ANNET']
    return (
        <PagePanel title="Nucleus Documentation" status="live">
            <div className="docs-card">
                <h3>Varslinger (Push Notifications)</h3>
                <p>Varslinger skal brukes like forsiktig som <code>@everyone</code> i Discord. Keep topics, intervals, and language prefixes consistent before scheduling push notifications.</p>
                <h4>Topics</h4>
                <div className="docs-chip-grid">{topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
                <h4>Intervals</h4>
                <p><code>10m, 30m, 1h, 2h, 3h, 6h, 1d, 2d, 1w</code></p>
                <h4>Prefixes</h4>
                <div className="queenbee-grid">
                    <article className="queenbee-card"><FileText size={18} /><h3>Language</h3><p><code>n</code> for Norwegian, <code>e</code> for English.</p></article>
                    <article className="queenbee-card"><Megaphone size={18} /><h3>Ads</h3><p><code>a</code> after language prefix marks ad-style notification content.</p></article>
                </div>
                <button onClick={() => openInAppBrowser('https://queenbee.login.no/nucleus/documentation')}>Open Queenbee docs <ExternalLink size={14} /></button>
            </div>
        </PagePanel>
    )
}

function LoadBalancingPage({ data }: { data: DashboardData }) {
    return (
        <PagePanel title="Load Balancing" status={data.health.sites}>
            <QueenbeeStatusBanner status={data.health.sites} path="/sites" />
            {data.health.sites === 'live' && data.queenbee.sites.length ? (
                <div className="queenbee-grid">
                    {data.queenbee.sites.map((site, index) => (
                        <article className="queenbee-card" key={site.id || site.domain || index}>
                            <Scale size={18} />
                            <h3>{site.name || site.domain || `Site ${index + 1}`}</h3>
                            <p>{site.domain || site.ip || site.status || 'No public hostname returned.'}</p>
                            <span>{site.primary ? 'Primary' : site.enabled === false ? 'Disabled' : 'Available'}</span>
                            {site.id ? <InternalActionButton label="Make primary" path={`site/primary/${site.id}`} method="GET" confirm={`Switch primary load-balancer site to ${site.name || site.domain || site.id}?`} /> : null}
                        </article>
                    ))}
                </div>
            ) : data.health.sites === 'live' ? <EmptyState icon={<Scale />} label="No load-balancer sites are currently returned by Beekeeper." /> : null}
        </PagePanel>
    )
}

function DatabasesPage({ data }: { data: DashboardData }) {
    return (
        <PagePanel title="Databases" status={data.health.db}>
            <QueenbeeStatusBanner status={data.health.db} path="/db" />
            <div className="editor-toolbar">
                <InternalActionButton label="Run backups" path="backup" confirm="Trigger all configured database backups?" />
                <button onClick={() => openInAppBrowser('https://queenbee.login.no/internal/db/restore')}>Restore browser <ExternalLink size={14} /></button>
            </div>
            {data.health.db === 'live' ? <DatabaseOverview value={data.queenbee.databases} /> : <ProtectedQueenbeeGrid />}
        </PagePanel>
    )
}

function DatabaseOverview({ value }: { value: unknown }) {
    const overview = value && typeof value === 'object' ? value as Record<string, unknown> : null
    const clusters = Array.isArray(overview?.clusters) ? overview.clusters as Array<Record<string, unknown>> : []
    if (!overview) return <EmptyState icon={<Database />} label="No database overview returned." />
    return (
        <div className="traffic-grid">
            <article className="music-stat-card"><span>Clusters</span><strong>{formatNumber(overview.clusterCount as number | string)}</strong><small>Database clusters</small></article>
            <article className="music-stat-card"><span>Databases</span><strong>{formatNumber(overview.databaseCount as number | string)}</strong><small>Total discovered</small></article>
            <article className="music-stat-card"><span>Active queries</span><strong>{formatNumber(overview.activeQueries as number | string)}</strong><small>Current load</small></article>
            {clusters.map((cluster, index) => <article className="queenbee-card" key={String(cluster.id || index)}><Database size={18} /><h3>{String(cluster.name || cluster.id || `Cluster ${index + 1}`)}</h3><p>{formatNumber(cluster.databaseCount as number | string)} databases</p><span>{cluster.error ? String(cluster.error) : 'Operational'}</span></article>)}
            {!clusters.length ? <JsonPreview value={value} /> : null}
        </div>
    )
}

function MonitoringPage({ data }: { data: DashboardData }) {
    const [serviceQuery, setServiceQuery] = useState('')
    const filteredServices = data.statusServices.filter((service) => `${service.name} ${service.url || ''} ${service.id}`.toLowerCase().includes(serviceQuery.toLowerCase()))
    return (
        <PagePanel title="Monitoring" status={data.health.status}>
            <div className="traffic-grid">
                <InternalMiniForm
                    title="Create service"
                    path="monitoring"
                    confirm="Create a new monitored service?"
                    fields={[
                        { name: 'name', label: 'Name', required: true },
                        { name: 'url', label: 'URL', required: true },
                        { name: 'interval', label: 'Interval seconds', type: 'number' },
                        { name: 'timeout', label: 'Timeout seconds', type: 'number' },
                        { name: 'notification', label: 'Notification ID', type: 'number' },
                        { name: 'enabled', label: 'Enabled', type: 'boolean' },
                    ]}
                />
                <InternalMiniForm
                    title="Create notification"
                    path="monitoring/notification"
                    confirm="Create a new monitoring notification webhook?"
                    fields={[
                        { name: 'name', label: 'Name', required: true },
                        { name: 'message', label: 'Message', type: 'textarea', required: true },
                        { name: 'webhook', label: 'Webhook URL', required: true },
                    ]}
                />
                <InternalMiniForm
                    title="Create tag"
                    path="monitoring/tag"
                    confirm="Create a new monitoring tag?"
                    fields={[
                        { name: 'name', label: 'Name', required: true },
                        { name: 'color', label: 'Color', required: true, placeholder: '#f58b45' },
                    ]}
                />
            </div>
            <div className="queenbee-grid">
                <article className="queenbee-card"><Bell size={18} /><h3>Notifications</h3><p>{data.queenbee.monitoringNotifications.length} routes configured</p><span>{data.health['monitoring-notifications'] || 'unknown'}</span></article>
                <article className="queenbee-card"><FileText size={18} /><h3>Tags</h3><p>{data.queenbee.monitoringTags.map((tag) => tag.name).filter(Boolean).join(', ') || 'No tags loaded'}</p><span>{data.health['monitoring-tags'] || 'unknown'}</span></article>
            </div>
            <label className="editor-field editor-search"><span>Search services</span><input value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder="Filter monitoring services" /></label>
            <div className="service-admin-list">
                {filteredServices.map((service) => <MonitoringServiceCard key={service.id} service={service} />)}
            </div>
        </PagePanel>
    )
}

function MonitoringServiceCard({ service }: { service: DashboardData['statusServices'][number] }) {
    const [editing, setEditing] = useState(false)
    const latest = service.bars?.[0]
    const up = latest?.status === true || latest?.status === 1
    const record = service as EditableRow
    return (
        <article className="service-admin-card">
            <div>
                <span className={up ? 'status-light up' : 'status-light'} />
                <strong>{service.name}</strong>
                <small>{service.url || `Service #${service.id}`}</small>
            </div>
            <div className="service-admin-meta">
                <span>{latest?.delay ? `${Math.round(latest.delay)} ms` : 'waiting'}</span>
                <span>{up ? 'UP' : 'CHECK'}</span>
            </div>
            <div className="editor-actions">
                <button onClick={() => setEditing((value) => !value)}><Pencil size={14} />{editing ? 'Close edit' : 'Edit'}</button>
                <InternalActionButton label="Delete service" path={`monitoring/${service.id}`} method="DELETE" dangerous confirm={`Delete monitoring service ${service.name}?`} />
                <button onClick={() => openInAppBrowser(`https://queenbee.login.no/internal/monitoring?service=${service.id}`)}>Queenbee <ExternalLink size={14} /></button>
            </div>
            {editing ? (
                <InternalMiniForm
                    title={`Update ${service.name}`}
                    path={`monitoring/${service.id}`}
                    method="PUT"
                    confirm={`Update monitoring service ${service.name}?`}
                    defaults={record}
                    fields={[
                        { name: 'name', label: 'Name', required: true },
                        { name: 'type', label: 'Type', required: true },
                        { name: 'url', label: 'URL' },
                        { name: 'interval', label: 'Interval seconds', type: 'number' },
                        { name: 'port', label: 'TCP port', type: 'number' },
                        { name: 'userAgent', label: 'User agent' },
                        { name: 'maxConsecutiveFailures', label: 'Max consecutive failures', type: 'number' },
                        { name: 'note', label: 'Note', type: 'textarea' },
                        { name: 'notification', label: 'Notification ID', type: 'number' },
                        { name: 'expectedDown', label: 'Expected down', type: 'boolean' },
                        { name: 'upsideDown', label: 'Upside down', type: 'boolean' },
                        { name: 'enabled', label: 'Enabled', type: 'boolean' },
                    ]}
                />
            ) : null}
        </article>
    )
}

function ServicesPage({ data }: { data: DashboardData }) {
    const containers = data.queenbee.docker?.containers || []
    const [query, setQuery] = useState('')
    const filteredContainers = containers.filter((container) => `${container.name || ''} ${container.image || ''} ${container.status || ''} ${container.state || ''}`.toLowerCase().includes(query.toLowerCase()))
    return (
        <PagePanel title="Services" status={data.health.docker}>
            <QueenbeeStatusBanner status={data.health.docker} path="/docker" />
            <label className="editor-field editor-search"><span>Search containers</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter services and containers" /></label>
            {data.health.docker === 'live' && filteredContainers.length ? (
                <div className="queenbee-grid">
                    {filteredContainers.map((container) => {
                        const deployment = (container as Record<string, unknown>).deployment as Record<string, unknown> | undefined
                        return (
                        <article className="queenbee-card" key={container.id || container.name || container.image}>
                            <Server size={18} />
                            <h3>{container.name || container.image || 'Container'}</h3>
                            <p>{container.image || 'No image returned.'}</p>
                            <span>{container.state || container.status || 'unknown'}{deployment?.updateAvailable ? ' · update available' : ''}</span>
                            {container.id ? (
                                <div className="editor-actions">
                                    <InternalActionButton label="Deploy update" path={`deployments/${container.id}/run`} confirm={`Run deployment for ${container.name || container.id}?`} />
                                    <InternalActionButton label="Enable auto" path={`deployments/${container.id}/auto`} method="PUT" data={{ enabled: true }} confirm={`Enable auto deploy for ${container.name || container.id}?`} />
                                    <InternalActionButton label="Delete" path={`docker/${container.id}`} method="DELETE" dangerous confirm={`Delete container ${container.name || container.id}?`} />
                                    <button onClick={() => openInAppBrowser(`https://queenbee.login.no/internal/services/${container.id}`)}>Details <ExternalLink size={14} /></button>
                                </div>
                            ) : null}
                        </article>
                    )})}
                </div>
            ) : data.health.docker === 'live' ? <EmptyState icon={<Server />} label="No Docker containers matched." /> : <ProtectedQueenbeeGrid />}
        </PagePanel>
    )
}

function ServiceDetailPage({ data }: { data: DashboardData }) {
    const containers = data.queenbee.docker?.containers || []
    const [selectedId, setSelectedId] = useState(String(containers[0]?.id || containers[0]?.name || ''))
    const [manualId, setManualId] = useState('')
    const [fetchedDetail, setFetchedDetail] = useState<unknown>(null)
    const [detailMessage, setDetailMessage] = useState('Select a loaded container or fetch a protected container id.')
    const selected = containers.find((container) => String(container.id || container.name || '') === selectedId) || containers[0]
    const deployment = selected ? (selected as Record<string, unknown>).deployment as Record<string, unknown> | undefined : undefined

    async function fetchDetail(event: React.FormEvent) {
        event.preventDefault()
        if (!manualId.trim()) return
        setDetailMessage('Loading container detail...')
        try {
            const result = await queenbeeRequest<unknown>({ service: 'beekeeper', path: `docker/${manualId.trim()}`, method: 'GET', timeoutMs: 15000 })
            setFetchedDetail(result)
            setDetailMessage('Container detail loaded.')
        } catch (error) {
            setDetailMessage(error instanceof Error ? error.message : 'Unable to load container detail.')
        }
    }

    return (
        <PagePanel title="Service Detail" status={data.health.docker}>
            <QueenbeeStatusBanner status={data.health.docker} path="/docker" />
            <form className="mini-admin-form inline" onSubmit={fetchDetail}>
                <h3>Inspect container</h3>
                <label className="editor-field"><span>Container ID</span><input value={manualId} onChange={(event) => setManualId(event.target.value)} /></label>
                <button type="submit" disabled={!hasQueenbeeAuthSource()}><RefreshCcw size={14} />Load detail</button>
                <button type="button" disabled={!manualId} onClick={() => openInAppBrowser(`https://queenbee.login.no/internal/services/${manualId}`)}>Queenbee <ExternalLink size={14} /></button>
            </form>
            <p className="editor-message">{detailMessage}</p>
            {fetchedDetail ? <JsonPreview value={fetchedDetail} /> : null}
            {data.health.docker === 'live' && containers.length ? (
                <>
                    <label className="editor-field editor-search">
                        <span>Service</span>
                        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                            {containers.map((container) => {
                                const id = String(container.id || container.name || container.image)
                                return <option key={id} value={id}>{container.name || container.image || id}</option>
                            })}
                        </select>
                    </label>
                    {selected ? (
                        <div className="queenbee-grid">
                            <article className="queenbee-card">
                                <Server size={18} />
                                <h3>{selected.name || selected.image || 'Container'}</h3>
                                <p>{selected.image || 'No image returned.'}</p>
                                <span>{selected.state || selected.status || 'unknown'}</span>
                            </article>
                            <article className="queenbee-card">
                                <Activity size={18} />
                                <h3>Deployment</h3>
                                <p>{deployment?.updateAvailable ? 'Update available' : 'No update flag returned'}</p>
                                <span>{String(deployment?.lastRun || deployment?.updatedAt || '')}</span>
                            </article>
                            <article className="queenbee-card">
                                <Logs size={18} />
                                <h3>Identifiers</h3>
                                <p>{selected.id || 'No container id'}</p>
                                <span>{selected.name || selected.image || 'Service detail'}</span>
                            </article>
                            <div className="editor-actions full-span">
                                {selected.id ? (
                                    <>
                                        <InternalActionButton label="Deploy update" path={`deployments/${selected.id}/run`} confirm={`Run deployment for ${selected.name || selected.id}?`} />
                                        <InternalActionButton label="Restart" path={`docker/${selected.id}/restart`} method="POST" confirm={`Restart ${selected.name || selected.id}?`} />
                                        <InternalActionButton label="Delete" path={`docker/${selected.id}`} method="DELETE" dangerous confirm={`Delete container ${selected.name || selected.id}?`} />
                                        <button onClick={() => openInAppBrowser(`https://queenbee.login.no/internal/services/${selected.id}`)}>Open Queenbee <ExternalLink size={14} /></button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </>
            ) : data.health.docker === 'live' ? <EmptyState icon={<Server />} label="No Docker containers returned." /> : <ProtectedQueenbeeGrid />}
        </PagePanel>
    )
}

function TrafficPage({ data }: { data: DashboardData }) {
    const [traffic, setTraffic] = useState(data.queenbee.traffic)
    const [trafficMessage, setTrafficMessage] = useState('Showing latest loaded traffic metrics.')

    async function filterTraffic(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const params = new URLSearchParams()
        for (const key of ['domain', 'time_start', 'time_end']) {
            const value = String(form.get(key) || '').trim()
            if (value) params.set(key, value)
        }
        setTrafficMessage('Loading traffic metrics...')
        try {
            const next = await queenbeeRequest<typeof data.queenbee.traffic>({ service: 'beekeeper', path: `traffic/metrics?${params.toString()}`, method: 'GET' })
            setTraffic(next)
            setTrafficMessage('Traffic metrics updated.')
        } catch (error) {
            setTrafficMessage(error instanceof Error ? error.message : 'Unable to load traffic metrics.')
        }
    }

    return (
        <PagePanel title="Traffic" status={data.health.traffic}>
            <QueenbeeStatusBanner status={data.health.traffic} path="/traffic/metrics" />
            <form className="mini-admin-form inline traffic-filter-form" onSubmit={filterTraffic}>
                <h3>Filter metrics</h3>
                <label className="editor-field"><span>Domain</span><input name="domain" list="traffic-domains" /></label>
                <datalist id="traffic-domains">{data.queenbee.trafficDomains.map((domain) => <option key={domain} value={domain} />)}</datalist>
                <label className="editor-field"><span>Start</span><input name="time_start" type="datetime-local" /></label>
                <label className="editor-field"><span>End</span><input name="time_end" type="datetime-local" /></label>
                <button type="submit" disabled={!hasQueenbeeAuthSource()}><RefreshCcw size={14} />Apply</button>
            </form>
            <p className="editor-message">{trafficMessage}</p>
            {data.health.traffic === 'live' && traffic ? (
                <div className="traffic-grid">
                    <article className="music-stat-card"><span>Total requests</span><strong>{formatNumber(traffic.total_requests)}</strong><small>{formatNumber(traffic.error_count)} errors</small></article>
                    <article className="music-stat-card"><span>Error rate</span><strong>{formatPercent(traffic.error_rate)}</strong><small>{Math.round(Number(traffic.avg_response_time || traffic.avg_request_time || 0))} ms avg</small></article>
                    <QueenbeeTopList title="Top domains" rows={traffic.top_domains} />
                    <QueenbeeTopList title="Top paths" rows={traffic.top_paths} />
                    <QueenbeeTopList title="Status codes" rows={traffic.top_status_codes} />
                    <QueenbeeTopList title="Available domains" rows={data.queenbee.trafficDomains.map((domain) => ({ key: domain, count: 0 }))} />
                </div>
            ) : data.health.traffic === 'live' ? <EmptyState icon={<Activity />} label="Traffic metrics endpoint returned no metrics." /> : <ProtectedQueenbeeGrid />}
        </PagePanel>
    )
}

function TrafficRecordsPage({ data }: { data: DashboardData }) {
    const traffic = data.queenbee.traffic
    const [records, setRecords] = useState(data.queenbee.trafficRecords?.result || [])
    const [total, setTotal] = useState(data.queenbee.trafficRecords?.total || records.length)
    const [message, setMessage] = useState('Showing latest traffic records.')

    async function filterRecords(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const params = new URLSearchParams()
        for (const key of ['domain', 'limit', 'page', 'start', 'end']) {
            const value = String(form.get(key) || '').trim()
            if (value) params.set(key, value)
        }
        setMessage('Loading traffic records...')
        try {
            const next = await queenbeeRequest<typeof data.queenbee.trafficRecords>({ service: 'beekeeper', path: `traffic/records?${params.toString()}`, method: 'GET' })
            setRecords(next?.result || [])
            setTotal(next?.total || 0)
            setMessage('Traffic records updated.')
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to load traffic records.')
        }
    }

    return (
        <PagePanel title="Traffic Records" status={data.health['traffic-records'] || data.health.traffic}>
            <QueenbeeStatusBanner status={data.health['traffic-records'] || data.health.traffic} path="/traffic/records" />
            <form className="mini-admin-form inline traffic-filter-form" onSubmit={filterRecords}>
                <h3>Filter records ({formatNumber(total)} total)</h3>
                <label className="editor-field"><span>Domain</span><input name="domain" list="traffic-record-domains" /></label>
                <datalist id="traffic-record-domains">{data.queenbee.trafficDomains.map((domain) => <option key={domain} value={domain} />)}</datalist>
                <label className="editor-field"><span>Limit</span><input name="limit" type="number" defaultValue={13} /></label>
                <label className="editor-field"><span>Page</span><input name="page" type="number" defaultValue={1} /></label>
                <button type="submit" disabled={!hasQueenbeeAuthSource()}><RefreshCcw size={14} />Apply</button>
            </form>
            <p className="editor-message">{message}</p>
            {records.length ? (
                <div className="log-list">
                    {records.map((record, index) => <article className="log-row" key={record.id || index}><span>{record.status || record.method || 'request'}</span><p>{record.domain}{record.path ? ` ${record.path}` : ''}</p><time>{record.timestamp ? formatDate(record.timestamp) : record.request_time ? `${record.request_time} ms` : ''}</time></article>)}
                </div>
            ) : data.health['traffic-records'] === 'live' ? <EmptyState icon={<Logs />} label="No traffic records returned." /> : <ProtectedQueenbeeGrid />}
            {traffic ? <div className="traffic-grid"><QueenbeeTopList title="Top domains" rows={traffic.top_domains} /><QueenbeeTopList title="Top paths" rows={traffic.top_paths} /></div> : null}
        </PagePanel>
    )
}

function TrafficMapPage({ data }: { data: DashboardData }) {
    const records = data.queenbee.trafficRecords?.result || []
    const countries = records.reduce<Record<string, number>>((map, record) => {
        const key = record.country_iso || 'unknown'
        map[key] = (map[key] || 0) + 1
        return map
    }, {})
    const domains = records.reduce<Record<string, number>>((map, record) => {
        const key = record.domain || 'unknown'
        map[key] = (map[key] || 0) + 1
        return map
    }, {})
    const countryRows = Object.entries(countries).sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, count }))
    const domainRows = Object.entries(domains).sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, count }))
    return (
        <PagePanel title="Traffic Map" status={data.health['traffic-records'] || data.health.traffic}>
            <QueenbeeStatusBanner status={data.health['traffic-records'] || data.health.traffic} path="/traffic/map" />
            <div className="traffic-map-panel">
                <Globe2 size={52} />
                <div><strong>{formatNumber(records.length)}</strong><span>recent records mapped locally</span></div>
            </div>
            <div className="traffic-grid">
                <QueenbeeTopList title="Countries" rows={countryRows} />
                <QueenbeeTopList title="Domains" rows={domainRows} />
            </div>
            <button onClick={() => openInAppBrowser('https://queenbee.login.no/internal/traffic/map')}>Open live Queenbee map <ExternalLink size={14} /></button>
        </PagePanel>
    )
}

function BackupsPage({ data }: { data: DashboardData }) {
    const [query, setQuery] = useState('')
    const backups = data.queenbee.backups.filter((backup) => `${backup.name || ''} ${backup.id || ''} ${backup.status || ''}`.toLowerCase().includes(query.toLowerCase()))
    return (
        <PagePanel title="Backups" status={data.health.backups}>
            <QueenbeeStatusBanner status={data.health.backups} path="/backup" />
            <div className="editor-toolbar">
                <InternalActionButton label="Run all backups" path="backup" confirm="Trigger backups for all configured database services?" />
                <button onClick={() => openInAppBrowser('https://queenbee.login.no/internal/db/restore')}>Open restore browser <ExternalLink size={14} /></button>
            </div>
            <InternalMiniForm
                title="Restore backup file"
                path="backup/restore"
                confirm="Restore this database backup? This is a destructive operational action."
                fields={[
                    { name: 'service', label: 'Service', required: true },
                    { name: 'file', label: 'Backup file', required: true },
                ]}
            />
            <label className="editor-field editor-search"><span>Search backups</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter backup services" /></label>
            <div className="queenbee-grid">
                {backups.map((backup, index) => (
                    <article className="queenbee-card" key={backup.id || backup.name || index}>
                        <Database size={18} />
                        <h3>{backup.name || backup.id || `Backup ${index + 1}`}</h3>
                        <p>{backup.status || backup.error || 'Backup service'}</p>
                        <span>{backup.lastBackup ? `Last ${formatDate(backup.lastBackup)}` : backup.nextBackup ? `Next ${formatDate(backup.nextBackup)}` : backup.dbSize || 'No schedule returned'}</span>
                    </article>
                ))}
                {data.health.backups === 'live' && !backups.length ? <EmptyState icon={<Database />} label="No backup services matched." /> : null}
            </div>
        </PagePanel>
    )
}

function DbRestorePage() {
    const [service, setService] = useState('')
    const [date, setDate] = useState('')
    const [files, setFiles] = useState<Array<Record<string, unknown>>>([])
    const [message, setMessage] = useState('Search backup files by service/date.')

    async function loadFiles(event: React.FormEvent) {
        event.preventDefault()
        const params = new URLSearchParams()
        if (service) params.set('service', service)
        if (date) params.set('date', date)
        setMessage('Loading backup files...')
        try {
            const result = await queenbeeRequest<Array<Record<string, unknown>>>({ service: 'beekeeper', path: `backup/files?${params.toString()}`, method: 'GET', timeoutMs: 20000 })
            setFiles(Array.isArray(result) ? result : [])
            setMessage(`Loaded ${Array.isArray(result) ? result.length : 0} files.`)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to load backup files.')
        }
    }

    async function restore(file: Record<string, unknown>) {
        const payload = { service: String(file.service || service), file: String(file.file || file.name || '') }
        if (!payload.service || !payload.file || !window.confirm(`Restore ${payload.file} into ${payload.service}?`)) return
        try {
            await queenbeeRequest({ service: 'beekeeper', path: 'backup/restore', method: 'POST', data: payload, timeoutMs: 30000 })
            setMessage('Restore started.')
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to restore backup.')
        }
    }

    return (
        <PagePanel title="DB Restore" status={hasQueenbeeAuthSource() ? 'live' : 'locked'}>
            <form className="mini-admin-form inline" onSubmit={loadFiles}>
                <h3>Find backup files</h3>
                <label className="editor-field"><span>Service</span><input value={service} onChange={(event) => setService(event.target.value)} /></label>
                <label className="editor-field"><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
                <button type="submit" disabled={!hasQueenbeeAuthSource()}><RefreshCcw size={14} />Load</button>
                <button type="button" onClick={() => openInAppBrowser('https://queenbee.login.no/internal/db/restore')}>Queenbee <ExternalLink size={14} /></button>
            </form>
            <p className="editor-message">{message}</p>
            <div className="queenbee-grid">
                {files.map((file, index) => <article className="queenbee-card" key={`${file.service}-${file.file}-${index}`}><Database size={18} /><h3>{String(file.service || 'service')}</h3><p>{String(file.file || file.name || 'backup file')}</p><span>{String(file.location || file.date || '')}</span><button className="danger-action" onClick={() => restore(file)}>Restore</button></article>)}
                {!files.length ? <EmptyState icon={<Database />} label="No backup files loaded." /> : null}
            </div>
        </PagePanel>
    )
}

function VulnerabilitiesPage({ data }: { data: DashboardData }) {
    const report = data.queenbee.vulnerabilities
    const [query, setQuery] = useState('')
    const images = (report?.images || []).filter((image) => image.image.toLowerCase().includes(query.toLowerCase()))
    const severityTotals = images.reduce<Record<string, number>>((totals, image) => {
        for (const [level, count] of Object.entries(image.severity || {})) totals[level] = (totals[level] || 0) + Number(count || 0)
        return totals
    }, {})
    return (
        <PagePanel title="Vulnerabilities" status={data.health.vulnerabilities}>
            <QueenbeeStatusBanner status={data.health.vulnerabilities} path="/vulnerabilities" />
            <div className="editor-toolbar">
                <InternalActionButton label="Run vulnerability scan" path="vulnerabilities/scan" confirm="Start a Docker Scout vulnerability scan now?" />
            </div>
            {data.health.vulnerabilities === 'live' && report ? (
                <div className="queenbee-grid">
                    <article className="music-stat-card"><span>Images</span><strong>{report.imageCount || report.images?.length || 0}</strong><small>{report.generatedAt ? `Generated ${formatDate(report.generatedAt)}` : 'Scan report'}</small></article>
                    <article className="music-stat-card"><span>Scan</span><strong>{report.scanStatus?.isRunning ? 'Running' : 'Idle'}</strong><small>{report.scanStatus?.lastSuccessAt ? `Last success ${formatDate(report.scanStatus.lastSuccessAt)}` : report.scanStatus?.lastError || 'No scan timestamp'}</small></article>
                    <article className="queenbee-card"><ShieldAlert size={18} /><h3>Severity totals</h3><p>{Object.entries(severityTotals).filter(([, count]) => count).map(([level, count]) => `${level}: ${count}`).join(' · ') || 'No findings'}</p><span>{images.length} matching images</span></article>
                    <label className="editor-field editor-search full-span"><span>Search images</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter image reports" /></label>
                    {images.slice(0, 16).map((image) => <article className="queenbee-card" key={image.image}><ShieldAlert size={18} /><h3>{image.image}</h3><p>{image.totalVulnerabilities} vulnerabilities</p><span>{Object.entries(image.severity || {}).filter(([, count]) => count).map(([key, count]) => `${key}: ${count}`).join(' · ') || image.scanError || 'No findings'}</span></article>)}
                </div>
            ) : data.health.vulnerabilities === 'live' ? <EmptyState icon={<ShieldAlert />} label="No vulnerability report returned." /> : <ProtectedQueenbeeGrid />}
        </PagePanel>
    )
}

function AiPage({ data }: { data: DashboardData }) {
    return (
        <PagePanel title="AI" status={combinedStatus(data.health, ['internal', 'status'])}>
            <div className="queenbee-grid">
                <button className="queenbee-card" onClick={() => openInAppBrowser('https://login.no/app')}>
                    <Sparkles size={18} />
                    <h3>Login AI</h3>
                    <p>Open the Nucleus/Login AI surface for authenticated or anonymous assistant flows.</p>
                    <span>Open Login app</span>
                </button>
                <button className="queenbee-card" onClick={() => openInAppBrowser('https://queenbee.login.no/internal/ai')}>
                    <KeyRound size={18} />
                    <h3>Queenbee AI</h3>
                    <p>Open the protected Queenbee AI/admin area when a Queenbee role session is available.</p>
                    <span>Protected surface</span>
                </button>
            </div>
        </PagePanel>
    )
}

function LogsPage({ data }: { data: DashboardData }) {
    const initialEntries = data.queenbee.logs?.logs || data.queenbee.logs?.entries || []
    const [entries, setEntries] = useState(initialEntries)
    const [message, setMessage] = useState('Showing latest loaded logs.')

    async function filterLogs(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const params = new URLSearchParams()
        for (const key of ['container', 'service', 'level', 'limit']) {
            const value = String(form.get(key) || '').trim()
            if (value) params.set(key, value)
        }
        setMessage('Loading logs...')
        try {
            const result = await queenbeeRequest<typeof data.queenbee.logs>({ service: 'beekeeper', path: `docker/logs?${params.toString()}`, method: 'GET', timeoutMs: 30000 })
            setEntries(result?.logs || result?.entries || [])
            setMessage('Logs updated.')
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to load logs.')
        }
    }

    return (
        <PagePanel title="Logs" status={data.health.logs}>
            <QueenbeeStatusBanner status={data.health.logs} path="/docker/logs" />
            <form className="mini-admin-form inline" onSubmit={filterLogs}>
                <h3>Filter logs</h3>
                <label className="editor-field"><span>Container</span><input name="container" /></label>
                <label className="editor-field"><span>Service</span><input name="service" /></label>
                <label className="editor-field"><span>Level</span><input name="level" /></label>
                <label className="editor-field"><span>Limit</span><input name="limit" type="number" defaultValue={50} /></label>
                <button type="submit" disabled={!hasQueenbeeAuthSource()}><RefreshCcw size={14} />Apply</button>
            </form>
            <p className="editor-message">{message}</p>
            {data.health.logs === 'live' && entries.length ? (
                <div className="log-list">
                    {entries.slice(0, 16).map((entry, index) => <article className="log-row" key={`${entry.timestamp}-${index}`}><span>{entry.level || entry.container || entry.service || 'log'}</span><p>{entry.message || JSON.stringify(entry)}</p><time>{entry.timestamp ? formatDate(entry.timestamp) : ''}</time></article>)}
                </div>
            ) : data.health.logs === 'live' ? <EmptyState icon={<Logs />} label="No logs returned from Beekeeper." /> : <ProtectedQueenbeeGrid />}
        </PagePanel>
    )
}

function SettingsPage({
    themePreference,
    onThemePreferenceChange,
    updateState,
}: {
    themePreference: ThemePreference
    onThemePreferenceChange: (theme: ThemePreference) => void
    updateState: AutoUpdateState
}) {
    return (
        <div className="settings-grid">
            <section className="settings-card full-span">
                <div className="settings-card-head">
                    <div>
                        <h2>Appearance</h2>
                        <p>Use the Queenbee-style dark theme by default, or switch to the lighter desktop variant.</p>
                    </div>
                    <div className="theme-segment" role="radiogroup" aria-label="Theme">
                        {themeOptions.map(({ key, label, icon: Icon }) => (
                            <button key={key} className={themePreference === key ? 'active' : ''} onClick={() => onThemePreferenceChange(key)} role="radio" aria-checked={themePreference === key}>
                                <Icon size={17} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <ThemePreview />
            </section>
            <section className="settings-card">
                <PanelTitle title="Automatic Updates" subtitle="hanasand api /api/app" />
                <AutoUpdatePanel state={updateState} />
            </section>
            <section className="settings-card">
                <PanelTitle title="Queenbee Login" subtitle="Uses the same Login/Authentik session Queenbee expects" />
                <div className="token-box">
                    <button onClick={openQueenbeeUnlock}><KeyRound size={15} />Login with Queenbee</button>
                    <p>Desktop no longer stores separate Queenbee write-access or Nucleus push-access tokens. Public content loads natively; protected edits stay locked until the Queenbee session bridge is added.</p>
                </div>
            </section>
            <section className="settings-card">
                <PanelTitle title="Runtime" subtitle="Local desktop preferences" />
                <div className="settings-list">
                    <span><b>Theme</b>{themePreference}</span>
                    <span><b>Version</b>{DESKTOP_APP_VERSION}</span>
                    <span><b>Update endpoint</b>/api/app</span>
                </div>
            </section>
        </div>
    )
}

function ThemePreview() {
    const rows = [
        ['1', 'const desktopTheme = {', false],
        ['2', '  surface: "sidebar",', true],
        ['3', '  accent: "#f58b45",', true],
        ['4', '  updateSource: "/api/app",', false],
        ['5', '};', false],
    ] as const

    return (
        <div className="theme-preview" aria-label="Theme preview">
            <div className="theme-preview-pane before">
                {rows.map(([line, code, hot]) => <span key={`before-${line}`} className={hot ? 'hot' : ''}><b>{line}</b>{code}</span>)}
            </div>
            <div className="theme-preview-divider" />
            <div className="theme-preview-pane after">
                {rows.map(([line, code, hot]) => <span key={`after-${line}`} className={hot ? 'hot' : ''}><b>{line}</b>{code}</span>)}
            </div>
        </div>
    )
}

function PagePanel({ title, status, children }: { title: string; status?: ServiceStatus; children: React.ReactNode }) {
    return <section className="panel full-span page-panel"><PanelTitle title={title} subtitle={`Endpoint status: ${status || 'unknown'}`} />{children}</section>
}

function Metric({ icon, label, value, status = 'error' }: { icon: React.ReactNode; label: string; value: number | string; status?: ServiceStatus }) {
    return <article className={`metric-card ${status}`}><div className="metric-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{status}</small></article>
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return <div className="panel-title"><div><h2>{title}</h2><p>{subtitle}</p></div><Sparkles size={18} /></div>
}

function RecentList({ additions, status }: { additions: RecentAddition[]; status?: ServiceStatus }) {
    if (status !== 'live') return <EmptyState icon={<AlertCircle />} label={`Recent additions endpoint is ${status || 'unavailable'}.`} />
    if (!additions.length) return <EmptyState icon={<AlertCircle />} label="No recent additions returned from Workerbee." />
    return <div className="recent-list">{additions.map((item) => <button className="recent-row" key={`${item.source}-${item.id}-${item.updated_at}`} onClick={() => openSource(item)}><span className={item.action === 'updated' ? 'row-action updated' : 'row-action'}>{item.action === 'updated' ? '↻' : '+'}</span><div><strong>{item.name_en || item.name_no || 'Untitled'}</strong><span>{item.source || 'content'} · {item.action || 'created'}</span></div><time>{formatDate(item.updated_at || item.created_at)}</time></button>)}</div>
}

function CategoryChart({ data, status }: { data: DashboardData['categories']; status?: ServiceStatus }) {
    if (status !== 'live') return <EmptyState icon={<AlertCircle />} label={`Category stats endpoint is ${status || 'unavailable'}.`} />
    if (!data.length) return <EmptyState icon={<AlertCircle />} label="No event categories returned from Workerbee." />
    const total = data.reduce((sum, item) => sum + Number(item.event_count || 0), 0) || 1
    let cursor = 0
    const gradient = data.map((item) => { const start = cursor; cursor += (Number(item.event_count || 0) / total) * 360; return `${item.color || '#f58b45'} ${start}deg ${cursor}deg` }).join(', ')
    return <div className="category-wrap"><div className="pie" style={{ background: `conic-gradient(${gradient})` }} /><div className="legend">{data.map((item) => <span key={item.name_en || item.id}><i style={{ background: item.color || '#f58b45' }} />{item.name_en || item.name_no || 'Other'} ({item.event_count || 0})</span>)}</div></div>
}

function EventList({ events, status }: { events: EventItem[]; status?: ServiceStatus }) {
    if (status !== 'live') return <EmptyState icon={<CalendarDays />} label={`Events endpoint is ${status || 'unavailable'}.`} />
    if (!events.length) return <EmptyState icon={<CalendarDays />} label="No upcoming events returned from Workerbee." />
    return <div className="event-list expanded-list">{events.map((event) => <button className="event-row" key={event.id} onClick={() => openInAppBrowser(`https://login.no/events/${event.id}`)}><DateBadge date={event.time_start} color={event.category?.color} /><div><strong>{event.name_en || event.name_no || 'Untitled event'}</strong><span>{formatEventMeta(event)}</span></div>{event.image_small || event.image_banner ? <img src={eventImageUrl(event.image_small || event.image_banner)} alt="" /> : <span className="category-thumb" style={{ background: event.category?.color || '#f58b45' }}>{event.category?.name_en || 'Login'}</span>}</button>)}</div>
}

function AnnouncementList({ announcements, status }: { announcements: AnnouncementItem[]; status?: ServiceStatus }) {
    if (status !== 'live') return <EmptyState icon={<Megaphone />} label={`Announcements endpoint is ${status || 'unavailable'}. Public GET is being deployed.`} />
    if (!announcements.length) return <EmptyState icon={<Megaphone />} label="No announcements returned from TekKom Bot." />
    return <div className="table-list">{announcements.map((item) => <article className="table-row" key={item.id}><span className="row-action">#</span><div><strong>{stringValue(item.title) || `Announcement #${item.id}`}</strong><small>{stringValue(item.description) || 'No description'}</small></div><time>{item.sent ? 'Sent' : item.interval || item.time || 'Draft'}</time></article>)}</div>
}

function JobList({ jobs, status }: { jobs: JobItem[]; status?: ServiceStatus }) {
    if (status !== 'live') return <EmptyState icon={<BriefcaseBusiness />} label={`Jobs endpoint is ${status || 'unavailable'}.`} />
    if (!jobs.length) return <EmptyState icon={<BriefcaseBusiness />} label="No jobs returned from Workerbee." />
    return <div className="table-list">{jobs.map((job) => <button className="table-row" key={job.id} onClick={() => openInAppBrowser(`https://login.no/career/${job.id}`)}><span className="row-action">+</span><div><strong>{jobTitle(job)}</strong><small>{jobMeta(job)}</small></div><ExternalLink size={16} /></button>)}</div>
}

function RuleList({ rules, status }: { rules: RuleItem[]; status?: ServiceStatus }) {
    if (status !== 'live') return <EmptyState icon={<FileText />} label={`Rules endpoint is ${status || 'unavailable'}.`} />
    if (!rules.length) return <EmptyState icon={<FileText />} label="No rules returned from Workerbee." />
    return (
        <div className="rule-grid">
            {rules.map((rule) => (
                <article className="rule-card" key={rule.id}>
                    <span className="rule-kicker">Rule set #{rule.id}</span>
                    <h3>{rule.name_en || rule.name_no || `Rules #${rule.id}`}</h3>
                    <p>{stripMarkdown(rule.description_en || rule.description_no || '').slice(0, 420)}</p>
                    <button className="inline-link" onClick={() => openInAppBrowser(`https://login.no/events`)}>
                        See related events <ExternalLink size={14} />
                    </button>
                </article>
            ))}
        </div>
    )
}

function CompaniesSummary({ data }: { data: DashboardData }) {
    if (data.health['companies-text'] !== 'live') return <EmptyState icon={<Handshake />} label={`Companies text endpoint is ${data.health['companies-text'] || 'unavailable'}.`} />
    const sections = companySections(data)
    if (!sections.length) return <EmptyState icon={<Handshake />} label="No companies text returned from Workerbee." />
    return (
        <div className="compact-feature-list">
            {sections.slice(0, 3).map((section) => (
                <button className="feature-row" key={section.key} onClick={() => openInAppBrowser('https://login.no/companies')}>
                    <Handshake size={18} />
                    <div><strong>{section.title}</strong><span>{stripHtml(section.body).slice(0, 110)}</span></div>
                </button>
            ))}
        </div>
    )
}

function CompaniesContent({ data }: { data: DashboardData }) {
    if (data.health['companies-text'] !== 'live') return <EmptyState icon={<Handshake />} label={`Companies text endpoint is ${data.health['companies-text'] || 'unavailable'}.`} />
    const sections = companySections(data)
    if (!sections.length) return <EmptyState icon={<Handshake />} label="No companies text returned from Workerbee." />
    return (
        <div className="article-grid">
            {sections.map((section) => (
                <article className="article-card" key={section.key}>
                    <span>{section.key}</span>
                    <h3>{section.title}</h3>
                    <p>{stripHtml(section.body)}</p>
                </article>
            ))}
            <button className="article-cta" onClick={() => openInAppBrowser('https://login.no/companies')}>
                Open company page on login.no <ExternalLink size={16} />
            </button>
        </div>
    )
}

function MusicSummary({ data }: { data: DashboardData }) {
    if (data.health.music !== 'live' || !data.music) return <EmptyState icon={<Music2 />} label={`Music endpoint is ${data.health.music || 'unavailable'}.`} />
    const top = data.music.mostPlayedAlbums?.[0]
    return (
        <div className="music-summary">
            <div><span>Total songs</span><strong>{formatNumber(data.music.stats.total_songs)}</strong></div>
            <div><span>Minutes this year</span><strong>{formatNumber(data.music.stats.total_minutes_this_year)}</strong></div>
            <button onClick={() => openInAppBrowser('https://login.no/music')}>
                <Music2 size={17} />
                <span>{top?.album || 'Open music'} <small>{top?.artist || 'login.no/music'}</small></span>
            </button>
        </div>
    )
}

function MusicContent({ data }: { data: DashboardData }) {
    if (data.health.music !== 'live' || !data.music) return <EmptyState icon={<Music2 />} label={`Music endpoint is ${data.health.music || 'unavailable'}.`} />
    const albumRows = data.music.mostPlayedAlbums || []
    const todayRows = data.music.topFiveToday || []
    return (
        <div className="music-grid">
            <article className="music-stat-card"><span>Total songs</span><strong>{formatNumber(data.music.stats.total_songs)}</strong><small>{formatNumber(data.music.stats.total_minutes)} total minutes</small></article>
            <article className="music-stat-card"><span>Average length</span><strong>{data.music.stats.avg_seconds ? `${Math.round(data.music.stats.avg_seconds / 60)} min` : 'N/A'}</strong><small>Per play</small></article>
            <section className="music-list-card">
                <h3>Most played albums</h3>
                {albumRows.slice(0, 8).map((album) => <MusicRow key={`${album.album}-${album.artist}`} title={album.album || 'Unknown album'} meta={`${album.artist || 'Unknown artist'} · ${formatNumber(album.total_listens)} listens`} image={spotifyImage(album.top_song_image)} />)}
            </section>
            <section className="music-list-card">
                <h3>Top today</h3>
                {todayRows.slice(0, 8).map((song, index) => <MusicRow key={`${song.title || song.name}-${index}`} title={song.title || song.name || 'Unknown song'} meta={`${song.artist || song.album || 'Login listener'} · ${formatNumber(song.listens)} plays`} image={spotifyImage(song.image || song.song_image)} />)}
            </section>
        </div>
    )
}

function MusicRow({ title, meta, image }: { title: string; meta: string; image?: string }) {
    return <button className="music-row" onClick={() => openInAppBrowser('https://login.no/music')}>{image ? <img src={image} alt="" /> : <span><Music2 size={16} /></span>}<div><strong>{title}</strong><small>{meta}</small></div></button>
}

function InternalActionButton({
    label,
    path,
    method = 'POST',
    data,
    confirm,
    dangerous = false,
}: {
    label: string
    path: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: unknown
    confirm: string
    dangerous?: boolean
}) {
    const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
    const authReady = hasQueenbeeAuthSource()

    async function run() {
        if (!window.confirm(`${confirm}\n\nEndpoint: beekeeper/${path}`)) return
        setState('busy')
        try {
            await queenbeeRequest({ service: 'beekeeper', path, method, data, timeoutMs: 20000 })
            setState('done')
        } catch {
            setState('error')
        }
    }

    return (
        <button className={dangerous ? 'danger-action' : ''} disabled={!authReady || state === 'busy'} onClick={run}>
            {state === 'busy' ? <Loader2 size={14} className="spin" /> : state === 'done' ? <CheckCircle2 size={14} /> : state === 'error' ? <AlertCircle size={14} /> : <Pencil size={14} />}
            {state === 'busy' ? 'Running...' : state === 'done' ? 'Done' : state === 'error' ? 'Failed' : label}
        </button>
    )
}

function InternalMiniForm({
    title,
    path,
    method = 'POST',
    fields,
    confirm,
    defaults = null,
}: {
    title: string
    path: string
    method?: 'POST' | 'PUT'
    fields: EditorField[]
    confirm: string
    defaults?: EditableRow | null
}) {
    const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
    const authReady = hasQueenbeeAuthSource()

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const payload = buildEditorPayload(fields, new FormData(event.currentTarget))
        if (!window.confirm(`${confirm}\n\nEndpoint: beekeeper/${path}`)) return
        setState('busy')
        try {
            await queenbeeRequest({ service: 'beekeeper', path, method, data: payload, timeoutMs: 20000 })
            setState('done')
        } catch {
            setState('error')
        }
    }

    return (
        <form className="mini-admin-form" onSubmit={submit}>
            <h3>{title}</h3>
            {fields.map((field) => <EditorInput key={field.name} field={field} row={defaults} />)}
            <button type="submit" disabled={!authReady || state === 'busy'}>
                {state === 'busy' ? <Loader2 size={14} className="spin" /> : state === 'done' ? <CheckCircle2 size={14} /> : state === 'error' ? <AlertCircle size={14} /> : <Plus size={14} />}
                {state === 'done' ? 'Done' : state === 'error' ? 'Failed' : 'Submit'}
            </button>
        </form>
    )
}

function QueenbeeStatusBanner({ status, path }: { status?: ServiceStatus; path: string }) {
    return (
        <div className={`queenbee-banner ${status || 'error'}`}>
            <span>{status === 'live' ? 'Live Queenbee data' : status === 'locked' ? 'Protected by Queenbee role' : 'Queenbee endpoint unavailable'}</span>
            <p>{status === 'live' ? `Beekeeper ${path} responded successfully.` : status === 'locked' ? `Beekeeper ${path} requires the normal Queenbee Login/Authentik session. Login here and refresh the protected data in place.` : `Beekeeper ${path} could not be reached from the desktop app.`}</p>
            {status === 'locked' ? <button onClick={openQueenbeeUnlock}><KeyRound size={14} />Login in app</button> : <button onClick={() => openInAppBrowser(`https://queenbee.login.no/internal${path.startsWith('/traffic') ? '/traffic' : path === '/db' ? '/db' : path === '/docker/logs' ? '/logs' : path === '/vulnerabilities' ? '/vulnerabilities' : '/loadbalancing'}`)}>
                Open in Queenbee <ExternalLink size={14} />
            </button>}
        </div>
    )
}

function ProtectedQueenbeeGrid() {
    const cards = [
        ['Queenbee login', 'Use the same Login/Authentik flow Queenbee expects to hydrate protected operational data here.'],
        ['Desktop safety', 'The launcher no longer asks for separate write or push tokens.'],
        ['Readiness', 'After unlock, the dashboard refreshes and protected Beekeeper cards become live.'],
    ]
    return <div className="queenbee-grid protected">{cards.map(([title, body]) => <article className="queenbee-card" key={title}><ShieldCheck size={18} /><h3>{title}</h3><p>{body}</p>{title === 'Queenbee login' ? <button type="button" onClick={openQueenbeeUnlock}><KeyRound size={14} />Login in app</button> : null}</article>)}</div>
}

function ProtectedBotAnnouncements() {
    return (
        <section className="panel protected-panel">
            <PanelTitle title="Bot Announcements" subtitle="Protected TekKom Bot surface" />
            <div className="queenbee-grid protected">
                <article className="queenbee-card">
                    <Megaphone size={20} />
                    <h3>Login required</h3>
                    <p>Bot announcements are only loaded after Queenbee login. Until then, this surface stays hidden from dashboard status and content widgets.</p>
                    <button type="button" onClick={openQueenbeeUnlock}><KeyRound size={14} />Login in app</button>
                </article>
                <article className="queenbee-card">
                    <ShieldCheck size={20} />
                    <h3>Safe by default</h3>
                    <p>The app follows Queenbee’s expected session model instead of asking for a pasted Bot or write token.</p>
                </article>
            </div>
        </section>
    )
}

function QueenbeeTopList({ title, rows }: { title: string; rows?: Array<{ key: string; count?: number; avg_time?: number }> }) {
    return (
        <article className="music-list-card">
            <h3>{title}</h3>
            {rows?.length ? rows.slice(0, 8).map((row) => <div className="queenbee-mini-row" key={row.key}><strong>{row.key}</strong><span>{formatNumber(row.count)} hits{row.avg_time ? ` · ${Math.round(row.avg_time)} ms` : ''}</span></div>) : <p className="muted">No rows returned.</p>}
        </article>
    )
}

function JsonPreview({ value }: { value: unknown }) {
    return <pre className="json-preview">{JSON.stringify(value, null, 2)}</pre>
}

function StatusList({ services, status, expanded = false }: { services: DashboardData['statusServices']; status?: ServiceStatus; expanded?: boolean }) {
    if (status !== 'live') return <EmptyState icon={<Monitor />} label={`Status endpoint is ${status || 'unavailable'}.`} />
    const shown = expanded ? services : services.slice(0, 6)
    if (!shown.length) return <EmptyState icon={<AlertCircle />} label="Status endpoint returned no services." />
    return <div className={expanded ? 'status-list status-grid' : 'status-list'}>{shown.map((service) => { const latest = service.bars?.[0]; const up = latest?.status === true || latest?.status === 1; return <div className="status-row" key={service.id}><span className={up ? 'status-light up' : 'status-light'} /><div><strong>{service.name}</strong><span>{service.url || 'Login service'} · {latest?.delay ? `${Math.round(latest.delay)} ms` : 'waiting'}</span></div><b>{up ? 'UP' : 'CHECK'}</b></div> })}</div>
}

function QueenbeeOpsSummary({ data }: { data: DashboardData }) {
    const items = [
        { title: 'Load Balancing', icon: Scale, status: data.health.sites, value: data.queenbee.sites.length ? `${data.queenbee.sites.length} sites` : 'No sites', path: '/loadbalancing' },
        { title: 'Databases', icon: Database, status: data.health.db, value: data.health.db === 'live' ? 'Live overview' : 'Protected', path: '/db' },
        { title: 'Traffic', icon: Activity, status: data.health.traffic, value: data.queenbee.traffic?.total_requests ? `${formatNumber(data.queenbee.traffic.total_requests)} requests` : 'Metrics', path: '/traffic' },
        { title: 'Vulnerabilities', icon: ShieldAlert, status: data.health.vulnerabilities, value: data.queenbee.vulnerabilities?.imageCount ? `${data.queenbee.vulnerabilities.imageCount} images` : 'Scan report', path: '/vulnerabilities' },
        { title: 'Logs', icon: Logs, status: data.health.logs, value: data.health.logs === 'live' ? 'Live stream' : 'Protected', path: '/logs' },
    ]
    return (
        <div className="queenbee-ops-grid">
            {items.map(({ title, icon: Icon, status, value, path }) => (
                <button className="queenbee-op-card" key={title} onClick={status === 'locked' ? openQueenbeeUnlock : () => openInAppBrowser(`https://queenbee.login.no/internal${path}`)}>
                    <Icon size={18} />
                    <div>
                        <strong>{title}</strong>
                        <span>{value}</span>
                    </div>
                    <EndpointPill label={status || 'error'} status={status || 'error'} compact />
                </button>
            ))}
        </div>
    )
}

function TileGrid<T extends NamedItem | AlbumItem>({ rows, status, kind }: { rows: T[]; status?: ServiceStatus; kind: 'album' | 'organization' | 'location' }) {
    if (status !== 'live') return <EmptyState icon={<Image />} label={`${kind} endpoint is ${status || 'unavailable'}.`} />
    if (!rows.length) return <EmptyState icon={<Image />} label={`No ${kind}s returned.`} />
    return <div className="tile-grid">{rows.map((row) => { const title = displayName(row); const image = kind === 'album' ? albumImageUrl(row.id, (row as AlbumItem).cover || (row as AlbumItem).cover_image || (row as AlbumItem).image_small) : ''; return <button className="tile-card" key={row.id} onClick={() => openInAppBrowser(kind === 'album' ? `https://login.no/albums/${row.id}` : kind === 'organization' ? `https://login.no/companies/${row.id}` : 'https://login.no/events')}><span className="tile-media">{image ? <img src={image} alt="" /> : title.slice(0, 1)}</span><strong>{title}</strong><small>{row.address || row.city || formatDate(row.updated_at || row.created_at)}</small></button> })}</div>
}

function ContentCollections({ data, queenbeeLoggedIn }: { data: DashboardData; queenbeeLoggedIn: boolean }) {
    return (
        <div className="content-collections">
            <ContentCard title="Jobs" status={data.health.jobs} rows={data.jobs} getTitle={jobTitle} getMeta={jobMeta} getUrl={(job) => `https://login.no/career/${job.id}`} />
            {queenbeeLoggedIn || data.health.announcements === 'live'
                ? <ContentCard title="Announcements" status={data.health.announcements} rows={data.announcements} getTitle={(item) => stringValue(item.title) || `Announcement #${item.id}`} getMeta={(item) => stringValue(item.description) || 'No description'} getUrl={() => 'https://queenbee.login.no/announcements'} />
                : null}
            <ContentCard title="Rules" status={data.health.rules} rows={data.rules} getTitle={(item) => item.name_en || item.name_no || `Rules #${item.id}`} getMeta={(item) => stripMarkdown(item.description_en || item.description_no || '').slice(0, 80)} getUrl={() => 'https://login.no/events'} />
            <ContentCard title="Organizations" status={data.health.organizations} rows={data.organizations} getTitle={displayName} getMeta={(item) => item.city || item.address || formatDate(item.updated_at || item.created_at)} getUrl={(item) => `https://login.no/companies/${item.id}`} />
            <ContentCard title="Albums" status={data.health.albums} rows={data.albums} getTitle={displayName} getMeta={(item) => formatDate(item.updated_at || item.created_at)} getUrl={(item) => `https://login.no/albums/${item.id}`} getImage={(item) => albumImageUrl(item.id, item.cover || item.cover_image || item.image_small)} />
        </div>
    )
}

function ContentCard<T extends { id: number | string }>({ title, status, rows, getTitle, getMeta, getUrl, getImage }: { title: string; status?: ServiceStatus; rows: T[]; getTitle: (row: T) => string; getMeta: (row: T) => string; getUrl: (row: T) => string; getImage?: (row: T) => string }) {
    return <article className="content-card"><h3>{title} <EndpointPill label={status || 'error'} status={status || 'error'} compact /></h3>{status !== 'live' ? <EmptyState icon={<AlertCircle />} label={`${title} endpoint is ${status || 'unavailable'}.`} /> : null}{status === 'live' && !rows.length ? <EmptyState icon={<AlertCircle />} label={`No ${title.toLowerCase()} returned.`} /> : null}{status === 'live' && rows.length ? rows.slice(0, 5).map((row) => { const image = getImage?.(row); return <button className="content-row" key={row.id} onClick={() => openInAppBrowser(getUrl(row))}>{image ? <img src={image} alt="" /> : <span>{getTitle(row).slice(0, 1)}</span>}<div><strong>{getTitle(row)}</strong><small>{getMeta(row)}</small></div></button> }) : null}</article>
}

function InternalOverview({ data, health }: { data: DashboardData['internal']; health: Record<string, ServiceStatus> }) {
    const overview = data
    if (health.internal !== 'live' || !overview) return <EmptyState icon={<Server />} label={`Internal dashboard endpoint is ${health.internal || 'unavailable'}.`} />
    const system = overview.runtime.metrics.system
    const topStats = [['Alerts', overview.statistics.alerts, AlertCircle], ['Databases', overview.statistics.databases, Database], ['Sites', overview.statistics.sites, Globe2], ['Monitored Sites', overview.statistics.monitored, Activity], ['Requests Today', overview.statistics.requestsToday, Monitor]] as const
    return <div className="internal-grid">{topStats.map(([label, value, Icon]) => <article className="internal-stat" key={label}><Icon size={22} /><span>{label}</span><strong>{value}</strong></article>)}<article className="resource-card"><h3>Primary Site</h3><p>{overview.information.primarySite.name}</p><code>{overview.information.primarySite.ip}</code></article><article className="resource-card"><h3>Operating System</h3><p>{system.os}</p></article><article className="resource-card"><h3>Memory Usage</h3><div className="progress"><span style={{ width: `${Number(system.memory.percent) || 0}%` }} /></div><p>{system.memory.percent || 0}%</p></article><article className="resource-card health-card"><h3>Endpoint Health</h3><div className="health-tags">{Object.entries(health).map(([key, status]) => <HealthTag key={key} label={key} status={status} />)}</div></article></div>
}

function EndpointPill({ label, status, compact = false, onUnlock }: { label: string; status: ServiceStatus; compact?: boolean; onUnlock?: () => void }) {
    if (status === 'locked' && onUnlock) {
        return <button type="button" className={`endpoint-pill ${status} ${compact ? 'compact' : ''} interactive`} onClick={onUnlock}><i />{label}: locked <KeyRound size={12} /></button>
    }
    return <span className={`endpoint-pill ${status} ${compact ? 'compact' : ''}`}><i />{label}: {status}</span>
}
function HealthTag({ label, status }: { label: string; status: ServiceStatus }) { return <span className={`health-tag ${status}`}>{label}: {status}</span> }
function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) { return <div className="empty-state">{icon}<span>{label}</span></div> }
function DateBadge({ date, color }: { date?: string; color?: string }) { const parsed = date ? new Date(date) : null; const day = parsed && !Number.isNaN(parsed.getTime()) ? parsed.getDate() : '--'; const month = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString('no-NO', { month: 'short' }).replace('.', '') : 'TBA'; return <span className="date-badge" style={{ background: color || '#f58b45' }}><b>{day}</b><small>{month}</small></span> }
function LoginMark({ small = false }: { small?: boolean }) {
    return (
        <svg className={small ? 'login-mark small' : 'login-mark'} viewBox="0 0 128 128" role="img" aria-label="Login logo">
            <path className="logo-bracket" d="M24 18h28v10H34v18H24V18Zm52 0h28v28H94V28H76V18ZM24 82h10v18h18v10H24V82Zm70 0h10v28H76v-10h18V82Z" />
            <path className="logo-letter" d="M56 40h14v42h30v14H56V40Z" />
        </svg>
    )
}
function combinedStatus(health: Record<string, ServiceStatus>, keys: string[]): ServiceStatus { const statuses = keys.map((key) => health[key]).filter(Boolean); if (statuses.length && statuses.every((status) => status === 'live')) return 'live'; if (statuses.some((status) => status === 'locked')) return 'locked'; return 'error' }
function openSource(item: RecentAddition) { const source = item.source || ''; if (source === 'events') return openInAppBrowser(`https://login.no/events/${item.id}`); if (source === 'jobs') return openInAppBrowser(`https://login.no/career/${item.id}`); if (source === 'albums') return openInAppBrowser(`https://login.no/albums/${item.id}`); if (source === 'organizations') return openInAppBrowser(`https://login.no/companies/${item.id}`); return openInAppBrowser('https://queenbee.login.no') }
function displayName(item: Partial<NamedItem | AlbumItem>) { return item.name_en || item.name_no || item.name || `#${item.id}` }
function stringValue(value: unknown) { return Array.isArray(value) ? value.filter(Boolean).join(' / ') : typeof value === 'string' ? value : '' }
function formatNumber(value?: number | string) { const number = typeof value === 'string' ? Number(value) : value; return typeof number === 'number' && Number.isFinite(number) ? Intl.NumberFormat('en-US', { notation: number > 99999 ? 'compact' : 'standard' }).format(number) : '0' }
function formatBytes(value?: number) { if (!value || !Number.isFinite(value)) return '0 B'; const units = ['B', 'KB', 'MB', 'GB']; let size = value; let unit = 0; while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1 } return `${size >= 10 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${units[unit]}` }
function assetName(asset: WikiAuditAsset) { return asset.fileName || asset.file_name || `Asset ${asset.id}` }
function assetMime(asset: WikiAuditAsset) { return asset.mimeType || asset.mime_type || 'application/octet-stream' }
function assetSize(asset: WikiAuditAsset) { return asset.sizeBytes || asset.size_bytes || 0 }
function pageAccessLabel(page: Pick<WikiPageItem, 'visibility' | 'required_role'>) {
    return `${page.visibility || 'unknown'}${page.required_role ? `:${page.required_role}` : ''}`
}
function summarizeWikiPayload(payload: unknown) {
    if (Array.isArray(payload)) return `${payload.length} rows`
    if (!payload || typeof payload !== 'object') return typeof payload
    const object = payload as Record<string, unknown>
    if (Array.isArray(object.pages)) return `${object.pages.length} pages`
    if (Array.isArray(object.assets)) return `${object.assets.length} assets`
    if (Array.isArray(object.comments)) return `${object.comments.length} comments`
    if (Array.isArray(object.spaces)) return `${object.spaces.length} spaces`
    if (Array.isArray(object.templates)) return `${object.templates.length} templates`
    if (object.totals && Array.isArray(object.issues)) {
        const totals = object.totals as { issues?: unknown; roles?: unknown }
        return `${Number(totals.issues) || 0} access issues, ${Number(totals.roles) || 0} roles`
    }
    if (Array.isArray(object.results)) return `${object.results.length} results`
    if (Array.isArray(object.versions)) return `${object.versions.length} versions`
    if (Array.isArray(object.links)) return `${object.links.length} links`
    if (Array.isArray(object.backlinks)) return `${object.backlinks.length} backlinks`
    if (object.page && typeof object.page === 'object') return 'page loaded'
    if (object.service) return String(object.service)
    if (object.status) return `status ${String(object.status)}`
    return `${Object.keys(object).length} fields`
}
function buildWikiCrawlReport(audit: WikiCrawlAudit) {
    const lineItems = (items: Array<{ title: string; meta: string }>, limit = 80) => {
        if (!items.length) return ['- none']
        const visible = items.slice(0, limit).map((item) => `- ${item.title} (${item.meta})`)
        const hidden = items.length > limit ? [`- ...${items.length - limit} more`] : []
        return [...visible, ...hidden]
    }
    const pages = (items: WikiPageItem[]) => lineItems(items.map((page) => ({ title: page.title, meta: `${page.space_slug}/${page.slug}` })))
    const assets = (items: WikiAuditAsset[]) => lineItems(items.map((asset) => ({ title: assetName(asset), meta: `${assetMime(asset)}, ${formatBytes(assetSize(asset))}${asset.pageSlug || asset.page_slug ? `, ${asset.spaceSlug || asset.space_slug}/${asset.pageSlug || asset.page_slug}` : ', unused'}` })))

    return [
        '# Login Wiki Crawl Audit',
        '',
        `Generated: ${new Date(audit.generatedAt).toISOString()}`,
        `Pages crawled: ${audit.pages.length}`,
        `Assets crawled: ${audit.assets.length}`,
        `Non-published pages: ${audit.draftOrArchived.length}`,
        `Internal pages: ${audit.restrictedPages.length}`,
        `Role-gated pages: ${audit.roleGatedPages.length}`,
        `Access mismatches: ${audit.accessMismatches.length}`,
        '',
        '## Status Counts',
        ...Object.entries(audit.byStatus).sort().map(([status, count]) => `- ${status}: ${count}`),
        '',
        '## Visibility Counts',
        ...Object.entries(audit.byVisibility).sort().map(([visibility, count]) => `- ${visibility}: ${count}`),
        '',
        '## Space Counts',
        ...Object.entries(audit.bySpace).sort((a, b) => b[1] - a[1]).map(([space, count]) => `- ${space}: ${count}`),
        '',
        '## Access Mismatches',
        ...pages(audit.accessMismatches),
        '',
        '## Missing Summary',
        ...pages(audit.missingSummary),
        '',
        '## Missing Content',
        ...pages(audit.missingContent),
        '',
        '## Missing Tags',
        ...pages(audit.missingTags),
        '',
        '## Images Missing Alt Text',
        ...assets(audit.assetsMissingAlt),
        '',
        '## Unused Assets',
        ...assets(audit.unusedAssets),
        '',
        '## Large Assets',
        ...assets(audit.largeAssets),
    ].join('\n')
}
function formatCurrency(value?: number) { return typeof value === 'number' && Number.isFinite(value) ? Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(value) : 'NOK 0' }
function formatSignedCurrency(value: number) { const formatted = formatCurrency(Math.abs(value)); return `${value >= 0 ? '+' : '-'}${formatted}` }
function formatPercent(value?: number) { return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value * (value <= 1 ? 100 : 1))}%` : '0%' }
function jobTitle(job: JobItem) { return job.title_en || job.title_no || job.title || job.name_en || job.name_no || `Job #${job.id}` }
function jobMeta(job: JobItem) { const organization = job.organization ? displayName(job.organization as NamedItem) : job.organizations?.map((item) => displayName(item as NamedItem)).filter(Boolean).join(', '); const deadline = job.deadline ? `Deadline ${formatDate(job.deadline)}` : formatDate(job.updated_at || job.created_at); return organization ? `${organization} · ${deadline}` : deadline }
function formatDate(value?: string) { if (!value) return 'No date'; const date = new Date(value); if (Number.isNaN(date.getTime())) return 'No date'; return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) }
function formatTime(value: string) { const date = new Date(value); return date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }) }
function formatEventMeta(event: EventItem) { const date = event.time_start ? new Date(event.time_start) : null; const time = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('no-NO', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'Time TBA'; const location = event.location?.name || event.location?.name_en || event.location?.name_no; return location ? `${time} · ${location}` : time }
function stripHtml(value: string) { return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() }
function stripMarkdown(value: string) { return stripHtml(value).replace(/[*_`#>-]/g, '').replace(/\s+/g, ' ').trim() }
function companySections(data: DashboardData) { const text = data.companiesText?.text?.en || {}; return Object.entries(text).map(([key, section]) => ({ key, title: section.title || key, body: section.body || section.subtitle || '' })).filter((section) => section.title || section.body) }
function spotifyImage(id?: string) { if (!id) return ''; return id.startsWith('http') ? id : `https://i.scdn.co/image/${id}` }
function openQueenbeeUnlock() { window.loginOpenQueenbeeUnlock?.() }
function openWikiPage(space: string, slug: string) { openInAppBrowser(`${WIKI_WEB}/wiki/${encodeURIComponent(space)}/${slug.split('/').map(encodeURIComponent).join('/')}`) }

declare global {
    interface Window {
        __loginDesktopRoot?: Root
        loginOpenInAppBrowser?: (target: BrowserTarget) => void
        loginOpenQueenbeeUnlock?: () => void
    }
}

const rootElement = document.getElementById('root')!
window.__loginDesktopRoot ||= createRoot(rootElement)
window.__loginDesktopRoot.render(<App />)
