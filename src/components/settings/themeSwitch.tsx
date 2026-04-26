import { View, TouchableOpacity, Image } from 'react-native'
import { changeTheme, resetTheme } from '@redux/theme'
import { useSelector, useDispatch } from 'react-redux'
import SS from '@styles/settingStyles'

/**
 * Function that provides a switch for controlling the theme of the application
 * @returns View containing switch
 */
export default function ThemeSwitch() {

    const { value } = useSelector((state: ReduxState) => state.theme)
    const dispatch = useDispatch()

    return (
        <View style={{ height: 40, width: 56, justifyContent: 'center', alignItems: 'flex-end' }}>
            <TouchableOpacity
                onPress={() => value > 3 ? dispatch(resetTheme()) : dispatch(changeTheme())}
                style={{ height: 40, width: 56, justifyContent: 'center', alignItems: 'flex-end' }}
            >
                {value === 0 ? (
                    <Image
                        style={[SS.lightSwitchImage, { transform: [{ translateX: 15 }] }]}
                        source={require('@assets/themes/sun.png')}
                    />
                ) : null}
                {value === 1 ? (
                    <Image
                        style={[SS.lightSwitchImage, { transform: [{ translateX: 15 }] }]}
                        source={require('@assets/themes/abyss.png')}
                    />
                ) : null}
                {value === 2 ? (
                    <Image
                        style={[SS.lightSwitchImage, { transform: [{ translateX: 15 }] }]}
                        source={require('@assets/themes/sunset.png')}
                    />
                ) : null}
                {value === 3 ? (
                    <Image
                        style={[SS.lightSwitchImage, { transform: [{ translateX: 15 }] }]}
                        source={require('@assets/themes/christmas.png')}
                    />
                ) : null}
                {/* {value === 4 ? <Image style={SS.lightSwitchImage} source={require("@assets/themes/easter.png")} />: null} */}
                {value === 4 ? (
                    <Image
                        style={[SS.lightSwitchImage, { transform: [{ translateX: 15 }] }]}
                        source={require('@assets/themes/moon.png')}
                    />
                ) : null}
            </TouchableOpacity>
        </View>
    )
}
