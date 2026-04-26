import T from '@styles/text'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function CourseError({ text }: { text: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ ...T.text12, color: theme.textColor }}>{text}</Text>
        </View>
    )
}
