import Space from '@/components/shared/utils'
import { useCallback, useState, useEffect, JSX } from 'react'
import { useSelector } from 'react-redux'
import ES from '@styles/eventStyles'
import { Dimensions, Platform, View, Text } from 'react-native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import Swipe from '@components/nav/swipe'
import Cluster from '@components/shared/cluster'
import T from '@styles/text'
import SpecificEventSections from '@components/event/specificEventSections'
import { useDispatch } from 'react-redux'
import { fetchEventDetails } from '@utils/fetch'
import { EventContext } from '@utils/contextProvider'
import { setEventName } from '@redux/event'

/**
 * @param eventID - The ID of the event to be displayed
 *
 * @returns
 */
export default function SpecificEventScreen({
    route: { params: { eventID } },
}: EventScreenProps<'SpecificEventScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [refresh, setRefresh] = useState(false)
    const dispatch = useDispatch()
    const height = Dimensions.get('window').height
    const [event, setEvent] = useState({} as GetEventProps)
    const [error, setError] = useState('')

    /**
     * Sets the title of the screen in the header
     */
    useEffect(() => {
        if (event) {
            const eventName = lang ? event.name_no || event.name_en
                : event.name_en || event.name_no
            dispatch(setEventName(eventName))
        }
    }, [event])

    useEffect(() => {
        getDetails()
    }, [eventID])

    async function getDetails() {
        const response = await fetchEventDetails(eventID)
        if (response) {
            setEvent(response)
            setError('')
            return true
        } else {
            setError('Failed to load event')
            return false
        }
    }

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        const details = await getDetails()

        if (details) {
            setRefresh(false)
        }
    }, [refresh])

    return (
        <EventContext.Provider value={event}>
            <Swipe left='EventScreen'>
                <View style={{ ...ES.sesContent, backgroundColor: theme.background }}>
                    <Space height={Platform.OS == 'ios'
                        ? Dimensions.get('window').height / 8.5
                        : Dimensions.get('window').height / 7.5 + (height > 800 && height < 900 ? 15 : 0)
                    } />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={100}
                        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}
                    >
                        <Space height={10} />
                        {error ? (
                            <Cluster marginHorizontal={12}>
                                <View style={{ padding: 14 }}>
                                    <Text style={{ ...T.text15, color: '#ff8b8b' }}>{error}</Text>
                                </View>
                            </Cluster>
                        ) : null}
                        {event?.id ? <SpecificEventSections event={event} /> : null}
                        <Space height={Dimensions.get('window').height / (Platform.OS === 'ios' ? 3 : 2.75)} />
                    </ScrollView>
                </View>
            </Swipe>
        </EventContext.Provider>
    )
}
