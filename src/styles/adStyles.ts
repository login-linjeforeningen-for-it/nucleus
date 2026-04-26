import { StyleSheet, Dimensions, Platform } from 'react-native'
import T from './text'

export const AS = StyleSheet.create({
    content: {
        flex: 1,
        minHeight: '100%',
    },
    adBack: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 2
    },
    adViewLeft: {
        alignItems: 'center',
    },
    adViewMid: {
        justifyContent: 'center',
        left: Platform.OS === 'ios' ? 7.5 : 10,
        paddingHorizontal: 6,
        marginRight: 'auto',
        width: '50%'
    },
    locationView: {
        justifyContent: 'center',
    },
    title: {
        maxHeight: Platform.OS === 'ios' ? 20 * 3 : 17 * 2.5,
        ...T.text12
    },
    specificAdTitle: {
        maxWidth: '60%',
        left: 10,
        alignSelf: 'center',
        // Limits to 3 lines (same as image height)
        // maxHeight: Platform.OS === "ios" ? 24 * 3 : 17 * 2.5,
        ...T.text16
    },
    adInfoType: {
        ...T.text16
    },
    adInfo: {
        maxWidth: '90%',
        ...T.text16
    },
    adInfoBold: {
        fontWeight: 'bold',
        ...T.text175
    },
    socialMediaImage: {
        height: 30,
        width: 30,
    },
    // Join event button
    adButton: {
        height: 30,
        width: Dimensions.get('window').width / 2.75,
        alignSelf: 'center',
        borderRadius: 10,
    },
    adButtonText: {
        textAlign: 'center',
        top: Platform.OS === 'ios' ? 2 : 0,
        fontWeight: '600',
        ...T.text20
    },
    socialView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: 5
    },
    loc: {
        top: 3,
        ...T.text15
    },
    adTitleView: {
        flexDirection: 'row',
        marginBottom: 10
    },
    adInfoInsideView: {
        flexDirection: 'row',
    },
    adBannerSmall: {
        top: 1.7,
        height: 60,
        aspectRatio: 5 / 2,
        resizeMode: 'stretch',
    },
    adBanner: {
        width: '100%',
        marginBottom: 12
    },
    adClusterImage: {
        aspectRatio: 5 / 2,
    },
})

export default AS
