import { changeNotificationState } from '@redux/notifications'
import topic from '@/utils/topic'
import { useSelector, useDispatch } from 'react-redux'
import { View, Switch } from 'react-native'

type NotificationProps = {
    category: string
    skip?: boolean
}

/**
 * Function for displaying a notification switch
 *
 * @param {string} category Category the switch should control
 * @param {string} skip Whether to skip subscribing
 * @returns Notification switch component
 */
export default function Notification({ category, skip }: NotificationProps) {
    // Fetches states
    const notification = useSelector((state: ReduxState) => state.notification)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const dispatch = useDispatch()
    const activeThumbColor = theme.orange

    if (!skip) {
        topic({ lang, notification, dispatch })
    }

    return (
        <View>
            <Switch
                trackColor={{ false: theme.trackColor, true: theme.trackColor }}
                thumbColor={notification[category][0]
                    ? activeThumbColor
                    : theme.trackBackgroundColor
                }
                ios_backgroundColor={'black'}
                onValueChange={(value) => {
                    dispatch(changeNotificationState({ value, category }))
                }}
                value={notification[category][0]}
            />
        </View>
    )
}
