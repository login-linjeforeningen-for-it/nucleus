import { StyleSheet } from 'react-native'
import T from './text'

export const SS = StyleSheet.create({
    // lightSwitchImage in notificationScreen
    lightSwitchImage: {
        aspectRatio: 1 / 1,
        height: 72,
        width: 72,
        alignSelf: 'center',
    },
    // langSwitch text style in notificationScreen
    langSwitch: {
        left: 12.5,
        ...T.text20,
    },
    // Report button on reportScreen
    button: {
        borderRadius: 10,
        marginHorizontal: 108,
        marginVertical: 6,
    },
    // Button margin
    buttonContent: {
        marginVertical: 10,
    },
    // Secures the dimensions of the reportViews
    reportContentView: {
        height: 200,
        alignSelf: 'center',
        flexDirection: 'row',
    },
    // Light position on loginScreen
    greenLight: {
        left: '14%',
        top: '10%',
        alignSelf: 'center',
    },
    // Check position on loginScreen
    checkContent: {
        left: '25%',
        top: '-55%',
        alignSelf: 'center',
    },
    // Light position on reportScreen
    reportGreenLight: {
        left: '14%',
        top: '40%',
        alignSelf: 'center',
    },
    // Check position on reportScreen
    reportCheckContent: {
        left: '25%',
        top: '23%',
        alignSelf: 'center',
    },
    // PassLight position on reportScreen
    passLight: {
        left: '14%',
        top: '6.2%',
        alignSelf: 'center',
    },
    // PassCheckIcon position on reportScreen
    passCheck: {
        left: '25%',
        top: '-35%',
        alignSelf: 'center',
    },
    // ShowPassIcon position on reportScreen
    showPassImage: {
        left: '-11%',
        top: '-20%',
        height: 40,
        width: 40,
    },
    // PassIcon position on reportScreen
    noPassImage: {
        left: '-10%',
        top: '-46.5%',
        height: 40,
        width: 40,
    },
    // PassLight position on reportScreen
    noPassLight: {
        left: '14%',
        top: '10%',
        alignSelf: 'center',
    },
    // PassCheck position on reportScreen
    noPassCheck: {
        left: '25%',
        top: '-35%',
        alignSelf: 'center',
    },
    // Views on login screen
    loginView: {
        height: 50,
        alignSelf: 'center',
        flexDirection: 'row',
    },
})

export default SS
