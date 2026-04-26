import Clipboard from '@react-native-clipboard/clipboard'
import {
    Text as RNText,
    TouchableOpacity,
    TextStyle,
    StyleProp,
    TextProps as RNTextProps,
    Alert
} from 'react-native'

type TextProps = {
    children: string | number | object
    style: StyleProp<TextStyle>
    copyable?: boolean
    warning?: string[]
    numberOfLines?: RNTextProps['numberOfLines']
}

/**
 * Provides custom behavior for the Text component, allowing it to be copied,
 * arrays to be joined and objects to be destructured.
 * @param children string | object | number to display as string
 * @param style Style object for React Natives Text component
 * @param copyable Whether the text should be copyable
 * @returns
 */
export default function Text({ children, style, copyable, warning, numberOfLines }: TextProps) {
    let text = ''

    if (typeof children != 'string') {
        if (typeof children == 'object') {
            text = JSON.stringify(children)
        }

        if (typeof children == 'number') {
            text = children.toString()
        }

        if (Array.isArray(children)) {
            text = children.join()
        }
    } else {
        text = children
    }

    if (!copyable) {
        return <RNText style={style} numberOfLines={numberOfLines}>{text}</RNText>
    }

    // Copies the text to clipboard
    function handleCopy(selectedText: string) {
        Clipboard.setString(selectedText)

        if (warning) {
            Alert.alert(warning[0], warning[1])
        }
    }

    return (
        <TouchableOpacity onPress={() => handleCopy(text)}>
            <RNText style={style} numberOfLines={numberOfLines}>{text}</RNText>
        </TouchableOpacity>
    )
}
