import { View, Text, TouchableOpacity } from 'react-native'
import ES from '@styles/eventStyles'
import T from '@styles/text'
import { useSelector } from 'react-redux'
import { TextLink } from '@components/shared/link'
import config from '@/constants'

type FeedbackProps = {
    index: number
    setting: SettingProps[]
    feedback: boolean
    toggleFeedback: () => void
}

export default function Feedback({ index, setting, feedback, toggleFeedback }: FeedbackProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    if (index === setting.length - 1 && !feedback) {
        return (
            <TouchableOpacity onPress={() => toggleFeedback()}>
                <View style={{ marginBottom: 10 }}>
                    <Text
                        style={{
                            ...T.contact,
                            textDecorationLine: 'underline',
                            color: theme.oppositeTextColor
                        }}>
                        {lang ? 'Gi tilbakemelding' : 'Give feedback'}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    if (index === setting.length - 1 && feedback) {
        return (
            <View style={{ ...ES.row, justifyContent: 'space-evenly', marginBottom: 10 }}>
                <TextLink
                    url='https://discordapp.com/users/376827396764073997'
                    text='Discord'
                    style={{
                        ...T.contact,
                        textDecorationLine: 'underline',
                        color: theme.oppositeTextColor
                    }}
                />
                <TextLink
                    url={config.mailto}
                    text='Mail'
                    style={{
                        ...T.contact,
                        textDecorationLine: 'underline',
                        color: theme.oppositeTextColor
                    }}
                />
            </View>
        )
    }
}
