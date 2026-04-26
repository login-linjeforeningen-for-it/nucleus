import { StyleSheet, Dimensions } from 'react-native'

export const XS = StyleSheet.create({
    content: {
        height: Dimensions.get('window').height + 30,
        paddingHorizontal: 12
    }
})

export default XS
