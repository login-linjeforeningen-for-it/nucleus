import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BriefcaseBusiness,
  CalendarDays,
  Database,
  Globe2,
  Grid2X2,
  Image,
  Loader2,
  MapPin,
  Megaphone,
  Monitor,
  PanelTopOpen,
  RefreshCcw,
  Server,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react'
import {
  AlbumItem,
  DashboardData,
  EventItem,
  JobItem,
  NamedItem,
  RecentAddition,
  ServiceStatus,
  albumImageUrl,
  eventImageUrl,
  loadDashboardData,
} from './lib/api'
import { AutoUpdateState, DESKTOP_APP_VERSION, fetchAppUpdateManifest, hasNewerDesktopVersion } from './lib/appUpdate'
import { BrowserTarget, openInAppBrowser } from './lib/inAppBrowser'
import './styles.css'

const links = [
  { label: 'login.no', url: 'https://login.no' },
  { label: 'Queenbee', url: 'https://queenbee.login.no' },
  { label: 'Nucleus', url: 'https://login.no/app' },
  { label: 'Status', url: 'https://login.no/status' },
]

const menu = [
  ['Dashboard', Grid2X2],
  ['Events', CalendarDays],
  ['Announcements', Megaphone],
  ['Albums', Image],
  ['Jobs', BriefcaseBusiness],
  ['Organizations', UsersRound],
  ['Locations', MapPin],
  ['Status', Monitor],
  ['Internal', ShieldCheck],
] as const

function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [browserTarget, setBrowserTarget] = useState<BrowserTarget | null>(null)
  const [updateState, setUpdateState] = useState<AutoUpdateState>({
    status: 'checking',
    message: 'Checking app-api for signed desktop updates...',
    manifest: null,
  })

  useEffect(() => {
    window.loginOpenInAppBrowser = setBrowserTarget

    return () => {
      delete window.loginOpenInAppBrowser
    }
  }, [])

  useEffect(() => {
    let active = true
    loadDashboardData()
      .then((next) => active && setData(next))
      .catch((err) => active && setError(err instanceof Error ? err.message : 'Unable to load Login data'))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function runAutoUpdate() {
      try {
        const manifest = await fetchAppUpdateManifest()
        if (!active) return

        if (!manifest || !hasNewerDesktopVersion(manifest)) {
          setUpdateState({
            status: 'current',
            message: `Login Desktop ${DESKTOP_APP_VERSION} is current.`,
            manifest,
          })
          return
        }

        setUpdateState({
          status: 'available',
          message: `Version ${manifest.version} is published. The signed native updater will install it and restart the app.`,
          manifest,
        })
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

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <LoginMark small />
          <span>Login Desktop</span>
        </div>
        <nav className="nav-list" aria-label="Login surfaces">
          {menu.map(([label, Icon], index) => (
            <button key={label} className={index === 0 ? 'nav-item active' : 'nav-item'}>
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="version">v{DESKTOP_APP_VERSION}</span>
          <span className="muted">Cross-platform launcher</span>
        </div>
      </aside>

      <section className="content">
        <Hero data={data} updateState={updateState} />
        {error ? <div className="error-card">{error}</div> : null}
        {!data ? <LoadingState /> : <Dashboard data={data} />}
      </section>
      <InAppBrowser target={browserTarget} onClose={() => setBrowserTarget(null)} />
    </main>
  )
}

function InAppBrowser({ target, onClose }: { target: BrowserTarget | null; onClose: () => void }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const [loadKey, setLoadKey] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!target) return
    setLoadKey((current) => current + 1)
    setLoading(true)
  }, [target])

  if (!target) return null

  function navigate(direction: 'back' | 'forward') {
    try {
      if (direction === 'back') frameRef.current?.contentWindow?.history.back()
      else frameRef.current?.contentWindow?.history.forward()
    } catch {
      // Cross-origin pages can block direct history access; the browser frame still remains usable.
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

function Hero({ data, updateState }: { data: DashboardData | null; updateState: AutoUpdateState }) {
  return (
    <header className="hero-card">
      <div className="hero-mark"><LoginMark /></div>
      <div className="hero-copy">
        <p className="eyebrow">Launcher for Login services</p>
        <h1>Velkommen til <span>login.no</span></h1>
        <p>
          Live desktop dashboard for Login content, Queenbee operations, service status,
          and quick-launch access across the ecosystem.
        </p>
        <div className="launcher-row">
          {links.map((link) => (
            <button key={link.url} className="launcher-button" onClick={() => openInAppBrowser({ url: link.url, title: `Login Browser · ${link.label}` })}>
              {link.label}<PanelTopOpen size={16} />
            </button>
          ))}
        </div>
      </div>
      <div className="sync-card">
        <span className="sync-dot" />
        <span>{data ? `Synced ${formatTime(data.fetchedAt)}` : 'Connecting to Login APIs'}</span>
      </div>
      <AutoUpdatePanel state={updateState} />
    </header>
  )
}

function AutoUpdatePanel({ state }: { state: AutoUpdateState }) {
  const Icon = state.status === 'available' || state.status === 'current'
    ? CheckCircle2
    : state.status === 'error'
      ? AlertCircle
      : RefreshCcw
  const manifest = state.manifest
  const firstPlatform = manifest?.platforms ? Object.keys(manifest.platforms)[0] : null
  const source = firstPlatform && manifest?.platforms?.[firstPlatform]?.url
    ? new URL(manifest.platforms[firstPlatform].url).pathname
    : '/api/desktop'

  return (
    <section className={`update-panel ${state.status}`} aria-label="Automatic desktop update">
      <div className="update-head">
        <span className="update-icon">
          <Icon size={17} className={state.status === 'checking' ? 'spin' : ''} />
        </span>
        <div>
          <p>Auto update</p>
          <strong>{updateTitle(state.status)}</strong>
        </div>
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
  switch (status) {
    case 'checking':
      return 'Checking'
    case 'available':
      return 'Update published'
    case 'current':
      return 'Up to date'
    case 'error':
      return 'Needs attention'
  }
}

function LoadingState() {
  return (
    <div className="loading-card">
      <Loader2 className="spin" />
      <span>Loading live Login dashboard data...</span>
    </div>
  )
}

function Dashboard({ data }: { data: DashboardData }) {
  return (
    <div className="dashboard-grid">
      <section className="source-strip full-span">
        <EndpointPill label="Workerbee" status={combinedStatus(data.health, ['events', 'jobs', 'organizations', 'locations', 'albums', 'categories', 'recent-additions'])} />
        <EndpointPill label="Beekeeper" status={combinedStatus(data.health, ['status', 'internal'])} />
        <EndpointPill label="Bot announcements" status={data.health.announcements || 'error'} />
      </section>

      <section className="metric-strip full-span">
        <Metric icon={<CalendarDays />} label="Events" value={data.counts.events} status={data.health.events} />
        <Metric icon={<BriefcaseBusiness />} label="Jobs" value={data.counts.jobs} status={data.health.jobs} />
        <Metric icon={<Megaphone />} label="Announcements" value={data.counts.announcements ?? 'Locked'} status={data.health.announcements} />
        <Metric icon={<UsersRound />} label="Organizations" value={data.counts.organizations} status={data.health.organizations} />
        <Metric icon={<MapPin />} label="Locations" value={data.counts.locations} status={data.health.locations} />
        <Metric icon={<Image />} label="Albums" value={data.counts.albums} status={data.health.albums} />
      </section>

      <section className="panel recent-panel">
        <PanelTitle title="Recent Additions" subtitle="Live /stats/new-additions" />
        <RecentList additions={data.additions} status={data.health['recent-additions']} />
      </section>

      <section className="panel chart-panel">
        <PanelTitle title="Event Categories" subtitle="Live /stats/categories" />
        <CategoryChart data={data.categories} status={data.health.categories} />
      </section>

      <section className="panel events-panel">
        <PanelTitle title="Upcoming Events" subtitle="Live /events" />
        <EventList events={data.events} status={data.health.events} />
      </section>

      <section className="panel status-panel">
        <PanelTitle title="Service Status" subtitle="Live /monitoring" />
        <StatusList services={data.statusServices} status={data.health.status} />
      </section>

      <section className="panel full-span">
        <PanelTitle title="More Login Content" subtitle="Live Workerbee collections" />
        <ContentCollections data={data} />
      </section>

      <section className="panel internal-panel full-span">
        <PanelTitle title="Queenbee Internal Overview" subtitle="Live /dashboard/internal" />
        <InternalOverview data={data.internal} health={data.health} />
      </section>
    </div>
  )
}

function Metric({ icon, label, value, status = 'error' }: { icon: React.ReactNode; label: string; value: number | string; status?: ServiceStatus }) {
  return (
    <article className={`metric-card ${status}`}>
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{status}</small>
    </article>
  )
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="panel-title">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <Sparkles size={18} />
    </div>
  )
}

function RecentList({ additions, status }: { additions: RecentAddition[]; status?: ServiceStatus }) {
  if (status !== 'live') return <EmptyState icon={<AlertCircle />} label={`Recent additions endpoint is ${status || 'unavailable'}.`} />
  if (!additions.length) return <EmptyState icon={<AlertCircle />} label="No recent additions returned from Workerbee." />

  return (
    <div className="recent-list">
      {additions.map((item) => (
        <button className="recent-row" key={`${item.source}-${item.id}-${item.updated_at}`} onClick={() => openSource(item)}>
          <span className={item.action === 'updated' ? 'row-action updated' : 'row-action'}>{item.action === 'updated' ? '↻' : '+'}</span>
          <div>
            <strong>{item.name_en || item.name_no || 'Untitled'}</strong>
            <span>{item.source || 'content'} · {item.action || 'created'}</span>
          </div>
          <time>{formatDate(item.updated_at || item.created_at)}</time>
        </button>
      ))}
    </div>
  )
}

function CategoryChart({ data, status }: { data: DashboardData['categories']; status?: ServiceStatus }) {
  if (status !== 'live') return <EmptyState icon={<AlertCircle />} label={`Category stats endpoint is ${status || 'unavailable'}.`} />
  if (!data.length) return <EmptyState icon={<AlertCircle />} label="No event categories returned from Workerbee." />

  const total = data.reduce((sum, item) => sum + Number(item.event_count || 0), 0) || 1
  let cursor = 0
  const gradient = data.map((item) => {
    const start = cursor
    cursor += (Number(item.event_count || 0) / total) * 360
    return `${item.color || '#f58b45'} ${start}deg ${cursor}deg`
  }).join(', ')

  return (
    <div className="category-wrap">
      <div className="pie" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="legend">
        {data.map((item) => (
          <span key={item.name_en || item.id}>
            <i style={{ background: item.color || '#f58b45' }} />
            {item.name_en || item.name_no || 'Other'} ({item.event_count || 0})
          </span>
        ))}
      </div>
    </div>
  )
}

function EventList({ events, status }: { events: EventItem[]; status?: ServiceStatus }) {
  if (status !== 'live') return <EmptyState icon={<CalendarDays />} label={`Events endpoint is ${status || 'unavailable'}.`} />
  if (!events.length) return <EmptyState icon={<CalendarDays />} label="No upcoming events returned from Workerbee." />

  return (
    <div className="event-list">
      {events.slice(0, 6).map((event) => (
        <button className="event-row" key={event.id} onClick={() => openInAppBrowser(`https://login.no/events/${event.id}`)}>
          <DateBadge date={event.time_start} color={event.category?.color} />
          <div>
            <strong>{event.name_en || event.name_no || 'Untitled event'}</strong>
            <span>{formatEventMeta(event)}</span>
          </div>
          {event.image_small || event.image_banner
            ? <img src={eventImageUrl(event.image_small || event.image_banner)} alt="" />
            : <span className="category-thumb" style={{ background: event.category?.color || '#f58b45' }}>{event.category?.name_en || 'Login'}</span>}
        </button>
      ))}
    </div>
  )
}

function StatusList({ services, status }: { services: DashboardData['statusServices']; status?: ServiceStatus }) {
  if (status !== 'live') return <EmptyState icon={<Monitor />} label={`Status endpoint is ${status || 'unavailable'}.`} />
  const shown = services.slice(0, 6)
  if (!shown.length) return <EmptyState icon={<AlertCircle />} label="Status endpoint returned no services." />

  return (
    <div className="status-list">
      {shown.map((service) => {
        const latest = service.bars?.[0]
        const up = latest?.status === true || latest?.status === 1
        return (
          <div className="status-row" key={service.id}>
            <span className={up ? 'status-light up' : 'status-light'} />
            <div>
              <strong>{service.name}</strong>
              <span>{service.url || 'Login service'} · {latest?.delay ? `${Math.round(latest.delay)} ms` : 'waiting'}</span>
            </div>
            <b>{up ? 'UP' : 'CHECK'}</b>
          </div>
        )
      })}
    </div>
  )
}

function ContentCollections({ data }: { data: DashboardData }) {
  return (
    <div className="content-collections">
      <ContentCard title="Jobs" status={data.health.jobs} rows={data.jobs} getTitle={jobTitle} getMeta={jobMeta} getUrl={(job) => `https://login.no/career/${job.id}`} />
      <ContentCard title="Organizations" status={data.health.organizations} rows={data.organizations} getTitle={displayName} getMeta={(item) => item.city || item.address || formatDate(item.updated_at || item.created_at)} getUrl={(item) => `https://login.no/companies/${item.id}`} />
      <ContentCard title="Locations" status={data.health.locations} rows={data.locations} getTitle={displayName} getMeta={(item) => item.address || item.city || formatDate(item.updated_at || item.created_at)} getUrl={() => 'https://login.no/events'} />
      <ContentCard title="Albums" status={data.health.albums} rows={data.albums} getTitle={displayName} getMeta={(item) => formatDate(item.updated_at || item.created_at)} getUrl={(item) => `https://login.no/albums/${item.id}`} getImage={(item) => albumImageUrl(item.id, item.cover || item.cover_image || item.image_small)} />
    </div>
  )
}

function ContentCard<T extends { id: number | string }>({
  title,
  status,
  rows,
  getTitle,
  getMeta,
  getUrl,
  getImage,
}: {
  title: string
  status?: ServiceStatus
  rows: T[]
  getTitle: (row: T) => string
  getMeta: (row: T) => string
  getUrl: (row: T) => string
  getImage?: (row: T) => string
}) {
  return (
    <article className="content-card">
      <h3>{title} <EndpointPill label={status || 'error'} status={status || 'error'} compact /></h3>
      {status !== 'live' ? <EmptyState icon={<AlertCircle />} label={`${title} endpoint is ${status || 'unavailable'}.`} /> : null}
      {status === 'live' && !rows.length ? <EmptyState icon={<AlertCircle />} label={`No ${title.toLowerCase()} returned.`} /> : null}
      {status === 'live' && rows.length ? rows.slice(0, 5).map((row) => {
        const image = getImage?.(row)
        return (
          <button className="content-row" key={row.id} onClick={() => openInAppBrowser(getUrl(row))}>
            {image ? <img src={image} alt="" /> : <span>{getTitle(row).slice(0, 1)}</span>}
            <div>
              <strong>{getTitle(row)}</strong>
              <small>{getMeta(row)}</small>
            </div>
          </button>
        )
      }) : null}
    </article>
  )
}

function InternalOverview({ data, health }: { data: DashboardData['internal']; health: Record<string, ServiceStatus> }) {
  const overview = data
  if (health.internal !== 'live' || !overview) {
    return <EmptyState icon={<Server />} label={`Internal dashboard endpoint is ${health.internal || 'unavailable'}.`} />
  }

  const system = overview.runtime.metrics.system
  const topStats = [
    ['Alerts', overview.statistics.alerts, AlertCircle],
    ['Databases', overview.statistics.databases, Database],
    ['Sites', overview.statistics.sites, Globe2],
    ['Monitored Sites', overview.statistics.monitored, Activity],
    ['Requests Today', overview.statistics.requestsToday, Monitor],
  ] as const

  return (
    <div className="internal-grid">
      {topStats.map(([label, value, Icon]) => (
        <article className="internal-stat" key={label}>
          <Icon size={22} />
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
      <article className="resource-card">
        <h3>Primary Site</h3>
        <p>{overview.information.primarySite.name}</p>
        <code>{overview.information.primarySite.ip}</code>
      </article>
      <article className="resource-card">
        <h3>Operating System</h3>
        <p>{system.os}</p>
      </article>
      <article className="resource-card">
        <h3>Memory Usage</h3>
        <div className="progress"><span style={{ width: `${Number(system.memory.percent) || 0}%` }} /></div>
        <p>{system.memory.percent || 0}%</p>
      </article>
      <article className="resource-card health-card">
        <h3>Endpoint Health</h3>
        <div className="health-tags">
          {Object.entries(health).map(([key, status]) => <HealthTag key={key} label={key} status={status} />)}
        </div>
      </article>
    </div>
  )
}

function EndpointPill({ label, status, compact = false }: { label: string; status: ServiceStatus; compact?: boolean }) {
  return <span className={`endpoint-pill ${status} ${compact ? 'compact' : ''}`}><i />{label}: {status}</span>
}

function HealthTag({ label, status }: { label: string; status: ServiceStatus }) {
  return <span className={`health-tag ${status}`}>{label}: {status}</span>
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="empty-state">{icon}<span>{label}</span></div>
}

function DateBadge({ date, color }: { date?: string; color?: string }) {
  const parsed = date ? new Date(date) : null
  const day = parsed && !Number.isNaN(parsed.getTime()) ? parsed.getDate() : '--'
  const month = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString('no-NO', { month: 'short' }).replace('.', '') : 'TBA'

  return (
    <span className="date-badge" style={{ background: color || '#f58b45' }}>
      <b>{day}</b>
      <small>{month}</small>
    </span>
  )
}

function LoginMark({ small = false }: { small?: boolean }) {
  return (
    <div className={small ? 'login-mark small' : 'login-mark'} aria-label="Login logo mark">
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="letter">L</span>
      <span className="corner bl" />
      <span className="corner br" />
    </div>
  )
}

function combinedStatus(health: Record<string, ServiceStatus>, keys: string[]): ServiceStatus {
  const statuses = keys.map((key) => health[key]).filter(Boolean)
  if (statuses.length && statuses.every((status) => status === 'live')) return 'live'
  if (statuses.some((status) => status === 'locked')) return 'locked'
  return 'error'
}

function openSource(item: RecentAddition) {
  const source = item.source || ''
  if (source === 'events') return openInAppBrowser(`https://login.no/events/${item.id}`)
  if (source === 'jobs') return openInAppBrowser(`https://login.no/career/${item.id}`)
  if (source === 'albums') return openInAppBrowser(`https://login.no/albums/${item.id}`)
  if (source === 'organizations') return openInAppBrowser(`https://login.no/companies/${item.id}`)
  return openInAppBrowser('https://queenbee.login.no')
}

function displayName(item: NamedItem | AlbumItem) {
  return item.name_en || item.name_no || item.name || `#${item.id}`
}

function jobTitle(job: JobItem) {
  return job.title_en || job.title_no || job.title || job.name_en || job.name_no || `Job #${job.id}`
}

function jobMeta(job: JobItem) {
  const organization = job.organization
    ? displayName(job.organization as NamedItem)
    : job.organizations?.map((item) => displayName(item as NamedItem)).filter(Boolean).join(', ')
  const deadline = job.deadline ? `Deadline ${formatDate(job.deadline)}` : formatDate(job.updated_at || job.created_at)
  return organization ? `${organization} · ${deadline}` : deadline
}

function formatDate(value?: string) {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No date'
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
}

function formatTime(value: string) {
  const date = new Date(value)
  return date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
}

function formatEventMeta(event: EventItem) {
  const date = event.time_start ? new Date(event.time_start) : null
  const time = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('no-NO', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'Time TBA'
  const location = event.location?.name || event.location?.name_en || event.location?.name_no
  return location ? `${time} · ${location}` : time
}

createRoot(document.getElementById('root')!).render(<App />)
