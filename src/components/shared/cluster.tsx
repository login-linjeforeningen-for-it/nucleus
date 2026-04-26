import { View } from 'react-native'
import { ClusterProps } from '@/interfaces'
import { useSelector } from 'react-redux'
import ES from '@styles/eventStyles'
import React from 'react'

/**
 * Card function for styling a div, displays a view containing curved
 * corners with content inside
 * @param {*} props     Content to put inside the card
 * @returns             Card with the props inside
 */
export default function Cluster({
    noColor,
    marginVertical,
    marginHorizontal,
    children,
    highlight,
    style
}: ClusterProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            backgroundColor: !noColor ? theme.darker : '',
            margin: highlight ? 4 : 0,
            paddingHorizontal: !highlight ? 6 : 4,
            ...ES.clusterWraper,
            ...style as any
        }}>
            <View style={{ ...ES.clusterContent, marginVertical, marginHorizontal }}>
                {children}
            </View>
        </View>
    )
}

/**
 * Smaller cluster function for styling a div, displays a view containing curved
 * corners with content inside
 * @param {*} props     Content to put inside the cluster
 * @returns             Cluster with the props inside
 */
export function ClusterSmaller({ children }: React.PropsWithChildren<{}>) {

    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ ...ES.clusterSmaller, backgroundColor: theme.darker }}>
            <View>
                {children}
            </View>
        </View>
    )
}
