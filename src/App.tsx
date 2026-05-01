import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { AppRegistry, LogBox } from 'react-native'
import { Provider } from 'react-redux'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Navigator from '@nav/tabs'
import store from '@redux/store'
import ForceUpdate from '@components/menu/forceUpdate'
import { requestNotificationPermission } from '@utils/notification/notificationSetup'
import { useEffect } from 'react'
import { hydrateAuthFromInitialUrl, registerAuthListener } from '@utils/auth/auth'

const persistor = persistStore(store)

LogBox.ignoreLogs([
    'InteractionManager has been deprecated and will be removed in a future release.',
])

/**
 * **Function for running the entire Login app**
 *
 * Handles notifications while app is in background state
 *
 * Provider allows the store to be used by any screen with navigation.
 *
 * Persistgate is used for syncing Redux states with AsyncStorage
 *
 * Navigator contains all screens and functionality to navigate between them
 *
 * @returns Entire application
 */
export default function App() {
    AppRegistry.registerComponent('app', () => App)

    useEffect(() => {
        requestNotificationPermission()
        hydrateAuthFromInitialUrl()
        const subscription = registerAuthListener()

        return () => {
            subscription.remove()
        }
    }, [])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <ForceUpdate />
                    <Navigator />
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    )
}
