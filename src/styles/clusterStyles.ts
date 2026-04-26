import { StyleSheet } from 'react-native'

export const CS = StyleSheet.create({
    // Card height and direction on eventscreen
    clusterBack: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    twinLeft: {
        width: '97%',
    },
    twinRight: {
        justifyContent: 'center',
        width: '3%',
    },
    evenTwinLeft: {
        top: -1,
        minHeight: 30,
        justifyContent: 'center',
        width: '40%',
    },
    evenTwinRight: {
        minHeight: 30,
        justifyContent: 'center',
        flexDirection: 'row',
        width: '60%',
    },
    arrowView: {
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: 1 / 1,
        transform: [{ rotate: '180deg' }],
    },
    arrowImage: {
        height: 15,
        aspectRatio: 1 / 1,
        resizeMode: 'contain',
    },
})

export default CS
