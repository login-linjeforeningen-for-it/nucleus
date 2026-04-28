import config from '@/constants'
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export async function configureNotificationChannel() {
    if (Platform.OS !== 'android') {
        return
    }

    await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#fd8738',
    })
}

export async function getPushToken() {
    const projectId
        = Constants.expoConfig?.extra?.eas?.projectId
        || Constants.easConfig?.projectId

    if (!projectId) {
        throw new Error('Missing Expo project id for push notifications')
    }

    const response = await Notifications.getExpoPushTokenAsync({ projectId })
    return response.data
}

/**
 * Subscribes the user to a topic.
 */
export async function subscribeToTopic(topic: string) {
    try {
        await postTopicSubscription('/subscribe', topic, 'Subscription failed')
        return { result: true, feedback: `Subscribed to ${topic}` }
    } catch (e: any) {
        return { result: false, feedback: `Subscription to topic failed: ${e.message}` }
    }
}

/**
 * Unsubscribes the user from a topic.
 */
export async function unsubscribeFromTopic(topic: string) {
    try {
        await postTopicSubscription('/unsubscribe', topic, 'Unsubscribe failed')
        return { result: true, feedback: `Unsubscribed from ${topic}` }
    } catch (e: any) {
        return { result: false, feedback: `Unsubscribe from topic failed: ${e.message}` }
    }
}

async function postTopicSubscription(path: '/subscribe' | '/unsubscribe', topic: string, fallback: string) {
    const token = await getPushToken()
    const response = await fetch(`${config.app_api}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, topic }),
    })

    if (!response.ok) {
        throw new Error(await response.text() || fallback)
    }
}
