import Cluster from '@components/shared/cluster'
import { Text, View } from 'react-native'
import ES from '@styles/eventStyles'
import { TextLink } from '@components/shared/link'
import { useSelector } from 'react-redux'
import CategorySquare from '@components/shared/category'
import BellIcon from '@components/shared/bellIcon'
import config from '@/constants'

type ExpiredProps = {
    id: number | null
    type: 'event' | 'ad'
}

/**
 * Displays a generic event if the event has expired or is otherwise unavailable
 * when being referred to from another event.
 *
 * Note: Coded in a modular way for easy support of canceled ads in the future.
 *
 * @param id Id of the event that has expired or is unavailable
 * @param type event | ad
 * @returns Placeholder event or null
 */
export default function Expired({ id, type }: ExpiredProps) {
    if (id && type === 'event') return <ExpiredEvent id={id} />
    return null
}

/**
 * Displays a generic event if the event has expired or is otherwise unavailable
 * when being referred to from another event.
 * @param id Id of the event that has expired
 * @returns Generic event
 */
export function ExpiredEvent(id: { id: number }) {
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
                                url={`${config.login_url}/events/${id}`}
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
