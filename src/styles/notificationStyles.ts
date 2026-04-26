import { StyleSheet, Platform } from 'react-native'
import T from './text'

export const NS = StyleSheet.create({
    notificationBack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationView: {
        justifyContent: 'center',
        bottom: 4,
        width: '100%',
    },
    title: {
        maxHeight: Platform.OS === 'ios' ? 20 * 3 : 17 * 2.5,
        ...T.text20,
    },
    loc: {
        ...T.text15,
    },
    time: {
        top: -25,
        ...T.text12,
    },
    error: {
        textAlign: 'center',
        top: '60%',
        height: 200
    }
})

export default NS
