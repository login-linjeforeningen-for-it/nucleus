import { Dispatch, UnknownAction } from 'redux'
import TopicManager from '../topicManager'
import { setNotificationDidUpdateRemotely } from '@redux/notifications'

type topicParams = {
    topicID?: string
    lang: boolean | undefined
    notification?: NotificationProps
    dispatch?: Dispatch<UnknownAction>
}

// Global throttling variable to keep track of all function calls
const throttled = [false, false]
let langChangeQueue: topicParams | null
let notificationStateQueue: topicParams | null

/**
 * Topic updates are throttled by request type. The first request runs
 * immediately; while it is running, only the latest pending request is kept so
 * rapid switch toggles collapse into one final sync.
 */
/**
 * **Function for subscribing and unsubscribing from notification topics**
 *
 * When changing language it will setup notifications to follow language.
 *
 * @param topicID Topic identifier - "langChange" passed when changing language
 * @param lang Language, 1 for norwegian, 0 for english
 * @param status  true/false Subscribe or unsubscribe from given topic.
 */
export default async function topic({ topicID, lang, notification, dispatch }:
topicParams) {
    const isLangChange = topicID === 'langChange'
    // Drops excessive language changes
    if (isLangChange && throttled[0]) {
        langChangeQueue = { topicID, lang, notification, dispatch }
        return
    }

    // Drops excessive notification state changes
    if (throttled[1]) {
        notificationStateQueue = { topicID, lang, notification, dispatch }
        return
    }

    // Enables throttling for called topic type
    if (isLangChange) {
        throttled[0] = true
    } else {
        throttled[1] = true
    }

    // Empties queue at the start as any duplicate requests at this stage will
    // already be accounted for and handled by the current execution.
    if (isLangChange) {
        langChangeQueue = null
    } else {
        notificationStateQueue = null
    }

    // Handles language change by shifting all subscribed topics to new language
    // and unsubscribing them from the old language
    if (isLangChange && notification) {
        const keys = Object.keys(notification)
        const values = Object.values(notification)
        const sub = lang ? 'e' : 'n'
        const unsub = lang ? 'n' : 'e'
        for (let i = 0; i < keys.length; i++) {
            if (values[i][0]) {
                await TopicManager({ topic: `${unsub}${keys[i]}`, unsub: true })
                await TopicManager({ topic: `${sub}${keys[i]}` })
            }
        }
    }

    if (notification && !isLangChange && dispatch) {
        const keys = Object.keys(notification)
        const values = Object.values(notification)
        const prefix = lang ? 'n' : 'e'

        for (let i = 0; i < keys.length; i++) {
            if (values[i][1]) {
                const topic = `${prefix}${keys[i]}`

                try {
                    const response = await TopicManager({ topic, unsub: !values[i][0] })

                    // Check if the result is successful
                    if (response.result) {
                        // Updates Redux if the topic was updated successfully
                        dispatch(setNotificationDidUpdateRemotely({ category: keys[i] }))
                    }
                } catch (error) {
                    console.error('Error processing topic:', error)
                }
            }
        }
    }

    // Stops throtteling the finished type
    if (topicID === 'langChange') {
        throttled[0] = false
    } else {
        throttled[1] = false
    }

    if (isLangChange) {
        if (langChangeQueue) {
            await executeLastRequest(langChangeQueue)
        }
    } else {
        if (notificationStateQueue) {
            await executeLastRequest(notificationStateQueue)
        }
    }
}

// Executes the last request to make sure all changes are accounted for
async function executeLastRequest(request: topicParams) {
    if (request) {
        await topic(request)
    }
}
