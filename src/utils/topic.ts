/**
 * This is a complex file, therefore a queue system has been implemented.
 * We allow the first request, then store the most recent request at all times
 * while the first one is working. For example if we have 10 requests, number 1
 * will execute, and 2 will be stored, then when 3 comes in, 3 will override 2,
 * which continues until we are left with request 1 and 10. When number 1 is
 * done, number 10 will run. If this keeps going, the loop will be infinite
 * until the requests stop.
 *
 * When a request comes in, it first sets up throttling so all other requests
 * are stored or dropped if they are not the last one nor unique. Then we check
 * if the request is for a language change or a notification state change. These
 * are handled differently, and therefore have different queues.
 *
 * Language changes require all currently subscribed topics to be converted to
 * the new language, except events (might be implemented in the future). The
 * topics for the previous language will be unsubscribed, as the new ones are
 * added. When everything has completed, the function will execute again if
 * there is another language request in the queue.
 *
 * Notification state requests will check all notification states, not just
 * itself, due to the nature of the state being an array, and Redux update
 * limits. This is the type where throttling is the most important, as you can
 * see how hundreds of request can quickly accumulate as one button click equals
 * about 60 requests. However with throttling, you will only get a few requests
 * per second, even when the user is subscribing in complex patterns in a fast
 * manner. After executing successfully, the function will check if there are
 * more notification state requests that have not been processed yet, and if so
 * execute the last one.
 *
 *                      +----------------------------------+
 *                      |              topic()             |
 *                      +----------------------------------+
 *                                       |
 *                      +----------------------------------+
 *                      |         Check Throttling         |
 *                      |         and Queuing Logic        |
 *                      +----------------------------------+
 *                                        |
 *                    +-------------------+-------------------+
 *                    |                                       |
 *       +------------+-------------+           +-------------+------------+
 *       |                          |           |                          |
 *       |   Process Notification   |           |      Process Language    |
 *       |      State Requests      |           |      Change Requests     |
 *       |                          |           |                          |
 *       +------------+-------------+           +-------------+------------+
 *                    |                                       |
 *                    +-------------------+-------------------+
 *                                        |
 *                           +------------+-------------+
 *                           |                          |
 *                           |     Find and proceed     |
 *                           |    with changed states   |
 *                           |                          |
 *                           +--------------------------+
 *                                        |
 *                           +------------+-------------+
 *                           |                          |
 *                           |       Topic Manager      |
 *                           |                          |
 *                           +--------------------------+
 *                                        |
 *                           +------------+-------------+
 *                           |                          |
 *                           |   Update Subscriptions   |
 *                           |   and Unsubscriptions    |
 *                           |                          |
 *                           +--------------------------+
 *                                        |
 *                           +------------+-------------+
 *                           |                          |
 *                           |    Redux State Updates   |
 *                           |                          |
 *                           +--------------------------+
 *                                        |
 *                           +------------+-------------+
 *                           |                          |
 *                           |     Execute Pending      |
 *                           |     Request if Queued    |
 *                           |                          |
 *                           +--------------------------+
 *                                        |
 *                           +------------+-------------+
 *                           |                          |
 *                           |    Check Throttling      |
 *                           |    and Queuing Logic     |
 *                           |                          |
 *                           +--------------------------+
 *                                        |
 *                           +------------+-------------+
 *                           |                          |
 *                           |    Process Notification  |
 *                           |     Change Requests in   |
 *                           |       Queue (repeat)     |
 *                           |                          |
 *                           +--------------------------+
 *                                        |
 *                           +------------+-------------+
 *                           |                          |
 *                           |     Lift Throttling      |
 *                           |     When Empty Queue     |
 *                           |                          |
 *                           +--------------------------+
 */

import { Dispatch, UnknownAction } from 'redux'
import TopicManager from './notification/topicManager'
import { setNotificationDidUpdateOnFirebase } from '@redux/notifications'

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
                        dispatch(setNotificationDidUpdateOnFirebase({ category: keys[i] }))
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
