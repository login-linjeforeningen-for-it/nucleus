import Cluster from '@components/shared/cluster'
import { useNavigation } from '@react-navigation/native'
import { toggleSearch } from '@redux/event'
import { LinearGradient } from 'expo-linear-gradient'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import EventClusterTitle from './EventClusterTitle'
import Bell from './bell'
import ES from '@styles/eventStyles'
import CategorySquare from '@components/shared/category'
import Space from '@components/shared/utils'
import T from '@styles/text'
import { StackNavigationProp } from '@react-navigation/stack'
import { JSX } from 'react'

type EventClusterProps = {
    item: GetEventProps
    index: number
    embed?: boolean
}

type FullCategorySquareProps = {
    item: GetEventProps
    height?: number
}

/**
 * Displays one element of the event card array
 */
export default function EventCluster({ item, index }: EventClusterProps): JSX.Element {
    const { search } = useSelector((state: ReduxState) => state.event)
    const navigation = useNavigation<StackNavigationProp<EventStackParamList>>()
    const dispatch = useDispatch()

    return (
        <View style={item.highlight && { marginTop: 2, top: -2 }}>
            <TouchableOpacity onPress={() => {
                if (search) {
                    dispatch(toggleSearch())
                }
                navigation.push('SpecificEventScreen', { eventID: item.id })
            }}>
                <LinearGradient
                    start={[0, 0.5]}
                    end={[1, 0.5]}
                    // The non highlited items get wraped in an transparrent container
                    colors={item.highlight ? ['#FF512F', '#F09819', '#FF512F'] : ['#000000cc', '#000000cc']}
                    style={{ borderRadius: 5, marginVertical: item.highlight ? 2 : 0 }}
                >
                    <Cluster marginHorizontal={2} marginVertical={4} highlight={item.highlight}>
                        <View style={ES.eventBack}>
                            <FullCategorySquare item={item} />
                            <EventClusterTitle item={item} />
                            <Bell item={item} />
                        </View>
                    </Cluster>
                </LinearGradient>
            </TouchableOpacity>
            <ListFooter index={index} />
        </View>
    )
}

/**
 * Displays the footer last fetch time item
 */
function ListFooter({ index }: ListFooterProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { lastFetch, renderedEvents } = useSelector((state: ReduxState) => state.event)

    return (
        <>
            {index === renderedEvents.length - 1 && <Text style={{
                ...T.contact,
                color: theme.oppositeTextColor
            }}>
                {`${lang ? 'Oppdatert kl:' : 'Updated:'} ${lastFetch}.`}
            </Text>}
            {index === renderedEvents.length - 1 &&
                <Space height={Dimensions.get('window').height / 7} />}
        </>
    )
}

/**
 * Displays the category square to the left of each event in the list on the EventScreen
 */
function FullCategorySquare({ item, height }: FullCategorySquareProps): JSX.Element {
    const startDate = item?.time_start ? new Date(item.time_start) : new Date()
    const endDate = item?.time_type == 'default' ? new Date(item.time_end) : undefined

    return (
        <View style={{ flexDirection: 'row' }}>
            <CategorySquare
                color={item.category.color}
                height={height}
                startDate={startDate}
                endDate={endDate}
            />
        </View>
    )
}
