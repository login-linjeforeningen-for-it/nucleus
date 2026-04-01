import TopicSwitchList from "@/components/settings/topicSwitch"
import { TouchableOpacity, Image, View, Text } from "react-native"
import GS from "@styles/globalStyles"
import { useSelector } from "react-redux"
import { useState } from "react"
import T from "@styles/text"

/**
 * Creates a full dropdownmenu for reminders
 * @returns Dropdown view
 */
export default function Reminders() {

    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [category, setCategory] = useState(-1)

    const categories = [
        { id: 1, source: "tekkom", title: "TekKom" },
        { id: 2, source: "ctf", title: "CTF" },
        { id: 3, source: "social", title: lang ? "Sosialt" : "Social" },
        { id: 4, source: "karrieredag", title: lang ? "Karrieredag" : "Career day" },
        { id: 5, source: "fadderuka", title: "Fadderuka" },
        { id: 6, source: "bedpres", title: "Bedpres" },
        { id: 7, source: "login", title: "Login" },
        { id: 8, source: "annet", title: lang ? "Annet" : "Other" }
    ]

    return (
        <View>
            {categories.map((cat, index) => (
                <View key={index}>
                    <TouchableOpacity
                        key={index}
                        onPress={() => setCategory(category === index ? -1 : index)}
                    >
                        <View style={{
                            ...GS.reminderDropdown,
                            backgroundColor: theme.darker
                        }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>
                                {cat.title}
                            </Text>
                            <Image
                                style={GS.reminderDropdownArrow}
                                source={index === category
                                    ? require("@assets/icons/reminderDropdownOrange.png")
                                    : require("@assets/icons/dropdownBase.png")}
                            />
                        </View>
                    </TouchableOpacity>
                    {category === index &&
                        <TopicSwitchList
                            category={cat.source}
                            showLast={index > 1 ? true : false}
                        />
                    }
                </View>
            ))}
        </View>
    )
}
