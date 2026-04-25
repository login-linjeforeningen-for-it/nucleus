import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import { JSX } from "react"
import { Dimensions, ScrollView, TouchableOpacity, View } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { clearSession } from "@redux/loginStatus"
import { setID, setMail, setName } from "@redux/profile"
import { startLogin } from "@utils/auth"
import { MenuProps } from "@type/screenTypes"

export default function LoginScreen({ navigation }: MenuProps<"LoginScreen">): JSX.Element {
    const dispatch = useDispatch()
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login, groups } = useSelector((state: ReduxState) => state.login)
    const { name, mail } = useSelector((state: ReduxState) => state.profile)

    function handleLogout() {
        dispatch(clearSession())
        dispatch(setID(null))
        dispatch(setName(null))
        dispatch(setMail(null))
    }

    return (
        <Swipe left="MenuScreen">
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get("window").height / 8.1} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.centeredBold20, color: theme.textColor }}>
                                {login ? "Connected to Login" : "Connect your Login account"}
                            </Text>
                            <Space height={8} />
                            <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                                {login
                                    ? `${name || "Unknown user"} · ${mail || "No email"}`
                                    : "Sign in to unlock your profile, Queenbee tools, and internal workflows. Login AI is open for everyone."}
                            </Text>
                        </View>
                    </Cluster>
                    <Space height={20} />
                    <TouchableOpacity onPress={() => navigation.navigate("AiScreen")}>
                        <View style={{
                            borderRadius: 18,
                            borderWidth: 1,
                            borderColor: "#fd873844",
                            backgroundColor: "#fd873814",
                            padding: 14
                        }}>
                            <Text style={{ ...T.centered20, color: theme.textColor }}>
                                Open Login AI
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <Space height={12} />
                    {login && (
                        <>
                            <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
                                <View style={{
                                    borderRadius: 18,
                                    borderWidth: 1,
                                    borderColor: "#ffffff12",
                                    backgroundColor: theme.contrast,
                                    padding: 14
                                }}>
                                    <Text style={{ ...T.centered20, color: theme.textColor }}>
                                        Open profile
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <Space height={12} />
                        </>
                    )}
                    <TouchableOpacity onPress={() => login ? navigation.navigate("QueenbeeScreen") : startLogin("queenbee")}>
                        <View style={{
                            borderRadius: 18,
                            borderWidth: 1,
                            borderColor: "#ffffff12",
                            backgroundColor: theme.contrast,
                            padding: 14
                        }}>
                            <Text style={{ ...T.centered20, color: theme.textColor }}>
                                {login ? "Open Queenbee" : "Sign in for Queenbee"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {login && (
                        <>
                            <Space height={20} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                                        {groups.length ? `Groups: ${groups.join(", ")}` : "No groups reported"}
                                    </Text>
                                </View>
                            </Cluster>
                            <Space height={12} />
                            <TouchableOpacity onPress={handleLogout}>
                                <View style={{
                                    borderRadius: 18,
                                    borderWidth: 1,
                                    borderColor: "#ffffff12",
                                    backgroundColor: theme.contrast,
                                    padding: 14
                                }}>
                                    <Text style={{ ...T.centered20, color: theme.textColor }}>
                                        Clear local session
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </View>
        </Swipe>
    )
}
