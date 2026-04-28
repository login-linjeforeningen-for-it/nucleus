export type InternalNavRoute = Extract<keyof MenuStackParamList,
    'QueenbeeScreen'
    | 'StatusScreen'
    | 'LoadBalancingScreen'
    | 'TrafficScreen'
    | 'TrafficRecordsScreen'
    | 'TrafficMapScreen'
    | 'ContentScreen'
    | 'AnnouncementsScreen'
    | 'AlertsScreen'
    | 'HoneyScreen'
    | 'NucleusDocumentationScreen'
    | 'DatabaseScreen'
    | 'DatabaseBackupsScreen'
    | 'VulnerabilitiesScreen'
    | 'LogsScreen'
>

export type InternalMenuItem = {
    label: string
    description: string
    route: InternalNavRoute
}

const INTERNAL_ROUTES: InternalNavRoute[] = [
    'AlertsScreen',
    'AnnouncementsScreen',
    'QueenbeeScreen',
    'ContentScreen',
    'DatabaseScreen',
    'HoneyScreen',
    'StatusScreen',
    'LoadBalancingScreen',
    'LogsScreen',
    'NucleusDocumentationScreen',
    'TrafficScreen',
    'VulnerabilitiesScreen',
]

export function getInternalMenuItems(lang: boolean): InternalMenuItem[] {
    return [
        {
            label: lang ? 'Varsler' : 'Alerts',
            description: lang ? 'Sidevarsler fra Workerbee' : 'Website page alerts from Workerbee',
            route: 'AlertsScreen',
        },
        {
            label: lang ? 'Kunngjøringer' : 'Announcements',
            description: lang ? 'Discord kunngjøringer fra TekKom-boten' : 'Discord announcements from the TekKom bot',
            route: 'AnnouncementsScreen',
        },
        {
            label: lang ? 'Dashboard' : 'Dashboard',
            description: lang ? 'Oversikt, nøkkeltall og hurtigstatus' : 'Overview, dashboard metrics, and quick status',
            route: 'QueenbeeScreen',
        },
        {
            label: lang ? 'Innhold' : 'Content',
            description: lang ? 'Regler, lokasjoner og organisasjoner' : 'Rules, locations, and organizations',
            route: 'ContentScreen',
        },
        {
            label: lang ? 'Databaser' : 'Databases',
            description: lang ? 'Klynger, aktive spørringer, tabeller og sikkerhetskopier' : 'Clusters, active queries, tables, and backups',
            route: 'DatabaseScreen',
        },
        {
            label: 'Honey',
            description: lang ? 'Tekstsnutter og sideinnhold for tjenester' : 'Service text snippets and page content',
            route: 'HoneyScreen',
        },
        {
            label: lang ? 'Intern status' : 'Internal status',
            description: lang ? 'Containere, vertsmålinger og oppetid' : 'Containers, host metrics, and uptime',
            route: 'StatusScreen',
        },
        {
            label: lang ? 'Lastbalansering' : 'Load balancing',
            description: lang ? 'Trafikkmål og bytte av primærnode' : 'Traffic targets and primary switching',
            route: 'LoadBalancingScreen',
        },
        {
            label: lang ? 'Logger' : 'Logs',
            description: lang ? 'Interne applikasjons- og vertslogger' : 'Internal application and host logs',
            route: 'LogsScreen',
        },
        {
            label: lang ? 'Nucleus dokumentasjon' : 'Nucleus docs',
            description: lang ? 'Varslinger' : 'Notifications',
            route: 'NucleusDocumentationScreen',
        },
        {
            label: lang ? 'Trafikk' : 'Traffic',
            description: lang ? 'Forespørsler, domener, stier og klienter' : 'Request metrics, domains, paths, and clients',
            route: 'TrafficScreen',
        },
        {
            label: lang ? 'Sårbarheter' : 'Vulnerabilities',
            description: lang ? 'Images, skanninger og funn' : 'Images, scans, and findings',
            route: 'VulnerabilitiesScreen',
        },
    ]
}

export function sortInternalMenuItems(first: InternalMenuItem, second: InternalMenuItem, pinnedRoutes: string[], lang: boolean) {
    const firstPinnedIndex = pinnedRoutes.indexOf(first.route)
    const secondPinnedIndex = pinnedRoutes.indexOf(second.route)
    const firstPinned = firstPinnedIndex !== -1
    const secondPinned = secondPinnedIndex !== -1

    if (firstPinned || secondPinned) {
        return (firstPinned ? firstPinnedIndex : pinnedRoutes.length) - (secondPinned ? secondPinnedIndex : pinnedRoutes.length)
    }

    if (first.route === 'QueenbeeScreen') return -1
    if (second.route === 'QueenbeeScreen') return 1

    return first.label.localeCompare(second.label, lang ? 'nb' : 'en')
}

export function countHiddenInternalRoutes(hiddenRoutes: string[], activeRoute?: string) {
    const internalRoutes = new Set<InternalNavRoute>(INTERNAL_ROUTES)

    return hiddenRoutes.filter((route): route is InternalNavRoute =>
        internalRoutes.has(route as InternalNavRoute) && route !== activeRoute
    ).length
}
