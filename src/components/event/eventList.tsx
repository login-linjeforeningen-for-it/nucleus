import EventCluster from './eventCluster'
import getCategories from '@utils/getCategories'
import getListOffset from '@utils/getListOffset'
import LastFetch, { fetchEvents } from '@utils/fetch'
import Seperator from './seperator'
import Space, { ErrorMessage } from '@components/shared/utils'
import { setEvents, setLastFetch } from '@redux/event'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { useState, useCallback, JSX } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { View } from 'react-native'

type ContentProps = {
    usedIndexes: number[]
}

/**
 * Displays the event list
 */
export default function EventList(): JSX.Element {
    const { events, renderedEvents, search, categories, clickedEvents } = useSelector((state: ReduxState) => state.event)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [refresh, setRefresh] = useState(false)
    const dispatch = useDispatch()

    async function getDetails() {
        const events = await fetchEvents()
        if (events.length) {
            dispatch(setEvents(events))
            dispatch(setLastFetch(LastFetch()))
            return true
        }
    }

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        const details = await getDetails()
        if (details) {
            setRefresh(false)
        }
    }, [refresh])

    const cat = getCategories({ lang, categories })

    if (renderedEvents.length > 0) {
        const usedIndexes: number[] = []

        return (
            <>
                <ScrollView
                    style={{ paddingTop: getListOffset({ search, categories: cat, clickedEvents }) }}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={100}
                >
                    <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                    <Content usedIndexes={usedIndexes} />
                    <Space height={getListOffset({ search, categories: cat, clickedEvents, bottom: true })} />
                </ScrollView>
            </>
        )
    }

    return <ErrorMessage argument={!events ? 'wifi' : 'nomatch'} screen='event' />
}

function Content({ usedIndexes }: ContentProps) {
    const { renderedEvents } = useSelector((state: ReduxState) => state.event)

    return renderedEvents.map((event, index) => (
        <View key={`View${index}`}>
            <Seperator key={`Seperator${index}`} item={event} usedIndexes={usedIndexes} />
            <EventCluster key={index} item={event} index={index} />
        </View>
    ))
}
