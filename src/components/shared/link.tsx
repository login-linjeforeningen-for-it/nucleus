import en from '@text/shared/link/en.json'
import no from '@text/shared/link/no.json'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import { ReactNode } from 'react'
import AS from '@styles/adStyles'
import {
    Alert,
    Linking,
    StyleProp,
    Text,
    TextStyle,
    TouchableOpacity,
    View
} from 'react-native'

type LinkProps = {
    url: string
    children: ReactNode
    errorMessage?: string
}

type TextLinkProps = {
    url: string
    text: string
    style?: StyleProp<TextStyle>
    errorMessage?: string
}

type LinkButtonProps = {
    url: string
    text: string
}

type MarkdownLinkProps = {
    text: string
    style?: StyleProp<TextStyle>
    linkStyle?: StyleProp<TextStyle>
}

/**
 * Wraps the content in a touchableopacity with linking to open the passed URL
 * when any child element is tapped.
 * @param url URL to open on click
 * @param children ReactNodes, implicitly passed
 * @param errorMessage Message to display if the link could not be opened
 * @returns Link wrapper
 */
export default function Link({ url, children, errorMessage }: LinkProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? no : en
    const errorTitle = url.includes('mailto:')
        ? text.mailErrorTitle
        : text.linkErrorTitle
    const errorBody = url.includes('mailto:')
        ? text.mailErrorBody
        : errorMessage
            ? errorMessage
            : text.linkErrorBody + url

    return (
        <TouchableOpacity onPress={() => Linking.openURL(url).catch(() =>
            Alert.alert(errorTitle, errorBody))}>
            {children}
        </TouchableOpacity>
    )
}

/**
 * Touchable text that opens the passed URL when clicked
 *
 * @param text Text to display
 * @param url URL to open on click
 * @param style Style to give the text
 * @param errorMessage Optional message to display if the link could not be
 * opened, has a default link could not be opened message.
 * @returns Link wrapper
 */
export function TextLink({ text, url, style, errorMessage }: TextLinkProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const errorText = lang ? no : en
    const errorTitle = url.includes('mailto:')
        ? errorText.mailErrorTitle
        : errorText.linkErrorTitle
    const errorBody = url.includes('mailto:')
        ? errorText.mailErrorBody
        : errorMessage
            ? errorMessage
            : errorText.linkErrorBody + url

    return (
        <TouchableOpacity onPress={() => Linking.openURL(url).catch(() =>
            Alert.alert(errorTitle, errorBody))}>
            <Text style={style ? style : { ...T.orange15, top: 3.6 }}>
                {text}
            </Text>
        </TouchableOpacity>
    )
}

/**
 * Button that sends the user to the passed URL when clicked
 *
 * @param text Text to display
 * @param url URL to open on click
 * @param style Style to give the text
 * @param errorMessage Optional message to display if the link could not be
 * opened, has a default link could not be opened message.
 * @returns Link wrapper
 */
export function LinkButton({ url, text }: LinkButtonProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <TouchableOpacity onPress={() =>
            Linking.openURL(url)}>
            <View style={{
                ...AS.adButton,
                backgroundColor: theme.orange
            }}>
                <Text style={{ ...AS.adButtonText, color: theme.textColor }}>
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export function TextWithLinks({ text, style, linkStyle }: MarkdownLinkProps) {
    const regex = /\[(.*?)\]\((.*?)\)/g
    const parts = text.split(regex)

    const markdown = parts.map((part, index) => {
        if (index % 3 === 0) {
            return <Text key={index}>{part}</Text>
        } else if (index % 3 === 1) {
            if (typeof linkStyle !== 'object') {
                return <TextLink
                    style={linkStyle}
                    key={index}
                    url={parts[index + 1]}
                    text={part}
                />
            }

            return <TextLink
                style={{ ...linkStyle, top: 3, left: 0 }}
                key={index}
                url={parts[index + 1]}
                text={part}
            />
        }
        return null
    })

    return (
        <Text style={style}>
            {markdown}
        </Text>
    )
}
