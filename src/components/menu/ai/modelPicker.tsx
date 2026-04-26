import Text from '@components/shared/text'
import T from '@styles/text'
import { JSX } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'

type Props = {
    clients: NativeClient[]
    activeClientName?: string | null
    theme: Theme
    formatSubtitle: (client: NativeClient) => string
    onSelect: (clientName: string) => void
}

export default function AiModelPicker({
    clients,
    activeClientName,
    theme,
    formatSubtitle,
    onSelect
}: Props): JSX.Element {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                {clients.map(client => {
                    const isActive = activeClientName === client.name

                    return (
                        <TouchableOpacity key={client.name} onPress={() => onSelect(client.name)}>
                            <View style={{
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: isActive ? theme.orangeTransparentBorderHighlighted : theme.orangeTransparentBorder,
                                backgroundColor: isActive ? theme.orangeTransparentHighlighted : theme.orangeTransparent,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                minWidth: 140
                            }}>
                                <Text style={{ ...T.text15, color: theme.textColor }}>{client.name}</Text>
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                    {formatSubtitle(client)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </ScrollView>
    )
}
