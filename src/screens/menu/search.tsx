import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import { MenuProps } from "@type/screenTypes"
import { buildSearchAnimationLink } from "@utils/discoveryApi"
import Clipboard from "@react-native-clipboard/clipboard"
import { JSX, useMemo, useState } from "react"
import { Alert, Dimensions, Linking, TextInput, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"

type Engine = "brave" | "google" | "duckduckgo"

export default function SearchScreen(_: MenuProps<"SearchScreen">): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [query, setQuery] = useState("")
    const [engine, setEngine] = useState<Engine>("brave")

    const link = useMemo(() => {
        if (!query.trim()) {
            return ""
        }

        return buildSearchAnimationLink(query.trim(), engine)
    }, [engine, query])

    async function copyLink() {
        if (!link) {
            Alert.alert("Missing query", "Write something first.")
            return
        }

        Clipboard.setString(link)
        Alert.alert("Copied", "Search animation link copied to clipboard.")
    }

    async function openLink() {
        if (!link) {
            Alert.alert("Missing query", "Write something first.")
            return
        }

        await Linking.openURL(link)
    }

    return (
        <Swipe left="MenuScreen">
            <View style={{ ...GS.content, backgroundColor: theme.darker, paddingHorizontal: 12 }}>
                <Space height={Dimensions.get("window").height / 8} />
                <Cluster>
                    <View style={{ padding: 12 }}>
                        <Text style={{ ...T.text25, color: theme.textColor }}>
                            Search
                        </Text>
                        <Space height={8} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            Let me look that up for you.
                        </Text>
                    </View>
                </Cluster>
                <Space height={12} />
                <Cluster>
                    <View style={{ padding: 12, gap: 12 }}>
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search for anything..."
                            placeholderTextColor={theme.oppositeTextColor}
                            style={{
                                color: theme.textColor,
                                borderWidth: 1,
                                borderColor: "#ffffff22",
                                borderRadius: 14,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                fontSize: 16,
                            }}
                        />
                        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                            {(["brave", "google", "duckduckgo"] as Engine[]).map((value) => (
                                <TouchableOpacity key={value} onPress={() => setEngine(value)}>
                                    <Cluster style={{
                                        backgroundColor: value === engine ? "#fd873822" : undefined,
                                        borderWidth: value === engine ? 1 : 0,
                                        borderColor: "#fd8738",
                                    }}>
                                        <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                                            <Text style={{ ...T.text15, color: theme.textColor }}>
                                                {value}
                                            </Text>
                                        </View>
                                    </Cluster>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={{ gap: 8 }}>
                            <TouchableOpacity onPress={() => void copyLink()}>
                                <Cluster>
                                    <View style={{ padding: 12 }}>
                                        <Text style={{ ...T.centered20, color: theme.textColor }}>
                                            Copy link
                                        </Text>
                                    </View>
                                </Cluster>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => void openLink()}>
                                <Cluster>
                                    <View style={{ padding: 12 }}>
                                        <Text style={{ ...T.centered20, color: theme.textColor }}>
                                            Open animation
                                        </Text>
                                    </View>
                                </Cluster>
                            </TouchableOpacity>
                        </View>
                        {!!link && (
                            <View style={{
                                borderWidth: 1,
                                borderColor: "#ffffff18",
                                borderRadius: 14,
                                padding: 12,
                            }}>
                                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                    {link}
                                </Text>
                            </View>
                        )}
                    </View>
                </Cluster>
            </View>
        </Swipe>
    )
}
