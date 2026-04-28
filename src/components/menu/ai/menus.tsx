import ChatPicker from '@components/menu/ai/chatPicker'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Pressable, View } from 'react-native'

type AiText = {
    currentConversation: string
    newConversation: string
}

export function ModelMenu({
    ai,
    theme,
    onClose,
}: {
    ai: ReturnType<typeof import('@components/ai/chat').default>
    theme: Theme
    onClose: () => void
}) {
    return (
        <Overlay top={8} zIndex={21}>
            {ai.clients.map((client) => {
                const isActive = ai.session?.clientName === client.name

                return (
                    <Pressable
                        key={client.name}
                        onPress={() => {
                            onClose()
                            ai.changeModel(client.name)
                        }}
                        style={{
                            borderRadius: 16,
                            backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.045)',
                            borderColor: isActive ? theme.greyTransparentBorder : 'rgba(255,255,255,0.08)',
                            borderWidth: 1,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                        }}
                    >
                        <Text style={{ ...T.text15, color: isActive ? theme.orange : theme.textColor, fontWeight: isActive ? '700' : '500' }}>
                            {client.name}
                        </Text>
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                            {`${Math.round(client.model.tps || 0)} tps`}
                        </Text>
                    </Pressable>
                )
            })}
        </Overlay>
    )
}

export function ChatMenu({
    ai,
    theme,
    text,
    onClose,
}: {
    ai: ReturnType<typeof import('@components/ai/chat').default>
    theme: Theme
    text: AiText
    onClose: () => void
}) {
    return (
        <Overlay top={8} zIndex={20}>
            <ChatPicker
                conversations={ai.conversations}
                activeConversationId={ai.session?.conversationId}
                theme={theme}
                onCreate={() => {
                    onClose()
                    ai.createNewConversation()
                }}
                onSelect={(conversationId) => {
                    onClose()
                    ai.openConversation(conversationId)
                }}
                currentConversationLabel={text.currentConversation}
                newConversationLabel={text.newConversation}
            />
        </Overlay>
    )
}

function Overlay({ top, zIndex, children }: React.PropsWithChildren<{ top: number, zIndex: number }>) {
    return (
        <View style={{
            position: 'absolute',
            top,
            right: 12,
            left: 12,
            zIndex,
            borderRadius: 22,
            backgroundColor: '#121112ee',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            padding: 12,
            gap: 8,
        }}>
            {children}
        </View>
    )
}
