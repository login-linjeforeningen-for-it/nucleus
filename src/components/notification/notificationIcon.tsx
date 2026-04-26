import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

type NotificationIconProps = {
    position: 'bottom' | 'left'
}

// Displays the notification icon if there are unread notifications
export default function NotificationIcon({ position }: NotificationIconProps) {
    const [display, setDisplay] = useState<boolean>(false)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)

    // Fetches notifications from localstorage
    async function getNotifications() {
        const unread = await unreadNotifications()

        if (unread) {
            setDisplay(true)
        } else {
            setDisplay(false)
        }
    }

    useEffect(() => {
        let interval: Interval = 0

        interval = setInterval(() => {
            getNotifications()
            // Runs every 5 seconds
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    if (!display) return <></>

    return <View style={{
        backgroundColor: theme.orange,
        height: 6,
        width: 6,
        position: 'absolute',
        borderRadius: 100,
        right: position === 'bottom' ? 30 : undefined,
        left: position === 'left' ? lang ? 88 : 108 : undefined,
        top: position === 'bottom' ? 21 : 2,
        zIndex: 10
    }} />
}

// Checks for unread notifications
async function unreadNotifications(): Promise<boolean> {
    const notifications = await AsyncStorage.getItem('notificationList')

    if (notifications) {
        const parsed = JSON.parse(notifications)

        for (let i = 0; i < parsed.length; i++) {
            if (!('read' in parsed[i]) || parsed[i].read == false) {
                return true
            }
        }
    }

    return false
}
