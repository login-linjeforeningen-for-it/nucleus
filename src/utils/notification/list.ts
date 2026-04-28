import { isObject, parseResponseBody } from '@utils/http'

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000

export function parseNotificationList(raw: string | null): NotificationListProps[] {
    if (!raw) {
        return []
    }

    try {
        const parsed = parseResponseBody(raw)
        if (!Array.isArray(parsed)) {
            return []
        }

        return parsed
            .map(normalizeNotificationItem)
            .filter((item): item is NotificationListProps => item !== null)
    } catch {
        return []
    }
}

export function markNotificationsRead(list: NotificationListProps[]): NotificationListProps[] {
    return list.map((item) => ({ ...item, read: true }))
}

export function pruneOldNotifications(
    list: NotificationListProps[],
    now = Date.now()
): NotificationListProps[] {
    return list.filter((item) => {
        const timestamp = new Date(item.time).getTime()
        if (!Number.isFinite(timestamp)) {
            return true
        }

        return now - timestamp <= THIRTY_DAYS_IN_MS
    })
}

export function getFirstReadIndex(list: NotificationListProps[]): number {
    return list.findIndex((item) => item.read === true)
}

export function resolveNotificationTarget(data: NotificationListProps['data']) {
    const id = Number(data.id)
    const target = typeof data.target === 'string' ? data.target : null
    const screen = typeof data.screen === 'string' ? data.screen : null
    const isAd = typeof data.title_no === 'string' || typeof data.title_en === 'string'
    const isEvent = typeof data.name_no === 'string' || typeof data.name_en === 'string'

    if (target === 'menu' && screen) {
        return {
            kind: 'menu' as const,
            screen,
        }
    }

    if ((target === 'ad' || isAd) && Number.isFinite(id)) {
        return {
            kind: 'ad' as const,
            adID: id,
        }
    }

    if ((target === 'event' || isEvent) && Number.isFinite(id)) {
        return {
            kind: 'event' as const,
            eventID: id,
        }
    }

    return null
}

function normalizeNotificationData(data: unknown): NotificationListProps['data'] {
    return isObject(data) ? data : {}
}

function normalizeNotificationItem(value: unknown): NotificationListProps | null {
    if (!isObject(value)) {
        return null
    }

    const title = typeof value.title === 'string' ? value.title : ''
    const body = typeof value.body === 'string' ? value.body : ''
    const time = typeof value.time === 'string' ? value.time : new Date().toISOString()
    const id = typeof value.id === 'number' && Number.isFinite(value.id) ? value.id : Date.now()
    const read = value.read === true

    return {
        id,
        title,
        body,
        time,
        read,
        data: normalizeNotificationData(value.data),
    }
}
