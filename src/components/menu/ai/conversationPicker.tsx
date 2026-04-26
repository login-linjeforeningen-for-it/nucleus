import Text from '@components/shared/text'
import T from '@styles/text'
import { JSX } from 'react'
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native'

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
            <View style={{ gap: 10 }}>
                <TouchableOpacity onPress={onCreate}>
                    <View style={{
                        borderRadius: 14,
                        backgroundColor: theme.orangeTransparent,
                        borderColor: theme.orangeTransparentBorder,
                        borderWidth: 1,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
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
                                backgroundColor: isActive ? theme.orangeTransparentHighlighted : theme.orangeTransparent,
                                borderWidth: 1,
                                borderColor: isActive ? theme.orangeTransparentBorderHighlighted : theme.orangeTransparentBorder,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                minWidth: Dimensions.get('window').width * 0.875
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
