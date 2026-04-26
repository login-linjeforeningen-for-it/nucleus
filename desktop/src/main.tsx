import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot, Root } from 'react-dom/client'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  Globe2,
  Grid2X2,
  Handshake,
  Image,
  Images,
  Loader2,
  Logs,
  Laptop,
  KeyRound,
  MapPin,
  Megaphone,
  Monitor,
  Moon,
  Music2,
  Pencil,
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
  AppNotificationHistoryEntry,
  DashboardData,
  EventItem,
  JobItem,
  NamedItem,
  RecentAddition,
  RuleItem,
  QueenbeeService,
  ScheduledAppNotificationEntry,
  ServiceStatus,
  albumImageUrl,
  appApiRequest,
  eventImageUrl,
  getAppApiAdminToken,
  getQueenbeeToken,
  hasAppApiAdminToken,
  hasQueenbeeToken,
  loadDashboardData,
  queenbeeRequest,
  setAppApiAdminToken,
  setQueenbeeToken,
} from './lib/api'
import { AutoUpdateState, DESKTOP_APP_VERSION, fetchAppUpdateManifest, hasNewerDesktopVersion } from './lib/appUpdate'
import type { BrowserTarget } from './lib/inAppBrowser'
import { openInAppBrowser } from './lib/inAppBrowser'
import './styles.css'
import enText from '../../public/text/en.json'
import aboutText from '../../public/text/menu/about/en.json'

type PageKey = 'dashboard' | 'events' | 'announcements' | 'albums' | 'albumImages' | 'jobs' | 'organizations' | 'locations' | 'rules' | 'alerts' | 'honey' | 'partners' | 'about' | 'verv' | 'policy' | 'fund' | 'games' | 'pwned' | 'music' | 'status' | 'nucleusAdmin' | 'nucleusDocs' | 'internal' | 'loadbalancing' | 'databases' | 'dbRestore' | 'monitoring' | 'services' | 'serviceDetail' | 'traffic' | 'trafficRecords' | 'trafficMap' | 'backups' | 'vulnerabilities' | 'logs' | 'ai' | 'settings'
type ThemePreference = 'light' | 'dark' | 'system'

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

const DASHBOARD_CACHE_KEY = 'login-desktop.dashboard-cache'
const DASHBOARD_REFRESH_MS = 1000 * 60

const menu: NavItem[] = [
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
  { key: 'partners', label: 'For Companies', icon: Handshake },
  { key: 'about', label: 'About Login', icon: UsersRound },
  { key: 'verv', label: 'Verv', icon: Handshake },
  { key: 'policy', label: 'Privacy Policy', icon: ShieldCheck },
  { key: 'fund', label: 'Login Fund', icon: Scale },
  { key: 'games', label: 'Games', icon: Sparkles },
  { key: 'pwned', label: 'Pwned', icon: ShieldAlert },
  { key: 'music', label: 'Music', icon: Music2 },
  { key: 'status', label: 'Status', icon: Monitor },
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

const themeOptions: Array<{ key: ThemePreference; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System', icon: Laptop },
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
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

function readInitialPage(): PageKey {
  const page = new URLSearchParams(window.location.search).get('page')
  return menu.some((item) => item.key === page) ? page as PageKey : 'dashboard'
}

function readCachedDashboard() {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_CACHE_KEY)
    return raw ? JSON.parse(raw) as DashboardData : null
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
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => readThemePreference())
  const [data, setData] = useState<DashboardData | null>(() => readCachedDashboard())
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [navQuery, setNavQuery] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [browserTarget, setBrowserTarget] = useState<BrowserTarget | null>(null)
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
    window.loginOpenInAppBrowser = setBrowserTarget
    return () => {
      delete window.loginOpenInAppBrowser
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

  const activeLabel = menu.find((item) => item.key === activePage)?.label || 'Dashboard'
  const normalizedNavQuery = navQuery.trim().toLowerCase()
  const filteredMenu = normalizedNavQuery
    ? menu.filter((item) => `${item.label} ${item.key}`.toLowerCase().includes(normalizedNavQuery))
    : menu
  const commands = useMemo<CommandAction[]>(() => [
    ...menu.map((item) => ({
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
  ], [data, refreshing])

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
    <main className="app-shell" data-theme={themePreference}>
      <aside className="sidebar">
        <div className="brand-lockup">
          <LoginMark small />
          <span>Login Desktop</span>
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
        <nav className="nav-list" aria-label="Login surfaces">
          {filteredMenu.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" className={activePage === key ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage(key)}>
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
          {!filteredMenu.length ? <p className="nav-empty">No Login surface matches "{navQuery}".</p> : null}
        </nav>
        <div className="sidebar-footer">
          <span className="version">v{DESKTOP_APP_VERSION}</span>
          <span className="muted">{activeLabel}</span>
        </div>
      </aside>

      <section className="content" ref={contentRef}>
        {activePage === 'dashboard'
          ? <Hero data={data} updateState={updateState} refreshing={refreshing} onRefresh={refreshDashboard} />
          : <PageHero page={activePage} data={data} refreshing={refreshing} onRefresh={refreshDashboard} />}
        {error ? <div className="error-card">{error}</div> : null}
        {activePage === 'settings'
          ? <SettingsPage themePreference={themePreference} onThemePreferenceChange={setThemePreference} updateState={updateState} />
          : !data ? <LoadingState /> : <PageRouter page={activePage} data={data} updateState={updateState} />}
      </section>
      <InAppBrowser target={browserTarget} onClose={() => setBrowserTarget(null)} />
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

function PageRouter({ page, data, updateState }: { page: PageKey; data: DashboardData; updateState: AutoUpdateState }) {
  switch (page) {
    case 'events': return <EventsPage data={data} />
    case 'announcements': return <AnnouncementsPage data={data} />
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
    case 'nucleusAdmin': return <NucleusAdminPage data={data} />
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
    default: return <Dashboard data={data} updateState={updateState} />
  }
}

function Hero({
  data,
  updateState,
  refreshing,
  onRefresh,
}: {
  data: DashboardData | null
  updateState: AutoUpdateState
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
      <AutoUpdatePanel state={updateState} />
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
  const count = (value: number | null | undefined) => typeof value === 'number' ? value : 'locked'
  const map = {
    dashboard: { title: 'Dashboard', kicker: 'Overview', description: 'The complete Login desktop command center.', icon: Grid2X2 },
    events: { title: 'Events', kicker: `${data?.events.length ?? 0} loaded`, description: `${count(data?.counts.events)} public events from Workerbee.`, icon: CalendarDays },
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

function Dashboard({ data, updateState }: { data: DashboardData; updateState: AutoUpdateState }) {
  return (
    <div className="dashboard-grid">
      <EndpointStrip data={data} />
      <section className="metric-strip full-span">
        <Metric icon={<CalendarDays />} label="Events" value={data.counts.events} status={data.health.events} />
        <Metric icon={<BriefcaseBusiness />} label="Jobs" value={data.counts.jobs} status={data.health.jobs} />
        <Metric icon={<Megaphone />} label="Announcements" value={data.counts.announcements ?? 'Locked'} status={data.health.announcements} />
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
      <section className="panel"><PanelTitle title="For Companies" subtitle="Live /text/beehive/companies" /><CompaniesSummary data={data} /></section>
      <section className="panel"><PanelTitle title="Login Music" subtitle="Live /activity" /><MusicSummary data={data} /></section>
      <section className="panel full-span"><PanelTitle title="Queenbee Operations" subtitle="Beekeeper internal surfaces" /><QueenbeeOpsSummary data={data} /></section>
      <section className="panel full-span"><PanelTitle title="More Login Content" subtitle="Live Workerbee collections" /><ContentCollections data={data} /></section>
      <section className="panel full-span"><PanelTitle title="Desktop Runtime" subtitle="Native app health" /><AutoUpdatePanel state={updateState} /></section>
    </div>
  )
}

function EndpointStrip({ data }: { data: DashboardData }) {
  return (
    <section className="source-strip full-span">
      <EndpointPill label="Workerbee" status={combinedStatus(data.health, ['events', 'jobs', 'organizations', 'locations', 'albums', 'categories', 'recent-additions'])} />
      <EndpointPill label="Beekeeper" status={combinedStatus(data.health, ['status', 'internal'])} />
      <EndpointPill label="Queenbee Ops" status={combinedStatus(data.health, ['sites', 'db', 'traffic', 'vulnerabilities', 'logs'])} />
      <EndpointPill label="Bot announcements" status={data.health.announcements || 'error'} />
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
  const [message, setMessage] = useState('Public events loaded. Add a Queenbee token to query protected/historical rows.')
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
          <button type="submit" disabled={!hasQueenbeeToken() || loading}>{loading ? 'Loading...' : 'Load protected'}</button>
        </form>
        <p className="editor-message">{message}</p>
      </section>
      <EditorPage data={eventData} config={editorConfigs.events} preview={<EventList events={rows} status={data.health.events} />} />
    </div>
  )
}

function AnnouncementsPage({ data }: { data: DashboardData }) {
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
        <button type="button" disabled={!hasQueenbeeToken()} onClick={compressAlbums}>Compress all albums</button>
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
        <button type="button" disabled={!hasQueenbeeToken() || uploading || !files.length} onClick={uploadImages}>{uploading ? 'Uploading...' : 'Upload to album'}</button>
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
  const [message, setMessage] = useState('Ready. Add a Queenbee token in Settings to push changes.')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [mediaMessage, setMediaMessage] = useState('')
  const [exampleDefaults, setExampleDefaults] = useState<EditableRow | null>(null)
  const tokenReady = hasQueenbeeToken()
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
          <span className={tokenReady ? 'editor-token ready' : 'editor-token'}><KeyRound size={14} />{tokenReady ? 'Write token configured' : 'Read-only until token is added'}</span>
          <button onClick={startCreate}><Plus size={14} />New</button>
          <button onClick={() => openInAppBrowser(`https://queenbee.login.no${config.queenbeePath}`)}>Open Queenbee <ExternalLink size={14} /></button>
        </div>
        <form className="editor-form" onSubmit={submit} key={`${config.title}-${mode}-${editing?.id || exampleDefaults?.id || 'new'}`}>
          {config.fields.map((field) => <EditorInput key={field.name} field={field} row={editing || exampleDefaults} />)}
          <div className="editor-actions">
            <button className="primary-action" type="submit" disabled={busy || !tokenReady}><Pencil size={15} />{busy ? 'Pushing...' : mode === 'create' ? 'Create and publish' : 'Save live update'}</button>
            {mode === 'update' && editing ? <button type="button" className="danger-action" disabled={busy || !tokenReady} onClick={() => remove(editing)}><Trash2 size={15} />Delete</button> : null}
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
      <button type="button" disabled={!hasQueenbeeToken() || busy === 'upload' || !file} onClick={uploadImage}>Upload</button>
      <button type="button" disabled={!hasQueenbeeToken() || busy === 'load'} onClick={loadImages}>List existing</button>
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

function NucleusAdminPage({ data }: { data: DashboardData }) {
  const [formValues, setFormValues] = useState({ title: '', body: '', topic: 'maintenance', screen: '', scheduledAt: '' })
  const [history, setHistory] = useState<AppNotificationHistoryEntry[]>([])
  const [scheduled, setScheduled] = useState<ScheduledAppNotificationEntry[]>([])
  const [message, setMessage] = useState('Ready to manage Nucleus notifications.')
  const [busy, setBusy] = useState('')
  const tokenReady = hasAppApiAdminToken()
  const status: ServiceStatus = tokenReady ? 'live' : 'locked'

  async function loadHistory() {
    if (!tokenReady) {
      setHistory([])
      setMessage('Add an App API admin token in Settings to load notification history.')
      return
    }
    setBusy('history')
    try {
      const result = await appApiRequest<AppNotificationHistoryEntry[]>({ path: 'notifications?limit=12' })
      setHistory(Array.isArray(result) ? result : [])
      setMessage(`Loaded ${Array.isArray(result) ? result.length : 0} sent notifications.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load notification history.')
    } finally {
      setBusy('')
    }
  }

  async function loadScheduled() {
    if (!tokenReady) {
      setScheduled([])
      setMessage('Add an App API admin token in Settings to load scheduled notifications.')
      return
    }
    setBusy('scheduled')
    try {
      const result = await appApiRequest<ScheduledAppNotificationEntry[]>({ path: 'notifications/scheduled?limit=12' })
      setScheduled(Array.isArray(result) ? result : [])
      setMessage(`Loaded ${Array.isArray(result) ? result.length : 0} scheduled notifications.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load scheduled notifications.')
    } finally {
      setBusy('')
    }
  }

  useEffect(() => {
    if (!tokenReady) return
    void loadHistory()
    void loadScheduled()
  }, [tokenReady])

  async function pushNotification(schedule: boolean) {
    if (!tokenReady) {
      setMessage('Add an App API admin token in Settings before sending notifications.')
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
      await appApiRequest({ path: schedule ? 'notifications/scheduled' : 'notifications', method: 'POST', data: payload, timeoutMs: 15000 })
      setMessage(schedule ? 'Notification scheduled.' : 'Notification sent.')
      await Promise.all([loadHistory(), loadScheduled()])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Notification request failed.')
    } finally {
      setBusy('')
    }
  }

  async function runScheduled(item: ScheduledAppNotificationEntry) {
    if (!tokenReady) {
      setMessage('Add an App API admin token in Settings before sending scheduled notifications.')
      return
    }
    if (!window.confirm(`Send scheduled notification "${item.title}" now? This may notify subscribed app users.`)) return
    setBusy(`run-${item.id}`)
    try {
      await appApiRequest({ path: `notifications/scheduled/${item.id}/send`, method: 'POST', timeoutMs: 15000 })
      setMessage('Scheduled notification sent.')
      await Promise.all([loadHistory(), loadScheduled()])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send scheduled notification.')
    } finally {
      setBusy('')
    }
  }

  async function cancelScheduled(item: ScheduledAppNotificationEntry) {
    if (!tokenReady) {
      setMessage('Add an App API admin token in Settings before cancelling scheduled notifications.')
      return
    }
    if (!window.confirm(`Cancel scheduled notification "${item.title}"?`)) return
    setBusy(`cancel-${item.id}`)
    try {
      await appApiRequest({ path: `notifications/scheduled/${item.id}`, method: 'DELETE' })
      setMessage('Scheduled notification cancelled.')
      await loadScheduled()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to cancel scheduled notification.')
    } finally {
      setBusy('')
    }
  }

  async function resendHistory(item: AppNotificationHistoryEntry) {
    if (!tokenReady) {
      setMessage('Add an App API admin token in Settings before resending notifications.')
      return
    }
    if (!window.confirm(`Resend notification "${item.title}" to topic "${item.topic}"? This may notify subscribed app users.`)) return
    setBusy(`resend-${item.id}`)
    try {
      await appApiRequest({ path: `notifications/${item.id}/resend`, method: 'POST', timeoutMs: 15000 })
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
      {!tokenReady ? (
        <div className="locked-notice">
          <KeyRound size={18} />
          <span>Add an App API admin token in Settings to load notification history, schedule pushes, or send/resend notifications.</span>
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
            <button type="submit" disabled={!tokenReady || busy === 'send'}><Send size={14} />Send</button>
            <button type="button" disabled={!tokenReady || busy === 'schedule-submit'} onClick={() => void pushNotification(true)}><CalendarClock size={14} />Schedule</button>
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
        <button type="submit" disabled={!hasQueenbeeToken()}><RefreshCcw size={14} />Load detail</button>
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
        <button type="submit" disabled={!hasQueenbeeToken()}><RefreshCcw size={14} />Apply</button>
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
        <button type="submit" disabled={!hasQueenbeeToken()}><RefreshCcw size={14} />Apply</button>
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
    <PagePanel title="DB Restore" status={hasQueenbeeToken() ? 'live' : 'locked'}>
      <form className="mini-admin-form inline" onSubmit={loadFiles}>
        <h3>Find backup files</h3>
        <label className="editor-field"><span>Service</span><input value={service} onChange={(event) => setService(event.target.value)} /></label>
        <label className="editor-field"><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <button type="submit" disabled={!hasQueenbeeToken()}><RefreshCcw size={14} />Load</button>
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
        <button type="submit" disabled={!hasQueenbeeToken()}><RefreshCcw size={14} />Apply</button>
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
  const [tokenDraft, setTokenDraft] = useState(() => getQueenbeeToken())
  const [tokenSaved, setTokenSaved] = useState(() => hasQueenbeeToken())
  const [appTokenDraft, setAppTokenDraft] = useState(() => getAppApiAdminToken())
  const [appTokenSaved, setAppTokenSaved] = useState(() => hasAppApiAdminToken())

  function saveToken() {
    setQueenbeeToken(tokenDraft)
    setTokenSaved(Boolean(tokenDraft.trim()))
  }

  function saveAppToken() {
    setAppApiAdminToken(appTokenDraft)
    setAppTokenSaved(Boolean(appTokenDraft.trim()))
  }

  return (
    <div className="settings-grid">
      <section className="settings-card full-span">
        <div className="settings-card-head">
          <div>
            <h2>Appearance</h2>
            <p>Use light, dark, or follow the system theme.</p>
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
        <PanelTitle title="Queenbee Write Access" subtitle="Local bearer token for protected create/update/delete calls" />
        <div className="token-box">
          <label>
            <span>Access token</span>
            <input type="password" value={tokenDraft} onChange={(event) => setTokenDraft(event.target.value)} placeholder="Paste a Queenbee access token" />
          </label>
          <button onClick={saveToken}><KeyRound size={15} />{tokenSaved ? 'Update token' : 'Save token'}</button>
          <p>{tokenSaved ? 'Write actions are enabled locally and still ask for confirmation before pushing.' : 'Without a token, editor pages stay safely read-only.'}</p>
        </div>
      </section>
      <section className="settings-card">
        <PanelTitle title="Nucleus Push Access" subtitle="Optional App API admin token for notification history and scheduling" />
        <div className="token-box">
          <label>
            <span>App API token</span>
            <input type="password" value={appTokenDraft} onChange={(event) => setAppTokenDraft(event.target.value)} placeholder="Paste an App API admin token" />
          </label>
          <button onClick={saveAppToken}><KeyRound size={15} />{appTokenSaved ? 'Update token' : 'Save token'}</button>
          <p>{appTokenSaved ? 'Nucleus notification actions can use the stored App API bearer token.' : 'If the App API is restricted, Nucleus notification actions will stay locked until this is set.'}</p>
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
  const tokenReady = hasQueenbeeToken()

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
    <button className={dangerous ? 'danger-action' : ''} disabled={!tokenReady || state === 'busy'} onClick={run}>
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
  const tokenReady = hasQueenbeeToken()

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
      <button type="submit" disabled={!tokenReady || state === 'busy'}>
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
      <p>{status === 'live' ? `Beekeeper ${path} responded successfully.` : status === 'locked' ? `Beekeeper ${path} requires a Queenbee-authenticated token, so the desktop app shows the protected surface without leaking credentials.` : `Beekeeper ${path} could not be reached from the desktop app.`}</p>
      <button onClick={() => openInAppBrowser(`https://queenbee.login.no/internal${path.startsWith('/traffic') ? '/traffic' : path === '/db' ? '/db' : path === '/docker/logs' ? '/logs' : path === '/vulnerabilities' ? '/vulnerabilities' : '/loadbalancing'}`)}>
        Open in Queenbee <ExternalLink size={14} />
      </button>
    </div>
  )
}

function ProtectedQueenbeeGrid() {
  const cards = [
    ['Queenbee role', 'Use the web app session for write-capable and sensitive operational data.'],
    ['Desktop safety', 'The launcher does not bundle server tokens into browser JavaScript.'],
    ['Readiness', 'This page will hydrate automatically if a safe desktop Beekeeper token is configured.'],
  ]
  return <div className="queenbee-grid protected">{cards.map(([title, body]) => <article className="queenbee-card" key={title}><ShieldCheck size={18} /><h3>{title}</h3><p>{body}</p></article>)}</div>
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
        <button className="queenbee-op-card" key={title} onClick={() => openInAppBrowser(`https://queenbee.login.no/internal${path}`)}>
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

function ContentCollections({ data }: { data: DashboardData }) {
  return <div className="content-collections"><ContentCard title="Jobs" status={data.health.jobs} rows={data.jobs} getTitle={jobTitle} getMeta={jobMeta} getUrl={(job) => `https://login.no/career/${job.id}`} /><ContentCard title="Announcements" status={data.health.announcements} rows={data.announcements} getTitle={(item) => stringValue(item.title) || `Announcement #${item.id}`} getMeta={(item) => stringValue(item.description) || 'No description'} getUrl={() => 'https://queenbee.login.no/announcements'} /><ContentCard title="Rules" status={data.health.rules} rows={data.rules} getTitle={(item) => item.name_en || item.name_no || `Rules #${item.id}`} getMeta={(item) => stripMarkdown(item.description_en || item.description_no || '').slice(0, 80)} getUrl={() => 'https://login.no/events'} /><ContentCard title="Organizations" status={data.health.organizations} rows={data.organizations} getTitle={displayName} getMeta={(item) => item.city || item.address || formatDate(item.updated_at || item.created_at)} getUrl={(item) => `https://login.no/companies/${item.id}`} /><ContentCard title="Albums" status={data.health.albums} rows={data.albums} getTitle={displayName} getMeta={(item) => formatDate(item.updated_at || item.created_at)} getUrl={(item) => `https://login.no/albums/${item.id}`} getImage={(item) => albumImageUrl(item.id, item.cover || item.cover_image || item.image_small)} /></div>
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

function EndpointPill({ label, status, compact = false }: { label: string; status: ServiceStatus; compact?: boolean }) { return <span className={`endpoint-pill ${status} ${compact ? 'compact' : ''}`}><i />{label}: {status}</span> }
function HealthTag({ label, status }: { label: string; status: ServiceStatus }) { return <span className={`health-tag ${status}`}>{label}: {status}</span> }
function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) { return <div className="empty-state">{icon}<span>{label}</span></div> }
function DateBadge({ date, color }: { date?: string; color?: string }) { const parsed = date ? new Date(date) : null; const day = parsed && !Number.isNaN(parsed.getTime()) ? parsed.getDate() : '--'; const month = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString('no-NO', { month: 'short' }).replace('.', '') : 'TBA'; return <span className="date-badge" style={{ background: color || '#f58b45' }}><b>{day}</b><small>{month}</small></span> }
function LoginMark({ small = false }: { small?: boolean }) { return <img className={small ? 'login-mark small' : 'login-mark'} src="/assets/logo/icon.png" alt="Login logo" /> }
function combinedStatus(health: Record<string, ServiceStatus>, keys: string[]): ServiceStatus { const statuses = keys.map((key) => health[key]).filter(Boolean); if (statuses.length && statuses.every((status) => status === 'live')) return 'live'; if (statuses.some((status) => status === 'locked')) return 'locked'; return 'error' }
function openSource(item: RecentAddition) { const source = item.source || ''; if (source === 'events') return openInAppBrowser(`https://login.no/events/${item.id}`); if (source === 'jobs') return openInAppBrowser(`https://login.no/career/${item.id}`); if (source === 'albums') return openInAppBrowser(`https://login.no/albums/${item.id}`); if (source === 'organizations') return openInAppBrowser(`https://login.no/companies/${item.id}`); return openInAppBrowser('https://queenbee.login.no') }
function displayName(item: Partial<NamedItem | AlbumItem>) { return item.name_en || item.name_no || item.name || `#${item.id}` }
function stringValue(value: unknown) { return Array.isArray(value) ? value.filter(Boolean).join(' / ') : typeof value === 'string' ? value : '' }
function formatNumber(value?: number | string) { const number = typeof value === 'string' ? Number(value) : value; return typeof number === 'number' && Number.isFinite(number) ? Intl.NumberFormat('en-US', { notation: number > 99999 ? 'compact' : 'standard' }).format(number) : '0' }
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

declare global {
  interface Window {
    __loginDesktopRoot?: Root
  }
}

const rootElement = document.getElementById('root')!
window.__loginDesktopRoot ||= createRoot(rootElement)
window.__loginDesktopRoot.render(<App />)
