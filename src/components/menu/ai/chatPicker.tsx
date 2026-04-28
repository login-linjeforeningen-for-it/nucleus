import { PinAction, PinnedLine } from '@components/menu/root/menuCards'
import Text from '@components/shared/text'
import T from '@styles/text'
import { usePinnedRoutes } from '@utils/menu/pinnedRoutes'
import { Eye, EyeOff, Plus } from 'lucide-react-native'
import { JSX, useMemo, useState } from 'react'
import { Dimensions, Pressable, ScrollView, TouchableOpacity, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'

type Props = {
    conversations: NativeConversationSummary[]
    activeConversationId?: string | null
    theme: Theme
    onSelect: (conversationId: string) => void
    onCreate: () => void
    currentConversationLabel: string
    newConversationLabel: string
}

export default function ChatPicker({
    conversations,
    activeConversationId,
    theme,
    onSelect,
    onCreate,
    currentConversationLabel,
    newConversationLabel
}: Props): JSX.Element {
    const { pinnedRoutes, togglePinnedRoute } = usePinnedRoutes('ai:pinned-conversations', [])
    const { pinnedRoutes: hiddenRoutes, togglePinnedRoute: toggleHiddenRoute } = usePinnedRoutes('ai:hidden-conversations', [])
    const [showHidden, setShowHidden] = useState(false)
    const sortedConversations = useMemo(() => {
        const originalIndex = new Map(conversations.map((conversation, index) => [conversation.id, index]))
        const visibleConversations = showHidden
            ? conversations
            : conversations.filter(conversation => !hiddenRoutes.includes(conversation.id))

        return [...visibleConversations].sort((first, second) => {
            const firstPinnedIndex = pinnedRoutes.indexOf(first.id)
            const secondPinnedIndex = pinnedRoutes.indexOf(second.id)
            const firstPinned = firstPinnedIndex !== -1
            const secondPinned = secondPinnedIndex !== -1

            if (firstPinned || secondPinned) {
                return (firstPinned ? firstPinnedIndex : pinnedRoutes.length)
                    - (secondPinned ? secondPinnedIndex : pinnedRoutes.length)
            }

            return (originalIndex.get(first.id) ?? 0) - (originalIndex.get(second.id) ?? 0)
        })
    }, [conversations, hiddenRoutes, pinnedRoutes, showHidden])
    const hiddenCount = conversations.filter(conversation => hiddenRoutes.includes(conversation.id)).length

    return (
        <View style={{ gap: 10 }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: Dimensions.get('window').height * 0.46 }}
                contentContainerStyle={{ gap: 10 }}
            >
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
                {sortedConversations.map(conversation => {
                    const isActive = activeConversationId === conversation.id
                    const pinned = pinnedRoutes.includes(conversation.id)
                    const hidden = hiddenRoutes.includes(conversation.id)

                    return (
                        <Swipeable
                            key={conversation.id}
                            renderLeftActions={() => <HideAction hidden={hidden} theme={theme} />}
                            renderRightActions={() => <PinAction pinned={pinned} theme={theme} />}
                            leftThreshold={44}
                            rightThreshold={44}
                            overshootLeft={false}
                            overshootRight={false}
                            onSwipeableOpen={(direction) => {
                                if (direction === 'left') {
                                    toggleHiddenRoute(conversation.id)
                                }
                                if (direction === 'right') {
                                    togglePinnedRoute(conversation.id)
                                }
                            }}
                        >
                            <Pressable onPress={() => onSelect(conversation.id)}>
                                <View style={{
                                    borderRadius: 14,
                                    backgroundColor: isActive ? theme.orangeTransparentHighlighted : theme.greyTransparent,
                                    borderWidth: 1,
                                    borderColor: isActive ? theme.orangeTransparentBorderHighlighted : theme.greyTransparentBorder,
                                    minWidth: Dimensions.get('window').width * 0.873,
                                    opacity: hidden ? 0.54 : 1,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 10 }}>
                                        <PinnedLine pinned={pinned} theme={theme} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ ...T.text15, color: theme.textColor }}>
                                                {conversation.title}
                                            </Text>
                                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                {isActive ? currentConversationLabel : conversation.activeClientName}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        </Swipeable>
                    )
                })}
            </ScrollView>
            {hiddenCount ? (
                <Pressable onPress={() => setShowHidden(current => !current)}>
                    <View style={{
                        alignItems: 'center',
                        alignSelf: 'center',
                        backgroundColor: showHidden ? theme.orangeTransparent : 'rgba(255,255,255,0.045)',
                        borderColor: showHidden ? theme.orangeTransparentBorder : 'rgba(255,255,255,0.08)',
                        borderRadius: 16,
                        borderWidth: 1,
                        height: 32,
                        justifyContent: 'center',
                        width: 44,
                    }}>
                        {showHidden
                            ? <Eye color={theme.orange} size={17} strokeWidth={2.2} />
                            : <EyeOff color={theme.oppositeTextColor} size={17} strokeWidth={2.2} />}
                    </View>
                </Pressable>
            ) : null}
        </View>
    )
}

function HideAction({ hidden, theme }: { hidden: boolean, theme: Theme }) {
    return (
        <View style={{
            width: 76,
            marginVertical: 6,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
        }}>
            {hidden
                ? <Eye color={theme.orange} size={18} strokeWidth={2.2} />
                : <EyeOff color={theme.oppositeTextColor} size={18} strokeWidth={2.2} />}
            <Text style={{ ...T.text12, color: hidden ? theme.orange : theme.oppositeTextColor, marginTop: 4 }}>
                {hidden ? 'Show' : 'Hide'}
            </Text>
        </View>
    )
}
