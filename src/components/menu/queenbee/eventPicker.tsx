import Space from "@/components/shared/utils"
import Text from "@components/shared/text"
import T from "@styles/text"
import { JSX } from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"

type Props = {
    events: GetEventProps[]
    activeEventId?: number | null
    textColor: string
    mutedTextColor: string
    contrastColor: string
    accentColor: string
    accentTextColor: string
    loading: boolean
    onSelect: (eventId: number) => void
}

export default function EventPicker({
    events,
    activeEventId,
    textColor,
    mutedTextColor,
    contrastColor,
    accentColor,
    accentTextColor,
    loading,
    onSelect
}: Props): JSX.Element {
    return (
        <>
            <Text style={{ ...T.text20, color: textColor }}>Queenbee events</Text>
            <Space height={8} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    {events.map(event => {
                        const isActive = activeEventId === event.id

                        return (
                            <TouchableOpacity key={event.id} onPress={() => onSelect(event.id)}>
                                <View style={{
                                    borderRadius: 14,
                                    backgroundColor: isActive ? accentColor : contrastColor,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    width: 220
                                }}>
                                    <Text style={{ ...T.text15, color: isActive ? accentTextColor : textColor }}>
                                        {event.name_no}
                                    </Text>
                                    <Text style={{ ...T.text12, color: isActive ? accentTextColor : mutedTextColor }}>
                                        {event.time_start}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
            {!events.length && !loading
                ? (
                    <>
                        <Space height={8} />
                        <Text style={{ ...T.text15, color: mutedTextColor }}>
                            Event editing is available after the protected event feed has loaded for your Queenbee session.
                        </Text>
                    </>
                )
                : null}
        </>
    )
}
