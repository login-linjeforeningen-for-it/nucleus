import EventCluster from './eventCluster'
import { getCategories } from '@utils/general'
import LastFetch, { fetchEvents } from '@utils/fetch'
import Seperator from './seperator'
import Space, { ErrorMessage } from '@components/shared/utils'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import { setEvents, setLastFetch } from '@redux/event'
import { useState, useCallback, JSX } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RefreshControl, ScrollView, View } from 'react-native'
import getListOffset from '@utils/general/getListOffset'

type ContentProps = {
    usedIndexes: number[]
}

/**
 * Displays the event list
 */
export default function EventList(): JSX.Element {
    const { events, renderedEvents, search, categories, clickedEvents } = useSelector((state: ReduxState) => state.event)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
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
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                >
                    <Content usedIndexes={usedIndexes} />
                    <Space height={getListOffset({ search, categories: cat, clickedEvents, bottom: true })} />
                </ScrollView>
                <TopRefreshIndicator refreshing={refresh} theme={theme} top={112} />
            </View>
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
