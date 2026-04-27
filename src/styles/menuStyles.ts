import { StyleSheet, Platform, Dimensions } from 'react-native'
import T from './text'

const height = Dimensions.get('window').height

export const MS = StyleSheet.create({
    // Small headertitle (for multiline)
    smallMultilineTitle: {
        position: 'absolute',
        left: 60,
        right: 60,
        justifyContent: 'center',
        textAlign: 'center',
        ...T.text20,
    },
    // Top menu background view
    topMenu: {
        position: 'absolute',
        width: '105%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: '9%',
    },
    // Size of top menu icons
    tMenuIcon: {
        width: 32,
        height: 32,
    },
    multiIcon: {
        height: 18,
        width: 18,
    },
    // ----- BOTTOM MENU -----
    // Bottom menu view
    bMenu: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? '90%' : null,
        bottom: Platform.OS === 'ios'
            ? null
            : height < 600
                ? -15
                : height >= 600 && height < 700
                    ? -20
                    : -30,
        width: '100%',
        height: '12.5%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    // Bottom menu icon TouchableOpacity
    bMenuIconTouchableOpacity: {
        width: 90,
        height: 65,
    },
    // Bottom menu icons
    bMenuIcon: {
        width: 80,
        height: 65,
        alignSelf: 'center',
    },
    logoBackground: {
        width: 100,
        alignItems: 'center',
    },
})

export default MS
