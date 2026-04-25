import Text from "@components/shared/text"
import T from "@styles/text"
import { JSX } from "react"
import { Pressable, TextInput, View } from "react-native"

type Props = {
    value: string
    onChangeText: (value: string) => void
    onSend: () => void
    theme: Theme
    placeholder: string
}

export default function AiComposer({ value, onChangeText, onSend, theme, placeholder }: Props): JSX.Element {
    const canSend = value.trim().length > 0

    return (
        <View>
            <TextInput
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
                    paddingVertical: 12,
                    minHeight: 48,
                    paddingRight: canSend ? 52 : 14,
                }}
            />
            {canSend ? (
                <Pressable
                    onPress={onSend}
                    style={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: theme.orange,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text style={{ ...T.text16, color: theme.darker, fontWeight: "700" }}>
                        ↑
                    </Text>
                </Pressable>
            ) : null}
        </View>
    )
}
