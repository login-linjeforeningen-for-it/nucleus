import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import NotificationReducer from '@redux/notifications'
import { persistReducer, createMigrate } from 'redux-persist'
import LoginReducer from '@redux/loginStatus'
import ProfileReducer from '@redux/profile'
import ThemeReducer from '@redux/theme'
import EventReducer from '@redux/event'
import LangReducer from '@redux/lang'
import MiscReducer from '@redux/misc'
import AdReducer from '@redux/ad'
import { thunk } from 'redux-thunk'

// Combines all reducers
const reducers = combineReducers({
    // Theme reducer
    theme: ThemeReducer,
    // Language reducer
    lang: LangReducer,
    // Loginstatus reducer
    login: LoginReducer,
    // Notification reducer
    notification: NotificationReducer,
    // Miscellaneous, only used for calendarID at this time
    misc: MiscReducer,
    // Profile reducer, handles all user specific information
    profile: ProfileReducer,
    // Event reducer, handles all event logic
    event: EventReducer,
    // Ad reducer, handles all ad logic
    ad: AdReducer
})

// Types does not work in this version of the library


// It is hard to test this, I had to make an apk and then change the version number and update the app to test it
const migrations = {
    0: () => {
        return {}
    }
}

// Function to localstore redux state
const saveState = {
    version: 0,
    // Key property: root
    key: 'root',
    // Declares which storage to use, AsyncStorage has most active community
    storage: AsyncStorage,
    // Whitelists the names of the states to save
    whitelist: [
        'ad',
        'event',
        'lang',
        'login',
        'misc',
        'notification',
        'profile',
        'theme'
    ],
    migrate: createMigrate(migrations as any)
}

// Persistor to remember the state
const persistedReducer = persistReducer(saveState, reducers)

// Function to configure the store
const Store = configureStore({
    // The combinded reducer
    reducer: persistedReducer,
    // Middleware to interact with AsyncStorage (must be of any type due to underlying API type error)
    middleware: () => [thunk] as any
})

// Exporting the full Redux Store
export default Store
