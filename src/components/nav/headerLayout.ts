const MAX_COMPACT_HEADER_TITLE_LENGTH = 37
const HEADER_ACTION_SLOT_SIZE = 24
const HEADER_ACTION_GAP = 24
const HEADER_MENU_ACTION_GAP = 24

export const HEADER_RIGHT_INSET = 18
export const HEADER_TITLE_GAP = 16

const AI_POSITIONED_RIGHT_ROUTES = [
    'AiScreen',
    'QueenbeeScreen',
    'StatusScreen',
    'LoadBalancingScreen',
    'DatabaseScreen',
    'VulnerabilitiesScreen',
    'LogsScreen',
    'TrafficScreen',
    'TrafficRecordsScreen',
    'TrafficMapScreen',
    'ContentScreen',
    'AnnouncementsScreen',
    'AlertsScreen',
    'NucleusDocumentationScreen',
    'HoneyScreen',
    'DatabaseBackupsScreen',
]

export function getInternalDashboardRoutes() {
    return AI_POSITIONED_RIGHT_ROUTES.filter(routeName => routeName !== 'AiScreen')
}

export function getRightRailWidth(actionCount: number) {
    if (!actionCount) {
        return 0
    }

    const remainingGaps = Math.max(0, actionCount - 2)
    const gapWidth = actionCount > 1 ? HEADER_MENU_ACTION_GAP + remainingGaps * HEADER_ACTION_GAP : 0

    return actionCount * HEADER_ACTION_SLOT_SIZE + gapWidth
}

export function getRightActionOffset(index: number) {
    if (index === 0) {
        return 0
    }

    return HEADER_ACTION_SLOT_SIZE + HEADER_MENU_ACTION_GAP
        + (index - 1) * (HEADER_ACTION_SLOT_SIZE + HEADER_ACTION_GAP)
}

export function getCompactHeaderTitle({ value, fallback }: { value?: string, fallback: string }) {
    const normalized = value?.trim()

    if (!normalized) {
        return fallback
    }

    return normalized.length > MAX_COMPACT_HEADER_TITLE_LENGTH
        ? fallback
        : normalized
}
