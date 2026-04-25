import Text from "@components/shared/text"
import T from "@styles/text"
import { JSX } from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"

type Props = {
    conversations: NativeConversationSummary[]
    activeConversationId?: string | null
    theme: Theme
    onSelect: (conversationId: string) => void
    onCreate: () => void
    currentConversationLabel: string
    newConversationLabel: string
}

export default function AiConversationPicker({
    conversations,
    activeConversationId,
    theme,
    onSelect,
    onCreate,
    currentConversationLabel,
    newConversationLabel
}: Props): JSX.Element {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={onCreate}>
                    <View style={{
                        borderRadius: 14,
                        backgroundColor: "#fd873814",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        minWidth: 132
                    }}>
                        <Text style={{ ...T.text15, color: theme.textColor }}>
                            {newConversationLabel}
                        </Text>
                        <Text style={{ ...T.text12, color: theme.orange }}>
                            +
                        </Text>
                    </View>
                </TouchableOpacity>
                {conversations.map(conversation => {
                    const isActive = activeConversationId === conversation.id

                    return (
                        <TouchableOpacity key={conversation.id} onPress={() => onSelect(conversation.id)}>
                            <View style={{
                                borderRadius: 14,
                                backgroundColor: isActive ? "#fd873814" : "#ffffff08",
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                maxWidth: 220
                            }}>
                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                    {conversation.title}
                                </Text>
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                    {isActive ? currentConversationLabel : conversation.activeClientName}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </ScrollView>
    )
}
