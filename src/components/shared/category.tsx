import { View, Text, Platform } from 'react-native'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import { Month } from './utils'
import { JSX } from 'react'

type CategorySquareProps = {
    color: string | undefined
    height?: number
    startDate: Date | number
    endDate?: Date | undefined
}

/**
 * Function for drawing a small square  with rounded corners of the passed color
 * @param {string} color Color to display
 * @param {string} height Custom height
 * @returns Small square with rounded corners of the passed color
 */
export default function CategorySquare({ color, startDate, endDate }: CategorySquareProps): JSX.Element {

    const { theme } = useSelector((state: ReduxState) => state.theme)
    const startDay = typeof startDate === 'number' ? startDate : startDate.getDate()
    const startMonth = typeof startDate === 'number' ? 0 : startDate.getMonth()
    const endDay = endDate?.getDate()
    const multiday = endDay && startDay != endDay ? true : false

    return (
        <View style={{
            width: multiday ? 62 : 38,
            height: Platform.OS === 'ios' ? 65 : 65,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: color,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Text style={{ ...T.text20, color: theme.textColor }}>
                {startDay}
                {multiday && '-' + endDay}
            </Text>
            {startMonth !== null && <Month month={startMonth} color={theme.textColor} />}
        </View>)
}

/**
 * Header for SES category
 * @returns Text displaying 'Kategori:' or 'Category:'
 */
export function Title() {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    return <Text style={{ ...T.specificEventInfo, color: theme.textColor }}>
        {lang ? 'Kategori:      ' : 'Category:      '}
    </Text>
}

/**
 * Circle displaying the passed color
 *
 * @param {string} color Category of the event, Format: "CATEGORY"
 * @returns Small circle of the categories color
 */
export function CategoryCircle({ color }: { color: string }): JSX.Element {
    return <View style={{
        right: 10,
        height: 20,
        width: 20,
        backgroundColor: color,
        borderRadius: 100,
        overflow: 'hidden',
        marginRight: -5
    }} />
}
