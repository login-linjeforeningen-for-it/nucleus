import NS from '../../styles/notificationStyles'
import { View, Text } from 'react-native'
import { useSelector } from 'react-redux'

type NotificationTextProps = {
    title: string
    body: string
}

/**
 * Visual representation of the location on the Notification Cluster
 *
 * @returns JSX Element containing the text displayed for each notification
 */
export default function NotificationText({ title, body }: NotificationTextProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View>
            <View>
                <Text style={{ ...NS.title, color: theme.textColor }}>
                    {title}
                </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ ...NS.loc, color: theme.oppositeTextColor }}>
                    {body}
                </Text>
            </View>
        </View>
    )
}
