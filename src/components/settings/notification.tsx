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
 * @param {string} topicID Topic the user interacted with
 * @returns Notification switch component
 */
export default function Notification({ category, skip }: NotificationProps) {
    // Fetches states
    const notification = useSelector((state: ReduxState) => state.notification)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const dispatch = useDispatch()
    const inactiveThumbColor = isDark ? '#2F241C' : '#47352A'
    const inactiveTrackColor = isDark ? theme.trackBackgroundColor : '#1A1A1A'
    const activeThumbColor = theme.orange
    const activeTrackColor = isDark ? 'rgba(253, 135, 56, 0.22)' : 'rgba(253, 135, 56, 0.18)'

    if (!skip) {
        topic({ lang, notification, dispatch })
    }

    return (
        <View>
            <Switch
                trackColor={{ false: inactiveTrackColor, true: activeTrackColor }}
                thumbColor={notification[category][0]
                    ? activeThumbColor
                    : inactiveThumbColor
                }
                ios_backgroundColor={inactiveTrackColor}
                onValueChange={(value) => {
                    dispatch(changeNotificationState({ value, category }))
                }}
                value={notification[category][0]}
            />
        </View>
    )
}
