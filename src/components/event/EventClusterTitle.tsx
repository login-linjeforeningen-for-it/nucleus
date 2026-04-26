import { View, Text } from 'react-native'
import ES from '@styles/eventStyles'
import { useSelector } from 'react-redux'
import { JSX } from 'react'

type EventClusterTitleProps = {
    item: GetEventProps
}

/**
 * Visual representation of the location on the Event Card
 *
 * @param item Event
 * @param theme Theme of the app
 * @param lang User language
 * @returns
 */
export default function EventClusterTitle({ item }: EventClusterTitleProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    let time = ' ' + item.time_start[11] + item.time_start[12] + ':' +
        item.time_start[14] + item.time_start[15] + '. '
    if (item.time_start[11] + item.time_start[12] + item.time_start[14] +
        item.time_start[15] === '0000') time = '  '
    const location_no = item.location?.name_no ? item.location?.name_no : 'Mer info TBA!'
    const location_en = item.location?.name_en ? item.location?.name_en || item.location?.name_no : 'More info TBA!'

    // Uses language name as default, and other language as fallback
    const title = lang ? (item.name_no || item.name_en) : (item.name_en || item.name_no)
    const info = (time + lang ? location_no : location_en).trim()

    return (
        <View style={ES.view2}>
            <Text style={{ ...ES.title, color: theme.textColor }}>
                {title}
            </Text>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ ...ES.loc, color: theme.oppositeTextColor }}>
                    {info}
                </Text>
            </View>
        </View>
    )
}
