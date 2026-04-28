import AsyncStorage from '@react-native-async-storage/async-storage'
import { JSX, useEffect, useState } from 'react'
import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSelector } from 'react-redux'
import { parseNotificationList } from '@utils/notification/list'

export function CrownMenuIcon({ color }: { color: string }): JSX.Element {
    return (
        <Svg style={{ left: 5 }} width={80} height={65} viewBox='0 0 80 65'>
            <Path
                d='M32.5 36h15l1.8-10.5-5.2 5-4.1-7.5-4.1 7.5-5.2-5L32.5 36Z'
                fill='none'
                stroke={color}
                strokeWidth={1.9}
                strokeLinejoin='round'
                strokeLinecap='round'
            />
            <Path
                d='M33.5 40.5h13'
                fill='none'
                stroke={color}
                strokeWidth={1.9}
                strokeLinecap='round'
            />
        </Svg>
    )
}

export function NotificationIcon({ position }: { position: 'bottom' | 'left' }) {
    const [display, setDisplay] = useState<boolean>(false)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)

    async function getNotifications() {
        const unread = await unreadNotifications()
        setDisplay(unread)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getNotifications()
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
        zIndex: 10,
    }} />
}

async function unreadNotifications(): Promise<boolean> {
    const notifications = await AsyncStorage.getItem('notificationList')
    const parsed = parseNotificationList(notifications)

    return parsed.some(notification => notification.read === false)
}
