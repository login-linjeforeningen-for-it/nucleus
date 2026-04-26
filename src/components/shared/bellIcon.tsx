import { Image, Text } from 'react-native'
import ES from '@styles/eventStyles'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import { JSX } from 'react'

type BellIconProps = {
    orange?: boolean
    canceled?: boolean
}

/**
 * Small bell icon used to subscribe to event and job advertisement updates
 *
 * @returns Bell icon
 */
export default function BellIcon({ orange, canceled }: BellIconProps): JSX.Element {
    if (canceled) return <Text style={{ ...T.text20, left: 2 }}>❌</Text>

    let icon = require('@assets/icons/bell.png')
    const { isDark } = useSelector((state: ReduxState) => state.theme)

    if (orange) {
        icon = require('@assets/icons/bell-orange.png')
    } else if (!isDark) {
        icon = require('@assets/icons/bell-black.png')
    }

    return <Image style={ES.bellSize} source={icon} />
}
