import { useSelector } from 'react-redux'
import ES from '@styles/eventStyles'
import { View } from 'react-native'
import React from 'react'

/**
 * Card function for styling a div, displays a view containing curved corners with content inside
 * @param {*} props     Content to put inside the card
 * @returns             Card with the props inside
 */
export default function Card({ children }: React.PropsWithChildren<{}>) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ ...ES.card, backgroundColor: theme.contrast }}>
            <View style={ES.cardContent}>
                {children}
            </View>
        </View>
    )
}

/**
 * Smaller card function for styling a div, displays a view containing curved corners with content inside
 * @param {*} props     Content to put inside the card
 * @returns             Card with the props inside
 */
export function CardSmaller({ children }: React.PropsWithChildren<{}>) {
    return (
        <View style={ES.cardSmaller}>
            <View>
                {children}
            </View>
        </View>
    )
}
