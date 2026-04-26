import { useSelector } from 'react-redux'
import MS from '@styles/menuStyles'
import { BlurView } from 'expo-blur'
import {
    View,
    Image,
    TouchableOpacity,
    Platform,
    Text,
    Dimensions
} from 'react-native'

type TopMenuProps = {
    navigation: Navigation
    title: string
    screen: string
    back?: string
}
/**
 * Top Menu on every page
 * @param {*} props
 * @returns
 */
export default function TopMenu({ navigation, title, screen, back }: TopMenuProps) {

    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)

    function goBack() {
        navigation.navigate(back ? back : 'Events')
    }

    function eventPage() {
        navigation.navigate('Events')
    }

    return (
        <>
            {Platform.OS === 'ios'
                ? <BlurView style={MS.topMenu} intensity={30} />
                : <View style={{
                    ...MS.topMenu,
                    backgroundColor: theme.transparentAndroid
                }} />}
            <View style={{ ...MS.topMenu, backgroundColor: theme.transparent }}>
                {back ?
                    <TouchableOpacity onPress={() => goBack()}>
                        <Image
                            source={require('@assets/icons/goback777.png')}
                        />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                        style={MS.logoBackground}
                        onPress={() => screen != 'Events' && eventPage()}
                    >
                        <Image
                            style={MS.tMenuIcon}
                            source={isDark
                                ? require('@assets/logo/loginText.png')
                                : require('@assets/logo/loginText-black.png')}
                        />
                    </TouchableOpacity>
                }
                <Text
                    style={{
                        ...MS.smallMultilineTitle,
                        top: title.length > 28
                            ? Dimensions.get('window').height / 22
                            : Dimensions.get('window').height / 17,
                        color: theme.titleTextColor
                    }}
                >
                    {title}
                </Text>
            </View>
        </>
    )
}
