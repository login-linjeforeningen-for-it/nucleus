import { useNavigation } from '@react-navigation/native'
import MS from '@styles/menuStyles'
import { JSX } from 'react'
import { Image } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'

export default function LogoNavigation(): JSX.Element {
    const { isDark } = useSelector((state: ReduxState) => state.theme)
    const navigation: Navigation = useNavigation()

    return (
        <TouchableOpacity onPress={() => {
            navigation.getParent()?.navigate('EventNav', { screen: 'EventScreen' })
        }}>
            <Image
                style={MS.tMenuIcon}
                source={isDark
                    ? require('@assets/logo/loginText.png')
                    : require('@assets/logo/loginText-black.png')}
            />
        </TouchableOpacity>
    )
}
