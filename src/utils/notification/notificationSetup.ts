import { setNotificationStateTrue } from "@redux/notifications"
import { subscribeToTopic } from "@utils/notification/subscribeToTopic"
import { Dispatch, UnknownAction } from "redux"
import { resetTheme } from "@redux/theme"
import { Alert, Platform } from "react-native"
import { requestPermissionsAsync, getPermissionsAsync } from 'expo-notifications'
import { isDevice } from 'expo-device'
import { configureNotificationChannel } from './getPushToken'

type initializeNotificationsProps = {
    shouldRun: boolean
    hasBeenSet: boolean[]
    setShouldSetupNotifications: React.Dispatch<React.SetStateAction<boolean>>
    dispatch: Dispatch<UnknownAction>
}

/**
 * Sets up initial notifications
 * 
 * @param shouldRun Specifies if notifications should be initialised, starts as 
 * true and is set to false when the setup is completed 
 * 
 * @param hasBeenSet Specifies if the notifications have already been 
 * initialized, in which case it will not run. Used between rerenders before 
 * hasBeenSet has updated
 * 
 * @param setShouldSetupNotifications Setter function for the shouldRun variable
 */
export default function initializeNotifications({ shouldRun, hasBeenSet,
    setShouldSetupNotifications, dispatch }: initializeNotificationsProps) {
    if (shouldRun && !hasBeenSet[1]) {
        dispatch(resetTheme())
        notificationSetup(dispatch)
        setShouldSetupNotifications(false)
    }
}

/**
 * Runs when the app is first opened to setup initial notifications
 */
export async function notificationSetup(dispatch: Dispatch<UnknownAction>) {
    const granted = await requestNotificationPermission()
    if (granted) {
        await configureNotificationChannel()
        const topics = ["IMPORTANT", "BEDPRES", "TEKKOM", "CTF", "SOCIAL", "KARRIEREDAG", "FADDERUKA", "LOGIN", "ANNET"]

        for (const topic of topics) {
            await subscribeToTopic(`n${topic}`)
        }
    }

    dispatch(setNotificationStateTrue({ category: "SETUP" }))
}

export async function requestNotificationPermission() {
    try {
        if (!isDevice) {
            console.log('Skipping notification permission request: running on emulator')
            return false
        }

        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const { status: existingStatus } = await getPermissionsAsync()
            let finalStatus = existingStatus

            if (existingStatus !== 'granted') {
                const { status } = await requestPermissionsAsync()
                finalStatus = status
            }

            if (finalStatus !== 'granted') {
                Alert.alert(
                    'Notification Permission Denied',
                    'Please enable notifications in Settings to receive updates.',
                    [{ text: 'OK' }]
                )

                return false
            }

            return true
        } else {
            // iOS or older Android versions
            const { status } = await requestPermissionsAsync()

            if (status !== 'granted') {
                Alert.alert(
                    'Notification Permission Denied',
                    'Please enable notifications in Settings to receive updates.',
                    [{ text: 'OK' }]
                )

                return false
            }

            return true
        }
    } catch (error) {
        console.error('Notification permission error:', error)
        Alert.alert(
            'Error',
            'An error occurred while requesting notification permission. Please try again later.',
            [{ text: 'OK' }]
        )

        return false
    }
}
