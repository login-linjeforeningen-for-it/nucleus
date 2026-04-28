import { View, Alert, Linking, Platform } from 'react-native'
import { nativeApplicationVersion } from 'expo-application'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import config from '@/constants'

export default function ForceUpdate() {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [updateRequired, setUpdateRequired] = useState(false)
    const apiUrl = `${config.app_api}/version?version=${nativeApplicationVersion}&lang=${lang}`
    const appUrls = {
        ios: config.app_store,
        android: config.play_store,
    }

    function openStore() {
        const url = Platform.OS === 'ios' ? appUrls.ios : appUrls.android
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open the store')
        })
    }

    async function checkVersion() {
        if (__DEV__) {
            return
        }

        try {
            const response = await fetch(apiUrl)
            if (!response.ok) {
                console.log('Failed to fetch version endpoint.')
                return
            }

            const data = await response.json()
            if (!data?.update) {
                return
            }

            const { updateRequired, update, buttons } = data
            setUpdateRequired(!!updateRequired)

            const alertButtons = buttons.map((btn: { text: string; action: string }) => {
                if (btn.action === 'update') {
                    return { text: btn.text, onPress: openStore }
                }

                return { text: btn.text, style: 'cancel' }
            })

            Alert.alert(
                update.title,
                update.body,
                alertButtons,
                { cancelable: !updateRequired }
            )
        } catch (err) {
            console.log('Version check failed:', err)
        }
    }

    useEffect(() => {
        checkVersion()
    }, [lang])

    if (!updateRequired) {
        return null
    }

    return (
        <View
            style={{
                backgroundColor: theme?.dark || 'black',
                opacity: 0.8,
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 9999,
            }}
        />
    )
}
