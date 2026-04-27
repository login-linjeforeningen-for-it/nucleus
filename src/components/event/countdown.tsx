import Card from '@components/shared/card'
import CategorySquare from '@components/shared/category'
import ES from '@styles/eventStyles'
import { View } from 'react-native'
import EventTime from './time'
import Skeleton from '@components/shared/skeleton'
import { useContext } from 'react'
import { EventContext } from '@utils/app/contextProvider'

export default function Countdown() {
    const event = useContext(EventContext)
    const startDate = event ? new Date(event.time_start) : new Date()
    const endDate = event && event.time_type=='default' ? new Date(event.time_end) : undefined
    const loading = !event || !Object.keys(event).length

    return (
        <Card>
            <Skeleton height={70} loading={loading}>
                <View style={ES.specificEventInfoView}>
                    <View style={{marginRight: 10}}>
                        <CategorySquare color={event?.category?.color} startDate={startDate} endDate={endDate}/>
                    </View>
                    <EventTime time_start={event?.time_start} time_end={event?.time_end} />
                </View>
            </Skeleton>
        </Card>
    )
}
