import T from '@styles/text'
import { Dimensions, Image, Text } from 'react-native'
import MarkdownDisplay, { getUniqueID } from 'react-native-markdown-display'
import { useSelector } from 'react-redux'

type MarkdownProps = {
    text: string
    fontSize?: number
}

export default function Markdown({ text, fontSize }: MarkdownProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <MarkdownDisplay
            rules={rules(theme)}
            style={{
                fence: {
                    backgroundColor: theme.dark,
                    padding: 10,
                    borderRadius: 8,
                    overflow: 'hidden',
                    fontFamily: 'Courier',
                    marginVertical: 8,
                    color: theme.textColor,
                    borderWidth: 0,
                },
                code_block: {
                    backgroundColor: theme.contrast,
                    padding: 10,
                    borderRadius: 8,
                    overflow: 'hidden',
                    fontFamily: 'Courier',
                    marginVertical: 8,
                    color: theme.textColor,
                    borderWidth: 0,
                },
                code_inline: {
                    backgroundColor: theme.contrast,
                    padding: 10,
                    borderRadius: 8,
                    overflow: 'hidden',
                    fontFamily: 'Courier',
                    marginVertical: 8,
                    color: theme.textColor,
                },
                image: {
                    width: 300,
                    height: 200,
                    resizeMode: 'contain',
                    marginVertical: 10,
                },
                link: {
                    color: '#3b82f6',
                    textDecorationLine: 'underline',
                },
                heading1: {
                    ...T.text32,
                    color: theme.textColor,
                },
                heading2: {
                    ...T.text24,
                    color: theme.textColor,
                },
                heading3: {
                    ...T.text18,
                    color: theme.textColor,
                },
                heading4: {
                    ...T.text16,
                    color: theme.textColor,
                },
                heading5: {
                    ...T.text12,
                    color: theme.textColor,
                },
                heading6: {
                    ...T.text10,
                    color: theme.textColor,
                },
                text: {
                    ...T.text16,
                    fontSize: fontSize || T.text16.fontSize,
                    color: theme.textColor,
                },
            }}>
            {text}
        </MarkdownDisplay>
    )
}

function rules(theme: Theme) {
    return {
        // @ts-expect-error
        image: (node, _, _a, styles) => {
            const { src } = node.attributes

            return (
                <Image
                    key={getUniqueID()}
                    source={{ uri: src }}
                    style={[styles.image, {
                        minWidth: Dimensions.get('window').width * 0.8,
                        minHeight: 100
                    }]}
                />
            )
        },
        // @ts-expect-error
        list_item: (_, children) => {
            return (
                <Text key={getUniqueID()} style={{ marginVertical: 4 }}>
                    <Text style={{ color: theme.orange, fontWeight: 900 }}>•</Text> {children}
                </Text>
            )
        },
    }
}
