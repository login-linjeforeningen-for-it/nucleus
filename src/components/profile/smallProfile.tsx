import { Image, View, Text, TouchableOpacity } from 'react-native'
import PS from '@styles/profileStyles'
import CS from '@styles/clusterStyles'
import T from '@styles/text'
import { useSelector } from 'react-redux'
import { JSX } from 'react'

type SmallProfileProps = {
    navigation: Navigation
    profile: ProfileProps
    login: boolean
}

/**
 * Function for drawing a very small square of the category of the event
 *
 * @param {string} category    Category of the event, Format: "CATEGORY"
 * @returns                     Small circle of the categories color
 */
export default function SmallProfile({ navigation, profile, login }:
SmallProfileProps): JSX.Element {  // SVG showing the color of the category

    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    if (!login) return <></>

    return (
        <TouchableOpacity onPress={() => login
            ? navigation.navigate('ProfileScreen')
            : navigation.navigate('LoginScreen')}
        >
            <View style={PS.profileBackground}>
                <View style={PS.smallProfileLeftTriplet}>
                    <View style={PS.smallProfileImageView}>
                        <Image
                            style={PS.smallProfileImage}
                            source={profile.image
                                ? { uri: profile.image }
                                : isDark
                                    ? require('@assets/icons/loginperson-white.png')
                                    : require('@assets/icons/loginperson-black.png')}
                        />
                    </View>
                </View>
                <View style={PS.smallProfileMiddleTriplet}>
                    {typeof profile.id === 'number' ?
                        <>
                            <Text style={{ ...T.text20, color: theme.textColor }}>
                                {profile.name}
                            </Text>
                            <Text style={{
                                ...T.text15,
                                color: theme.oppositeTextColor
                            }}>
                                {lang ? 'Vis profil' : 'Show profile'}
                            </Text>
                        </>
                        :
                        <Text style={{ ...T.text25, color: theme.textColor }}>
                            Login
                        </Text>
                    }
                </View>
                <View style={PS.smallProfileRightTriplet}>
                    <Image
                        style={CS.arrowImage}
                        source={require('@assets/icons/dropdownBase.png')}
                    />
                </View>
            </View>
        </TouchableOpacity>
    )
}
