type notificationArrayProps = {
    notification: NotificationProps
    category: string
}

/**
 * Iterates through the notification arrays looking for a specific entity and
 * returns the corresponding array. Used to find what notification topics the
 * user is subscribed to.
 * @param notification Notification topic in question
 * @param category Category of the topic in question
 * @returns The values of each element in the corresponding notification array
 */
export default function notificationArray({ notification, category }: notificationArrayProps): boolean[] {
    const committees = ['TEKKOM', 'SOCIAL', 'CTF', 'KARRIEREDAG', 'FADDERUKA', 'BEDPRES', 'LOGIN', 'ANNET']
    const intervals = ['10m', '30m', '1h', '2h', '3h', '6h', '1d', '2d', '1w']
    const index = committees.indexOf(category)
    const array = []

    for (let i = 0; i < intervals.length; i++) {
        const id = committees[index] + intervals[i]
        array.push(Boolean(notification[id]))
    }

    return array
}
