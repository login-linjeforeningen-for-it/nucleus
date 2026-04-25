import {
    getFirstReadIndex,
    markNotificationsRead,
    parseNotificationList,
    pruneOldNotifications,
    resolveNotificationTarget,
} from '@utils/notification/list'

describe('notification list utilities', () => {
    test('parseNotificationList ignores malformed payloads', () => {
        expect(parseNotificationList(null)).toEqual([])
        expect(parseNotificationList('{')).toEqual([])
        expect(parseNotificationList(JSON.stringify({ nope: true }))).toEqual([])
    })

    test('parseNotificationList normalizes items safely', () => {
        const list = parseNotificationList(JSON.stringify([{
            id: 1,
            title: 'Hello',
            body: 'World',
            data: { id: 5 },
            time: '2026-04-25T12:00:00.000Z',
        }]))

        expect(list).toEqual([{
            id: 1,
            title: 'Hello',
            body: 'World',
            data: { id: 5 },
            time: '2026-04-25T12:00:00.000Z',
            read: false,
        }])
    })

    test('markNotificationsRead does not mutate and marks all items as read', () => {
        const source: NotificationListProps[] = [{
            id: 1,
            title: 'Title',
            body: 'Body',
            data: {},
            time: '2026-04-25T12:00:00.000Z',
        }]

        const next = markNotificationsRead(source)

        expect(source[0].read).toBeUndefined()
        expect(next[0].read).toBe(true)
    })

    test('pruneOldNotifications keeps only the last 30 days', () => {
        const now = new Date('2026-04-25T12:00:00.000Z').getTime()
        const list: NotificationListProps[] = [
            {
                id: 1,
                title: 'Fresh',
                body: 'Keep',
                data: {},
                time: '2026-04-20T12:00:00.000Z',
            },
            {
                id: 2,
                title: 'Old',
                body: 'Drop',
                data: {},
                time: '2026-03-01T12:00:00.000Z',
            },
        ]

        expect(pruneOldNotifications(list, now)).toEqual([list[0]])
    })

    test('getFirstReadIndex returns the first read position', () => {
        expect(getFirstReadIndex([
            { id: 1, title: '', body: '', data: {}, time: '', read: false },
            { id: 2, title: '', body: '', data: {}, time: '', read: true },
            { id: 3, title: '', body: '', data: {}, time: '', read: true },
        ])).toBe(1)
    })

    test('resolveNotificationTarget supports menu, ads, and events', () => {
        expect(resolveNotificationTarget({ target: 'menu', screen: 'StatusScreen' })).toEqual({
            kind: 'menu',
            screen: 'StatusScreen',
        })

        expect(resolveNotificationTarget({ id: 7, title_no: 'Ad' })).toEqual({
            kind: 'ad',
            adID: 7,
        })

        expect(resolveNotificationTarget({ id: 9, name_no: 'Event' })).toEqual({
            kind: 'event',
            eventID: 9,
        })
    })
})
