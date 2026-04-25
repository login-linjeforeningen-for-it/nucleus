import Space from "@/components/shared/utils"
import Text from "@components/shared/text"
import T from "@styles/text"
import { JSX } from "react"
import { TouchableOpacity, View } from "react-native"

type Props = {
    title: string
    body: string
    backgroundColor: string
    textColor: string
    mutedTextColor: string
    onPress: () => void
}

export default function OverviewCard({
    title,
    body,
    backgroundColor,
    textColor,
    mutedTextColor,
    onPress
}: Props): JSX.Element {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={{ borderRadius: 18, backgroundColor, padding: 14 }}>
                <Text style={{ ...T.text20, color: textColor }}>{title}</Text>
                <Space height={8} />
                <Text style={{ ...T.text15, color: mutedTextColor }}>
                    {body}
                </Text>
            </View>
        </TouchableOpacity>
    )
}
