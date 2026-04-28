import { Line } from '@components/shared/utils'
import { View, Text, Dimensions } from 'react-native'
import { useSelector } from 'react-redux'

type SeparatorProps = {
    item: GetEventProps
    usedIndexes: number[]
}

type NotificationSeparatorProps = {
    text: string
}

export default function Separator({item, usedIndexes}: SeparatorProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)

    const timeDifference = (new Date(item.time_start).valueOf() - new Date().valueOf()) / 1000

    const options_no = ['Neste uke', 'Flere uker til', 'Neste måned', 'Flere måneder til', 'Lenge til']
    const options_en = ['Next week', 'In multiple weeks', 'Next month', 'In several months', 'In a long time']
    const options = lang ? options_no : options_en
    const timestamps = [604800, 1209600, 2629743, 5184000, 7776000]
    const index = timestamps.findIndex((duration: number, index: number) => (
        (timeDifference > duration) && !betterIndexExists(index, timeDifference)
    ))

    function betterIndexExists(index: number, current: number) {
        for (let i = index; i < timestamps.length; i++) {
            if (timestamps[i+1] < current) return true
        }
        return false
    }

    if (usedIndexes.includes(index)) return null
    else usedIndexes.push(index)

    const content = options[index]
    if (!content) return null

    return (
        <View style={{justifyContent: 'center', top: -5, left: 5}}>
            <Text style={{
                color: theme.oppositeTextColor,
                backgroundColor: theme.darker,
                alignSelf: 'center',
                paddingHorizontal: 8,
                top: 3,
                zIndex: 1
            }}>
                {content}
            </Text>
            <View style={{top: -5}}>
                <Line
                    width={Dimensions.get('window').width * 0.945}
                    height={1}
                    fill={theme.oppositeTextColor}
                />
            </View>
        </View>
    )
}

export function NotificationSeparator({text}: NotificationSeparatorProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{justifyContent: 'center', top: -5}}>
            <Text style={{
                color: theme.oppositeTextColor,
                backgroundColor: theme.darker,
                alignSelf: 'center',
                paddingHorizontal: 8,
                top: 3,
                zIndex: 1
            }}>
                {text}
            </Text>
            <View style={{top: -5, alignSelf: 'center'}}>
                <Line
                    width={Dimensions.get('window').width * 0.945}
                    height={1}
                    fill={theme.oppositeTextColor}
                />
            </View>
        </View>
    )
}
