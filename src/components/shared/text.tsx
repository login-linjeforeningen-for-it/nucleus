import {
    Text as RNText,
    TouchableOpacity,
    TextStyle,
    StyleProp,
    TextProps as RNTextProps,
    Alert
} from 'react-native'
import { isValidElement, ReactElement, ReactNode } from 'react'
import { copyToClipboard } from '@utils/general/clipboard'

type TextProps = {
    children: ReactNode
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
    const hasReactChildren = isValidElement(children) || (
        Array.isArray(children) && children.some(child => isValidElement(child))
    )
    const text = renderableText(children)

    if (!copyable) {
        return (
            <RNText style={style} numberOfLines={numberOfLines}>
                {hasReactChildren ? children : text}
            </RNText>
        )
    }

    // Copies the text to clipboard
    function handleCopy(selectedText: string) {
        copyToClipboard(selectedText)

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

function renderableText(children: ReactNode): string {
    if (children === null || children === undefined || typeof children === 'boolean') {
        return ''
    }

    if (typeof children === 'string' || typeof children === 'number') {
        return children.toString()
    }

    if (Array.isArray(children)) {
        return children.map(child => renderableText(child)).join('')
    }

    if (isValidElement(children)) {
        const element = children as ReactElement<{ children?: ReactNode }>

        return renderableText(element.props.children)
    }

    if (typeof children === 'object') {
        return safeStringify(children)
    }

    return String(children)
}

function safeStringify(value: object): string {
    const seen = new WeakSet<object>()

    return JSON.stringify(value, (_key, nestedValue) => {
        if (typeof nestedValue === 'object' && nestedValue !== null) {
            if (seen.has(nestedValue)) {
                return '[Circular]'
            }

            seen.add(nestedValue)
        }

        return nestedValue
    }) ?? ''
}
