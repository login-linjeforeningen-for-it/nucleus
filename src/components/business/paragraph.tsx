import { ImageSourcePropType } from 'react-native'
import { View, Text, Image } from 'react-native'
import Space from '@/components/shared/utils'
import GS from '@styles/globalStyles'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import { JSX } from 'react'

type ParagraphProps = {
    logo: ImageSourcePropType
    title: string
    body: JSX.Element | string
}

/**
 * Displays a paragraph of text with styling corresponding to the design of the app
 * @param logo Logo of the topic of the paragraph
 * @param title Title of the paragraph
 * @param body Text of the paragraph
 * @returns
 */
export default function Paragraph({ logo, title, body }: ParagraphProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View>
            <View style={GS.row}>
                <Image style={GS.medium} source={logo} />
                <Text style={{ ...T.bold28, color: theme.textColor }}>
                    {title}
                </Text>
            </View>
            <Text style={{ ...T.paragraph, color: theme.textColor }}>
                {body}
            </Text>
            <Space height={25} />
        </View>
    )
}
