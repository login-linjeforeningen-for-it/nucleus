import { useSelector } from 'react-redux'
import EventCluster from './eventCluster'
import Expired from './expired'
import AdCluster from '@components/ads/adCluster'

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

    return <Expired id={id} type={type} />
}
