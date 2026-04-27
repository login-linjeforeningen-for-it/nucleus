import { setClickedEvents } from '@redux/event'
import { Linking, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import ES from '@styles/eventStyles'
import T from '@styles/text'
import { useContext } from 'react'
import { EventContext } from '@utils/app/contextProvider'

export default function JoinButton() {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { clickedEvents } = useSelector((state: ReduxState) => state.event)
    const event = useContext(EventContext)
    const dispatch = useDispatch()
    const text = lang ? 'Meld meg på' : 'Join event'

    if (!event) {
        return null
    }

    const currentEvent = event

    function updateStorage() {
        if (!clickedEvents.some(clicked => clicked.id === currentEvent.id)) {
            dispatch(setClickedEvents([...clickedEvents, currentEvent]))
        }
    }

    if (!currentEvent.link_signup) {
        return null
    }

    const signupUrl = currentEvent.link_signup

    return (
        <TouchableOpacity onPress={() => {
            updateStorage()
            Linking.openURL(signupUrl)
        }}>
            <View style={{ ...ES.eventButton, backgroundColor: theme.orange }}>
                <Text style={{ ...T.centered20, color: theme.textColor, paddingTop: 8 }}>
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    )
}
