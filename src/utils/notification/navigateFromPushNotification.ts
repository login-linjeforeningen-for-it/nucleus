import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureNotificationChannel, getPushToken } from './getPushToken'
import { navigationRef } from '@utils/app/navigationRef'
import {
    parseNotificationList,
    resolveNotificationTarget,
} from './list'

type StoreNotificationProps = {
    title: string
    body: string
    data: Record<string, unknown>
}

export default function NotificationRuntime() {
    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        })

        void registerForPushNotificationsAsync()

        void Notifications.getLastNotificationResponseAsync().then((response) => {
            const data = response?.notification.request.content.data
            if (data && Object.keys(data).length) {
                navigateFromNotification(data as Record<string, unknown>)
            }
        })

        const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
            const { title, body, data } = notification.request.content
            void storeNotification({
                title: title || '',
                body: body || '',
                data: (data || {}) as Record<string, unknown>,
            })

            if (navigationRef.isReady()) {
                navigationRef.navigate('NotificationModal', {
                    title: title || '',
                    body: body || '',
                    data: (data || {}) as Record<string, unknown>,
                })
            }
        })

        const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
            const { title, body, data } = response.notification.request.content
            void storeNotification({
                title: title || '',
                body: body || '',
                data: (data || {}) as Record<string, unknown>,
            })

            if (Object.keys(data || {}).length) {
                navigateFromNotification((data || {}) as Record<string, unknown>)
                return
            }

            if (navigationRef.isReady()) {
                navigationRef.navigate('Tabs', {
                    screen: 'MenuNav',
                    params: {
                        screen: 'NotificationScreen',
                    },
                })
            }
        })

        return () => {
            foregroundSubscription.remove()
            responseSubscription.remove()
        }
    }, [])

    return null
}

async function storeNotification({ title, body, data }: StoreNotificationProps) {
    const storedString = await AsyncStorage.getItem('notificationList')
    const storedArray = parseNotificationList(storedString)

    storedArray.unshift({
        id: Date.now(),
        title,
        body,
        data,
        time: new Date().toISOString(),
    })

    await AsyncStorage.setItem('notificationList', JSON.stringify(storedArray))
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
    try {
        await configureNotificationChannel()
        return await getPushToken()
    } catch {
        return null
    }
}

function navigateFromNotification(data: Record<string, unknown>) {
    if (!navigationRef.isReady()) {
        return
    }

    const target = resolveNotificationTarget(data)

    if (target?.kind === 'menu') {
        navigationRef.navigate('Tabs', {
            screen: 'MenuNav',
            params: {
                screen: target.screen as any,
            },
        })
        return
    }

    if (target?.kind === 'ad') {
        navigationRef.navigate('Tabs', {
            screen: 'AdNav',
            params: {
                screen: 'SpecificAdScreen',
                params: { adID: target.adID },
            },
        })
        return
    }

    if (target?.kind === 'event') {
        navigationRef.navigate('Tabs', {
            screen: 'EventNav',
            params: {
                screen: 'SpecificEventScreen',
                params: { eventID: target.eventID },
            },
        })
        return
    }

    navigationRef.navigate('Tabs', {
        screen: 'MenuNav',
        params: {
            screen: 'NotificationScreen',
        },
    })
}
