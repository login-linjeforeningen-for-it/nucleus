import T from '@styles/text'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function CourseError({ text }: { text: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View
            style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.orangeTransparentBorder,
                backgroundColor: theme.greyTransparent,
                padding: 16,
                marginHorizontal: 4,
                marginVertical: 10,
                overflow: 'hidden',
            }}
        >
            <Text style={{ ...T.text15, color: theme.textColor, fontWeight: '600' }}>
                Could not load courses
            </Text>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor, lineHeight: 18, marginTop: 6 }}>
                {text}
            </Text>
        </View>
    )
}
