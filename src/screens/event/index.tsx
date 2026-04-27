import React, { JSX, useEffect, useState } from 'react'
import EventList from '@components/event/eventList'
import GS from '@styles/globalStyles'
import initializeNotifications
    from '@utils/notification/notificationSetup'
import LastFetch, { fetchEvents } from '@/utils/fetch'
import LogoNavigation from '@/components/shared/logoNavigation'
import Swipe from '@components/nav/swipe'
import DownloadButton from '@components/shared/downloadButton'
import { useFocusEffect } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { StatusBar } from 'expo-status-bar'
import { setEvents, setLastFetch, setLastSave } from '@redux/event'
import { View } from 'react-native'
import { FilterButton, FilterUI } from '@components/shared/filter'

/**
 * Parent EventScreen component
 *
 * Handles:
 * - Displaying events
 * - Filtering events
 * - Notification Management
 * - Event notifications, both scheduling and cancelling
 *
 * @param {navigation} Navigation Navigation route
 * @returns EventScreen
 */
export default function EventScreen({ navigation }: EventScreenProps<'EventScreen'>): JSX.Element {
    // Notification state
    const [shouldSetupNotifications, setShouldSetupNotifications] = useState(true)

    // Redux states
    const notification = useSelector((state: ReduxState) => state.notification)
    const { lastSave } = useSelector((state: ReduxState) => state.event)
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const dispatch = useDispatch()

    // Fetches events when screen is focused
    useFocusEffect(
        // Callback to avoid too many rerenders
        React.useCallback(() => {
            // IIFE to fetch clicked events
            (async () => {
                const events = await fetchEvents()

                if (events.length) {
                    dispatch(setEvents(events))
                    dispatch(setLastFetch(LastFetch()))
                }
            })()
        }, [])
    )

    // Loads initial data
    useEffect(() => {
        // IIFE to fetch API
        (async () => {
            const events = await fetchEvents()

            if (events.length) {
                dispatch(setEvents(events))
                dispatch(setLastFetch(LastFetch()))
            }
        })()

        // Renders when the screen is loaded
    }, [])

    useEffect(() => {
        // Displays when the API was last fetched successfully
        if (lastSave === '') {
            (async () => { dispatch(setLastSave(LastFetch())) })()
        }
    }, [lastSave])

    // Sets the component of the header
    useEffect(() => {
        navigation.setOptions({
            headerComponents: {
                bottom: [<FilterUI />],
                left: [<LogoNavigation />],
                right: [<FilterButton />, <DownloadButton screen='event' />]
            }
        } as any)
    }, [navigation])

    initializeNotifications({
        shouldRun: shouldSetupNotifications,
        hasBeenSet: notification['SETUP'],
        setShouldSetupNotifications,
        dispatch
    })

    // Displays the EventScreen
    return (
        <Swipe right='AdNav'>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <View
                style={{
                    ...GS.content,
                    paddingHorizontal: 5,
                    backgroundColor: theme.darker
                }}
                testID='eventScreen'
            >
                <EventList />
            </View>
        </Swipe>
    )
}
