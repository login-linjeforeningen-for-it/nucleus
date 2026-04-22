import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureNotificationChannel, getPushToken } from './getPushToken'
import { navigationRef } from '@utils/navigationRef'

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
                    data,
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
    const storedArray = storedString ? JSON.parse(storedString) as NotificationListProps[] : []

    storedArray.unshift({
        id: Date.now(),
        title,
        body,
        data: data as Record<string, unknown> as NotificationListProps['data'],
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

    const id = Number(data.id)
    const target = typeof data.target === 'string' ? data.target : null
    const screen = typeof data.screen === 'string' ? data.screen : null
    const isAd = typeof data.title_no === 'string' || typeof data.title_en === 'string'
    const isEvent = typeof data.name_no === 'string' || typeof data.name_en === 'string'

    if (target === 'menu' && screen) {
        navigationRef.navigate('Tabs', {
            screen: 'MenuNav',
            params: {
                screen: screen as any,
            },
        })
        return
    }

    if (target === 'ad' && Number.isFinite(id)) {
        navigationRef.navigate('Tabs', {
            screen: 'AdNav',
            params: {
                screen: 'SpecificAdScreen',
                params: { adID: id },
            },
        })
        return
    }

    if (target === 'event' && Number.isFinite(id)) {
        navigationRef.navigate('Tabs', {
            screen: 'EventNav',
            params: {
                screen: 'SpecificEventScreen',
                params: { eventID: id },
            },
        })
        return
    }

    if (Number.isFinite(id) && isAd) {
        navigationRef.navigate('Tabs', {
            screen: 'AdNav',
            params: {
                screen: 'SpecificAdScreen',
                params: { adID: id },
            },
        })
        return
    }

    if (Number.isFinite(id) && isEvent) {
        navigationRef.navigate('Tabs', {
            screen: 'EventNav',
            params: {
                screen: 'SpecificEventScreen',
                params: { eventID: id },
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
