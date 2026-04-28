import { useSelector } from 'react-redux'
import EventCluster from './eventCluster'
import AdCluster from '@components/ads/adCluster'
import Cluster from '@components/shared/cluster'
import { Text, View } from 'react-native'
import ES from '@styles/eventStyles'
import { TextLink } from '@components/shared/link'
import CategorySquare from '@components/shared/category'
import BellIcon from '@components/shared/bellIcon'
import config from '@/constants'

type EmbedProps = {
    id: number | null
    type: 'event' | 'ad'
}

export default function Embed({ id, type }: EmbedProps) {
    const { events } = useSelector((state: ReduxState) => state.event)
    const { ads } = useSelector((state: ReduxState) => state.ad)

    if (type === 'event') {
        for (let i = 0; i < events.length; i++) {
            if (events[i].id === id) {
                return <EventCluster item={events[i]} index={id} />
            }
        }
    } else if (id) {
        for (let i = 0; i < ads.length; i++) {
            if (ads[i].id === id) {
                return <AdCluster index={id} ad={ads[i]} embed={true} />
            }
        }
    }

    if (id && type === 'event') return <ExpiredEvent id={id} />
    return null
}

function ExpiredEvent(id: { id: number }) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const content = lang ? 'Utilgjengelig' : 'This event has expired'
    const retry = lang ? 'Klikk her for å prøve likevel' : 'Click here to try anyways'

    return (
        <View>
            <Cluster marginVertical={8}>
                <View style={ES.eventBack}>
                    <View>
                        <CategorySquare color='#333' startDate={id.id} />
                    </View>
                    <View style={ES.view2}>
                        <Text style={{ ...ES.title, color: theme.textColor }}>
                            {content}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            <TextLink
                                style={{ color: theme.orange }}
                                text={retry}
                                url={`${config.login}/events/${id}`}
                            />
                        </View>
                    </View>
                    <View style={ES.view3}>
                        <BellIcon canceled={true} />
                    </View>
                </View>
            </Cluster>
        </View>
    )
}
