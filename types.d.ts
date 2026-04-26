// Configured in this file to be globally accessable.
declare module '*.svg' {
    const content: string
    export default content
}

// Events
type EventProps = {
    visible: boolean
    name_no: string
    name_en: string
    description_no: string
    description_en: string
    informational_no: string
    informational_en: string
    time_type: time_type
    time_start: string
    time_end: string
    time_publish: string
    time_signup_release: string | null
    time_signup_deadline: string | null
    canceled: boolean
    digital: boolean
    highlight: boolean
    image_small: string | null
    image_banner: string | null
    link_facebook: string | null
    link_discord: string | null
    link_signup: string | null
    link_stream: string | null
    capacity: number | null
    is_full: boolean
}

type GetEventProps = EventProps & {
    id: number
    category: GetCategoryProps
    location: GetLocationProps | null
    parent_id: number | null
    rule: GetRuleProps | null
    audience: GetAudienceProps | null
    organization: GetOrganizationProps | null
    updated_at: string
    created_at: string
}

type GetRuleProps = Rule & {
    id: number
    created_at: string
    updated_at: string
}

type GetCategoryProps = {
    id: number
    name_no: string
    name_en: string
    color: string
    created_at: string
    updated_at: string
}

type GetLocationProps = LocationProps & {
    id: number
    created_at: string
    updated_at: string
}

type GetEventsProps = {
    events: GetEventProps[]
    total_count: number
}

type GetAlbumEventProps = {
    id: number
    name_no: string
    name_en: string
    time_start: string | null
    time_end: string | null
}

type GetAlbumProps = {
    id: number
    name_no: string
    name_en: string
    description_no: string
    description_en: string
    year: number
    created_at: string
    updated_at: string
    images: string[] | null
    image_count: number
    event: GetAlbumEventProps | null
}

type GetAlbumsProps = {
    albums: GetAlbumProps[]
    total_count: number
}

type FundHoldingsTotal = {
    totalBase: number
    currency: string
    updatedAt: number
}

type FundHoldingsRange = '1m' | '6m'

type FundHoldingsHistoryPoint = {
    date: string
    totalBase: number
}

type FundHoldingsHistory = {
    points: FundHoldingsHistoryPoint[]
    currency: string
    updatedAt: number
}

type System = {
    ram: string
    processes: number
    disk: string
    load: string
    containers: number
}

type DatabaseOverviewQuery = {
    database: string
    user: string | null
    application: string | null
    ageSeconds: number
    waitEventType: string | null
    query: string
}

type DatabaseOverviewAverageQuery = {
    lastMinute: number | null
    lastFiveMinutes: number | null
    lastHour: number | null
    lastDay: number | null
}

type DatabaseOverviewTable = {
    schema: string
    name: string
    estimatedRows: number
    tableBytes: number
    indexBytes: number
    totalBytes: number
}

type DatabaseOverviewItem = {
    name: string
    sizeBytes: number
    tableCount: number
    activeQueries: number
    currentConnections: number
    longestQuerySeconds: number | null
    averageQuerySeconds: DatabaseOverviewAverageQuery
    largestTable: string | null
    tables: DatabaseOverviewTable[]
}

type DatabaseOverviewCluster = {
    id: string
    name: string
    project: string
    status: string
    databaseCount: number
    totalSizeBytes: number
    activeQueries: number
    currentConnections: number
    longestQuery: DatabaseOverviewQuery | null
    averageQuerySeconds: DatabaseOverviewAverageQuery
    databases: DatabaseOverviewItem[]
    error: string | null
}

type GetDatabaseOverview = {
    generatedAt: string
    clusterCount: number
    databaseCount: number
    totalSizeBytes: number
    activeQueries: number
    longestQuery: DatabaseOverviewQuery | null
    averageQuerySeconds: DatabaseOverviewAverageQuery
    clusters: DatabaseOverviewCluster[]
}

type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'unknown'
type SeverityCount = Record<SeverityLevel, number>

type VulnerabilityGroup = {
    source: string
    total: number
    severity: SeverityCount
}

type VulnerabilityDetail = {
    id: string
    title: string
    severity: SeverityLevel
    source: string
    packageName: string | null
    packageType: string | null
    installedVersion: string | null
    fixedVersion: string | null
    description: string | null
    references: string[]
}

type ImageVulnerabilityReport = {
    image: string
    scannedAt: string
    totalVulnerabilities: number
    severity: SeverityCount
    groups: VulnerabilityGroup[]
    vulnerabilities: VulnerabilityDetail[]
    scanError: string | null
}

type DockerScoutScanStatus = {
    isRunning: boolean
    startedAt: string | null
    finishedAt: string | null
    lastSuccessAt: string | null
    lastError: string | null
    totalImages: number | null
    completedImages: number
    currentImage: string | null
    estimatedCompletionAt: string | null
}

type GetVulnerabilities = {
    generatedAt: string | null
    imageCount: number
    images: ImageVulnerabilityReport[]
    scanStatus: DockerScoutScanStatus
}

type LogEntry = {
    fingerprint: string
    raw: string
    message: string
    level: string
    timestamp: string | null
    isError: boolean
    structured: boolean
}

type LogContainer = {
    id: string
    name: string
    service: string
    status: string
    sourceType: 'container' | 'journal' | 'file' | 'history' | 'deployment'
    matchedLines: number
    entries: LogEntry[]
}

type LogsPayload = {
    server: string
    checkedAt: string
    filters: {
        service?: string
        container?: string
        search?: string
        level: 'all' | 'error'
        tail: number
    }
    totalContainers: number
    containers: LogContainer[]
}

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: object
    requiresAuth?: boolean
    includeAiSession?: boolean
}

type NativeModelMetrics = {
    conversationId: string | null
    status: 'idle' | 'preparing' | 'generating' | 'error'
    currentTokens: number
    maxTokens: number
    promptTokens: number
    generatedTokens: number
    contextTokens: number
    contextMaxTokens: number
    tps: number
    lastUpdated: string | null
    lastError: string | null
}

type NativeClient = {
    name: string
    model: NativeModelMetrics
}

type NativeConversationSummary = {
    id: string
    title: string
    originalClientName: string
    activeClientName: string
    createdAt: string
    updatedAt: string
    lastMessagePreview: string | null
    messageCount: number
}

type NativeStoredMessage = {
    id: string
    role: 'system' | 'user' | 'assistant'
    content: string
    error: boolean
    clientName: string | null
    createdAt: string
}

type NativeConversationRecord = NativeConversationSummary & {
    messages: NativeStoredMessage[]
}

type NativeLoadBalancingSite = {
    id: number
    name: string
    ip: string
    primary: boolean
    operational: boolean
    maintenance: boolean
    note: string | null
    updated_at: string
}

type NativeMonitoringBar = {
    status: boolean
    delay: number
    expectedDown: boolean
    timestamp: string
    note: string
}

type NativeMonitoringService = {
    id: number
    uptime: number
    name: string
    enabled: boolean
    notification: number | null
    maxConsecutiveFailures: number
    port: number | null
    tags: { id: number, name: string }[]
    bars: NativeMonitoringBar[]
    certificate?: unknown
}

type NativeDetailedMonitoringService = NativeMonitoringService & {
    type: 'fetch' | 'post' | 'tcp'
    url: string
    userAgent: string | null
    expectedDown: boolean
    upsideDown: boolean
    interval: number
    note: string
}

type NativeServiceNotification = {
    id: number
    name: string
    message: string
    webhook: string
}

type NativeServiceNotificationForm = {
    name: string
    message: string
    webhook: string
}

type NativeMonitoringServiceForm = {
    name: string
    type: 'fetch' | 'post' | 'tcp'
    url: string
    port: number
    interval: number
    userAgent: string | null
    notification: string | null
    expectedDown: boolean
    upsideDown: boolean
    maxConsecutiveFailures: number
    note: string
    enabled: boolean
}

type NativeInternalOverview = {
    system: System
    requestsToday: number
    databaseCount: number | null
    databaseOverview: GetDatabaseOverview | null
}

type TrafficRecord = {
    id: number
    timestamp: string
    method: string
    path: string
    domain: string
    country_iso?: string
    status: number
    request_time: number
    user_agent?: string
    referer?: string
}

type TrafficRecordsProps = {
    result: TrafficRecord[]
    total: number
}

type TrafficEntry = {
    key: string
    count?: number
    avg_time?: number
}

type TrafficMetricsProps = {
    total_requests: number
    error_count: number
    avg_response_time: number
    avg_request_time?: number
    error_rate: number
    top_methods: TrafficEntry[]
    top_status_codes: TrafficEntry[]
    top_domains: TrafficEntry[]
    top_os: TrafficEntry[]
    top_browsers: TrafficEntry[]
    top_paths: TrafficEntry[]
    top_slow_paths: TrafficEntry[]
    top_error_paths: TrafficEntry[]
    requests_over_time: { key: string, count: number }[]
}

type NativeMusicActivity = {
    stats: {
        avg_seconds: number
        total_minutes: number
        total_minutes_this_year: number
        total_songs: number
    }
    currentlyListening: NativeMusicRow[]
    topFiveToday: NativeMusicRow[]
    topFiveThisWeek: NativeMusicRow[]
    topFiveThisMonth: NativeMusicRow[]
}

type NativeMusicRow = {
    id: number | string
    type: 'track' | 'episode' | 'artist' | 'album'
    name: string
    artist: string
    album: string | null
    image: string
    listens: number
    song_id?: string
    artist_id?: string
    album_id?: string
}

type NativeDashboardSummary = {
    counts: {
        events: number
        jobs: number
        organizations: number
        locations: number
        albums: number
    }
    categories: { id: number, name_en: string, event_count: number, color: string }[]
    additions: { id: number, name_en: string, updated_at: string, action: 'created' | 'updated', source: string }[]
    yearly: { insert_date: string, inserted_count: number }[]
}

type CourseNotesUpdateResult = {
    ok: boolean
    error?: string
}

type AuthentikProfile = {
    id: string
    name: string | null
    email: string | null
    username: string | null
    preferredUsername: string | null
    nickname: string | null
    givenName: string | null
    familyName: string | null
    emailVerified: boolean | null
    picture: string | null
    groups: string[]
    authentik: {
        available: boolean
        pk: number | string | null
        uid: string | null
        username: string | null
        name: string | null
        email: string | null
        isActive: boolean | null
        lastLogin: string | null
        dateJoined: string | null
        path: string | null
        type: string | null
        groups: unknown[]
        attributes: Record<string, unknown>
    }
}

type Navigation = import('@react-navigation/bottom-tabs').BottomTabNavigationProp<
    import('@react-navigation/native').ParamListBase,
    string,
    string
>

type NotificationScreenProps = {
    back: string
    navigation: Navigation
}

type TabBarProps<T extends keyof TabBarParamList> =
    import('@react-navigation/bottom-tabs').BottomTabScreenProps<TabBarParamList, T>

type EventStackParamList = {
    EventScreen: undefined
    SpecificEventScreen: { eventID: number }
}

type EventScreenProps<T extends keyof EventStackParamList> =
    import('@react-navigation/native').CompositeScreenProps<
        import('@react-navigation/stack').StackScreenProps<EventStackParamList, T>,
        import('@react-navigation/bottom-tabs').BottomTabScreenProps<TabBarParamList>
    >

type AdStackParamList = {
    AdScreen: undefined
    SpecificAdScreen: { adID: number }
}

type AdScreenProps<T extends keyof AdStackParamList> =
    import('@react-navigation/native').CompositeScreenProps<
        import('@react-navigation/stack').StackScreenProps<AdStackParamList, T>,
        import('@react-navigation/bottom-tabs').BottomTabScreenProps<TabBarParamList>
    >

type MenuRoutes =
    'ProfileScreen'
    | 'SettingScreen'
    | 'NotificationScreen'
    | 'AboutScreen'
    | 'BusinessScreen'
    | 'CourseScreen'
    | 'SpecificCourseScreen'
    | 'LoginScreen'
    | 'AiScreen'
    | 'QueenbeeScreen'
    | 'InternalScreen'
    | 'GameScreen'
    | 'SpecificGameScreen'
    | 'SearchScreen'
    | 'StatusScreen'
    | 'MusicScreen'
    | 'AlbumsScreen'
    | 'SpecificAlbumScreen'
    | 'FundScreen'
    | 'DashboardScreen'
    | 'LoadBalancingScreen'
    | 'TrafficScreen'
    | 'TrafficRecordsScreen'
    | 'TrafficMapScreen'
    | 'DatabaseScreen'
    | 'VulnerabilitiesScreen'
    | 'LogsScreen'

type ItemProps = {
    id: number
    nav: MenuRoutes
    title: string
}

type MenuProps<T extends keyof MenuStackParamList> =
    import('@react-navigation/stack').StackScreenProps<MenuStackParamList, T>

type MenuStackParamList = {
    ProfileScreen: undefined
    SettingScreen: undefined
    NotificationScreen: undefined
    AboutScreen: undefined
    BusinessScreen: undefined
    LoginScreen: undefined
    AiScreen: undefined
    QueenbeeScreen: undefined
    InternalScreen: undefined
    SearchScreen: undefined
    StatusScreen: undefined
    MusicScreen: undefined
    AlbumsScreen: undefined
    SpecificAlbumScreen: { albumID: number }
    FundScreen: undefined
    DashboardScreen: undefined
    LoadBalancingScreen: undefined
    TrafficScreen: undefined
    TrafficRecordsScreen: undefined
    TrafficMapScreen: undefined
    DatabaseScreen: undefined
    VulnerabilitiesScreen: undefined
    LogsScreen: undefined
    MenuScreen: undefined
    CourseScreen: undefined
    SpecificCourseScreen: { code: string, id: number }
    GameScreen: undefined
    SpecificGameScreen: { gameID: number, gameName: string }
    DiceScreen: undefined
}

type TabBarParamList = {
    EventNav: import('@react-navigation/native').NavigatorScreenParams<EventStackParamList>
    AdNav: import('@react-navigation/native').NavigatorScreenParams<AdStackParamList>
    MenuNav: import('@react-navigation/native').NavigatorScreenParams<MenuStackParamList>
}

type RootStackParamList = {
    Tabs: import('@react-navigation/native').NavigatorScreenParams<TabBarParamList>
    InfoModal: undefined
    NotificationModal: { title: string, body: string, data: Record<string, unknown> }
}

type RootStackProps<T extends keyof RootStackParamList> =
    import('@react-navigation/native').CompositeScreenProps<
        import('@react-navigation/stack').StackScreenProps<RootStackParamList, T>,
        import('@react-navigation/bottom-tabs').BottomTabScreenProps<TabBarParamList>
    >

// Jobs
type Job = {
    visible: boolean
    highlight: boolean
    title_no: string
    title_en: string
    cities: string[] | null
    skills: string[] | null
    position_title_no: string
    position_title_en: string
    description_short_no: string
    description_short_en: string
    description_long_no: string
    description_long_en: string
    job_type: GetJobTypeProps
    time_publish: string
    time_expire: string
    banner_image: string | null
    application_url: string | null
}

type GetJobTypeProps = {
    id: number
    name_no: string
    name_en: string
    updated_at: string
    created_at: string
}

type GetJobProps = Job & {
    id: number
    organization: GetOrganizationProps
    created_at: string
    updated_at: string
}

type GetOrganizationProps = Organization & {
    id: number
    created_at: string
    updated_at: string
}

type GetJobsProps = {
    jobs: GetJobProps[]
    total_count: number
}

type LocationProps = {
    name_no: string
    name_en: string
    type: string
    mazemap_campus_id: number | null
    mazemap_poi_id: number | null
    address_street: string | null
    address_postcode: number | null
    city_name: string | null
    coordinate_lat: number | null
    coordinate_lon: number | null
    url: string | null
}

type Rule = {
    id: number
    name_no: string
    name_en: string
    description_no: string
    description_en: string
    updated_at: string
    created_at: string
    deleted_at: string
}

type Organization = {
    shortname: string
    name_no: string
    name_en: string
    description_no: string
    description_en: string
    type: string
    link_homepage?: string
    link_linkedin: string
    link_facebook: string
    link_instagram: string
    logo: string
    created_at: string
    updated_at: string
    deleted_at: string
}

type Audience = {
    id: number
    name_no: string
    name_en: string
    description_no: string
    description_en: string
    created_at: string
    updated_at: string
    deleted_at: string
}

type Category = {
    id: number
    color: string
    name_no: string
    name_en: string
    description_no: string
    description_en: string
    updated_at: string
    created_at: string
}

type Job = {
    visible: boolean
    highlight: boolean
    title_no: string
    title_en: string
    cities: string[] | null
    skills: string[] | null
    position_title_no: string
    position_title_en: string
    description_short_no: string
    description_short_en: string
    description_long_no: string
    description_long_en: string
    job_type: GetJobTypeProps
    time_publish: string
    time_expire: string
    banner_image: string | null
    application_url: string | null
}

type GetJobProps = Job & {
    id: number
    organization: GetOrganizationProps
    created_at: string
    updated_at: string
}

type ReduxState = {
    theme: {
        value: number
        isDark: boolean
        theme: Theme
    }
    login: {
        login: boolean
        token: string | null
        groups: string[]
        target: string | null
    }
    lang: {
        lang: boolean
    }
    misc: {
        localTitle: {
            title: string
            screen: string
        }
        calendarID: string
    }
    notification: NotificationProps
    profile: ProfileProps
    event: {
        events: GetEventProps[]
        eventName: string
        clickedEvents: GetEventProps[]
        renderedEvents: GetEventProps[]
        lastFetch: string
        lastSave: string
        search: boolean
        categories: {
            no: string[]
            en: string[]
        }
        clickedCategories: string[]
        input: string
        downloadState: Date
        tag: {
            title: string
            body: string
        }
        notification: NotificationModal
    }
    ad: {
        ads: AdProps[]
        adName: string
        history: number[]
        clickedAds: AdProps[]
        renderedAds: AdProps[]
        lastFetch: string
        lastSave: string
        search: boolean
        skills: string[]
        clickedSkills: string[]
        input: string
        downloadState: Date
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProfileProps = any

type CategoryProps =
    'tekkom'
    | 'social'
    | 'ctf'
    | 'karrieredag'
    | 'fadderuka'
    | 'bedpres'
    | 'login'
    | 'annet'
    | 'TEKKOM'
    | 'SOCIAL'
    | 'CTF'
    | 'KARRIEREDAG'
    | 'FADDERUKA'
    | 'BEDPRES'
    | 'LOGIN'
    | 'ANNET'

type Interval = NodeJS.Timeout | number

type SettingProps = {
    id: number
    nav: string
    title: string
}

type CTX = {
    startY: number
}

type NotificationProps = {

    // Notification categories
    SETUP:              boolean[]
    IMPORTANT:          boolean[]
    TEKKOM:             boolean[]
    CTF:                boolean[]
    SOCIAL:             boolean[]
    BEDPRES:            boolean[]
    KARRIEREDAG:        boolean[]
    FADDERUKA:          boolean[]
    LOGIN:              boolean[]
    ANNET:              boolean[]

    // TekKom
    tekkom10m:          boolean[]
    tekkom30m:          boolean[]
    tekkom1h:           boolean[]
    tekkom2h:           boolean[]
    tekkom3h:           boolean[]
    tekkom6h:           boolean[]
    tekkom1d:           boolean[]
    tekkom2d:           boolean[]

    // Ctf
    ctf10m:             boolean[]
    ctf30m:             boolean[]
    ctf1h:              boolean[]
    ctf2h:              boolean[]
    ctf3h:              boolean[]
    ctf6h:              boolean[]
    ctf1d:              boolean[]
    ctf2d:              boolean[]

    // Social
    social10m:          boolean[]
    social30m:          boolean[]
    social1h:           boolean[]
    social2h:           boolean[]
    social3h:           boolean[]
    social6h:           boolean[]
    social1d:           boolean[]
    social2d:           boolean[]
    social1w:           boolean[]

    // Karrieredag
    karrieredag10m:     boolean[]
    karrieredag30m:     boolean[]
    karrieredag1h:      boolean[]
    karrieredag2h:      boolean[]
    karrieredag3h:      boolean[]
    karrieredag6h:      boolean[]
    karrieredag1d:      boolean[]
    karrieredag2d:      boolean[]
    karrieredag1w:      boolean[]

    // Fadderuka
    fadderuka10m:       boolean[]
    fadderuka30m:       boolean[]
    fadderuka1h:        boolean[]
    fadderuka2h:        boolean[]
    fadderuka3h:        boolean[]
    fadderuka6h:        boolean[]
    fadderuka1d:        boolean[]
    fadderuka2d:        boolean[]
    fadderuka1w:        boolean[]

    // Bedpres
    bedpres10m:         boolean[]
    bedpres30m:         boolean[]
    bedpres1h:          boolean[]
    bedpres2h:          boolean[]
    bedpres3h:          boolean[]
    bedpres6h:          boolean[]
    bedpres1d:          boolean[]
    bedpres2d:          boolean[]
    bedpres1w:          boolean[]

    // Login
    login10m:           boolean[]
    login30m:           boolean[]
    login1h:            boolean[]
    login2h:            boolean[]
    login3h:            boolean[]
    login6h:            boolean[]
    login1d:            boolean[]
    login2d:            boolean[]
    login1w:            boolean[]

    // Annet
    annet10m:           boolean[]
    annet30m:           boolean[]
    annet1h:            boolean[]
    annet2h:            boolean[]
    annet3h:            boolean[]
    annet6h:            boolean[]
    annet1d:            boolean[]
    annet2d:            boolean[]
    annet1w:            boolean[]

    // Key used for indexing
    [key: string]:      boolean[]
}

type NotificationListProps = {
    title: string
    body: string
    data: Record<string, unknown>
    time: string
    id: number
    read?: boolean
}

type Setting = {
    screen: string
    nav: string
    setting: {
        id: number
        nav: MenuRoutes
        title: string
    }[]
}

type ListFooterProps = {
    index: number
}

type Theme = {
    background: string
    darker: string
    contrast: string
    transparent: string
    transparentAndroid: string
    orange: string
    orangeTransparent: string
    orangeTransparentBorder: string
    orangeTransparentHighlighted: string
    orangeTransparentBorderHighlighted: string
    greyTransparent: string
    greyTransparentBorder: string
    discord: string
    textColor: string
    titleTextColor: string
    oppositeTextColor: string
    switchOnState: string
    switchOffState: string
    trackColor: string
    trackBackgroundColor: string
    dark: string
}

type Status = {
    token: string
    topics: string[]
}

type TopicManagerResult = {
    result: boolean
    feedback: string
}

type Tag = {
    title: string
    body: string
}

type NotificationModal = {
    title: string
    body: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
}

type Editing = {
    cards: Card[]
    texts: string[]
}

type Card = {
    question: string
    alternatives: string[]
    correct: number[]
    source: string
    rating: number
    votes: Vote[]
    help?: string
    theme?: string
}

type User = {
    name: string
    username: string
    time: number
    score: number
    solved: UserSolved[]
}

type Vote = {
    username: string
    vote: boolean
}

type CourseAsList = {
    id: number
    code: string
    cards: Card[]
    count: number
}

type Course = {
    id: string
    code: string
    name: string
    cards: Card[]
    notes: string
    learningBased: boolean
    files: Files
}

type Files = {
    id?: number
    name: string
    content: string
    files: Files[]
    parent?: string
}

type Game = {
    id: number
    name: string
    endpoint: string
    description_no: string
    description_en: string
}

type Question = {
    id: number
    title_no: string
    title_en: string
    categories: string[]
}

type NeverHaveIEver = {
    id: number
    title_no: string
    title_en: string
    categories: string[]
}

type OkRedFlagDealBreaker = {
    id: number
    title_no: string
    title_en: string
    categories: string[]
}
