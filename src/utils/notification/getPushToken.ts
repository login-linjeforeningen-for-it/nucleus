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
