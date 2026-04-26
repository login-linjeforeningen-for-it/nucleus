import { Dimensions, StyleSheet } from 'react-native'
import T from './text'

export const IS = StyleSheet.create({
    inputText: {
        minWidth: '80%',
        height: 35,
        borderRadius: 20,
        top: 25,
        ...T.text15,
        marginBottom: 25
    },
    dropImage: {
        alignSelf: 'center',
        height: 80,
        width: 40,
        top: -20,
        left: 0.8
    },
    touch: {
        height: 40,
        width: 40,
        right: Dimensions.get('window').width / 8,
        top: 35,
        borderRadius: 10
    },
    feedback: {
        alignSelf: 'center',
        top: 20,
    }
})

export default IS
