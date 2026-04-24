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
        <ScrollView>
            <Swipe left="MenuScreen">
                <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                    <Space height={Dimensions.get("window").height / 8.1} />
                    <Cluster>
                        <Text style={{ ...T.centeredBold20, color: theme.textColor }}>
                            {login ? "Connected to Login" : "Connect your Login account"}
                        </Text>
                    </Cluster>
                    <Space height={16} />
                    <Cluster>
                        <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                            {login
                                ? `${name || "Unknown user"} · ${mail || "No email"}`
                                : "Sign in to unlock Queenbee and internal tools. Login AI is available without signing in."}
                        </Text>
                    </Cluster>
                    <Space height={20} />
                    <TouchableOpacity onPress={() => navigation.navigate("AiScreen")}>
                        <Cluster>
                            <Text style={{ ...T.centered20, color: theme.textColor }}>
                                Open Login AI
                            </Text>
                        </Cluster>
                    </TouchableOpacity>
                    <Space height={12} />
                    <TouchableOpacity onPress={() => login ? navigation.navigate("AdminScreen") : startLogin("queenbee")}>
                        <Cluster>
                            <Text style={{ ...T.centered20, color: theme.textColor }}>
                                {login ? "Open admin tools" : "Sign in for admin tools"}
                            </Text>
                        </Cluster>
                    </TouchableOpacity>
                    {login && (
                        <>
                            <Space height={20} />
                            <Cluster>
                                <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                                    {groups.length ? `Groups: ${groups.join(", ")}` : "No groups reported"}
                                </Text>
                            </Cluster>
                            <Space height={12} />
                            <TouchableOpacity onPress={handleLogout}>
                                <Cluster>
                                    <Text style={{ ...T.centered20, color: theme.textColor }}>
                                        Clear local session
                                    </Text>
                                </Cluster>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Swipe>
        </ScrollView>
    )
}
