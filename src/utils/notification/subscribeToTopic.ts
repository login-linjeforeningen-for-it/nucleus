import config from '@/constants'
import { getPushToken } from './getPushToken'

/**
 * Subscribes the user to a topic.
 */
export async function subscribeToTopic(topic: string) {
    try {
        const token = await getPushToken()

        const response = await fetch(`${config.app_api_url}/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, topic }),
        })

        if (!response.ok) {
            throw new Error(await response.text() || 'Subscription failed')
        }

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
        const token = await getPushToken()

        const response = await fetch(`${config.app_api_url}/unsubscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, topic }),
        })

        if (!response.ok) {
            throw new Error(await response.text() || 'Unsubscribe failed')
        }

        return { result: true, feedback: `Unsubscribed from ${topic}` }
    } catch (e: any) {
        return { result: false, feedback: `Unsubscribe from topic failed: ${e.message}` }
    }
}
