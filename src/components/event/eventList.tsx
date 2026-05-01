import EventCluster from './eventCluster'
import { getCategories } from '@utils/general'
import LastFetch, { fetchEventsResult } from '@utils/fetch'
import Separator from './separator'
import Space, { ErrorMessage } from '@components/shared/utils'
import { setEventFetchError, setEvents, setLastFetch } from '@redux/event'
import { useState, useCallback, JSX } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RefreshControl, ScrollView, View } from 'react-native'
import getListOffset from '@utils/general/getListOffset'
import config from '@/constants'

type ContentProps = {
    usedIndexes: number[]
}

/**
 * Displays the event list
 */
export default function EventList(): JSX.Element {
    const { fetchError, renderedEvents, search, categories, clickedEvents } = useSelector((state: ReduxState) => state.event)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [refresh, setRefresh] = useState(false)
    const dispatch = useDispatch()

    async function getDetails() {
        const { events, ok } = await fetchEventsResult()
        dispatch(setEventFetchError(!ok))
        if (ok) {
            dispatch(setEvents(events))
            dispatch(setLastFetch(LastFetch()))
            return true
        }
    }

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        try {
            await getDetails()
        } finally {
            setRefresh(false)
        }
    }, [])

    const cat = getCategories({ lang, categories })

    if (renderedEvents.length > 0) {
        const usedIndexes: number[] = []

        return (
            <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingTop: getListOffset({ search, categories: cat, clickedEvents }) }}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={100}
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={onRefresh}
                            tintColor={theme.refresh}
                            progressViewOffset={config.progressViewOffset}
                        />
                    }
                >
                    <Content usedIndexes={usedIndexes} />
                    <Space height={getListOffset({ search, categories: cat, clickedEvents, bottom: true })} />
                </ScrollView>
            </View>
        )
    }

    return <ErrorMessage argument={fetchError ? 'wifi' : 'nomatch'} screen='event' />
}

function Content({ usedIndexes }: ContentProps) {
    const { renderedEvents } = useSelector((state: ReduxState) => state.event)

    return renderedEvents.map((event, index) => (
        <View key={`View${index}`}>
            <Separator key={`Separator${index}`} item={event} usedIndexes={usedIndexes} />
            <EventCluster key={index} item={event} index={index} />
        </View>
    ))
}
