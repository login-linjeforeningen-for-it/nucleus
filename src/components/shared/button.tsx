import SS from '@styles/settingStyles'
import { useSelector } from 'react-redux'
import { ReactNode } from 'react'
import { View } from 'react-native'

type ButtonProps = {
    children: ReactNode
}

/**
 * Returns a Login colored button
 * @param {*} props
 * @returns Button with the content displayed inside
 */
export default function Button(props: ButtonProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{...SS.button, backgroundColor: theme.orange}}>
            <View style={SS.buttonContent}>
                { props.children }
            </View>
        </View>
    )
}
