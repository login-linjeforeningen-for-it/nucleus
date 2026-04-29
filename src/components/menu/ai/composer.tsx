import Text from '@components/shared/text'
import T from '@styles/text'
import { JSX, useEffect, useRef } from 'react'
import { Pressable, TextInput, View } from 'react-native'

type Props = {
    value: string
    onChangeText: (value: string) => void
    onSend: () => void
    theme: Theme
    placeholder: string
    autoFocus?: boolean
}

export default function AiComposer({ value, onChangeText, onSend, theme, placeholder, autoFocus }: Props): JSX.Element {
    const inputRef = useRef<TextInput | null>(null)
    const canSend = value.trim().length > 0

    useEffect(() => {
        if (!autoFocus) {
            return
        }

        const timeout = setTimeout(() => inputRef.current?.focus(), 250)

        return () => clearTimeout(timeout)
    }, [autoFocus])

    return (
        <View>
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                autoCorrect={false}
                returnKeyType='send'
                onSubmitEditing={() => canSend && onSend()}
                placeholderTextColor={theme.oppositeTextColor}
                style={{
                    borderRadius: 18,
                    backgroundColor: theme.contrast,
                    color: theme.textColor,
                    paddingHorizontal: 14,
                    minHeight: 48,
                    paddingRight: canSend ? 52 : 14,
                }}
            />
            {canSend ? (
                <Pressable
                    onPress={onSend}
                    style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        width: 32,
                        height: 32,
                        borderRadius: 20,
                        backgroundColor: theme.orange,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ ...T.text16, color: theme.darker, fontWeight: '700' }}>
                        ↑
                    </Text>
                </Pressable>
            ) : null}
        </View>
    )
}
