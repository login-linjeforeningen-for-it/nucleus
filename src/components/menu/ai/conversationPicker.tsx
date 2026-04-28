import Text from '@components/shared/text'
import T from '@styles/text'
import { Plus } from 'lucide-react-native'
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
                        alignItems: 'center',
                        borderRadius: 14,
                        backgroundColor: theme.greyTransparent,
                        borderColor: theme.greyTransparentBorder,
                        borderWidth: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        minWidth: Dimensions.get('window').width * 0.873,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                    }}>
                        <Text style={{ ...T.text15, color: theme.textColor }}>
                            {newConversationLabel}
                        </Text>
                        <View style={{
                            alignItems: 'center',
                            backgroundColor: theme.orangeTransparentHighlighted,
                            borderColor: theme.orangeTransparentBorderHighlighted,
                            borderRadius: 13,
                            borderWidth: 1,
                            height: 26,
                            justifyContent: 'center',
                            width: 26,
                        }}>
                            <Plus color={theme.orange} size={16} strokeWidth={2.3} />
                        </View>
                    </View>
                </TouchableOpacity>
                {conversations.map(conversation => {
                    const isActive = activeConversationId === conversation.id

                    return (
                        <TouchableOpacity key={conversation.id} onPress={() => onSelect(conversation.id)}>
                            <View style={{
                                borderRadius: 14,
                                backgroundColor: isActive ? theme.orangeTransparentHighlighted : theme.greyTransparent,
                                borderWidth: 1,
                                borderColor: isActive ? theme.orangeTransparentBorderHighlighted : theme.greyTransparentBorder,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                minWidth: Dimensions.get('window').width * 0.873,
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
