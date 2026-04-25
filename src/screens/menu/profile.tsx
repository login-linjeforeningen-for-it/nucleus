import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import ProfileInfo from "@/components/profile/profileInfo"
import Profile from "@/components/profile/profile"
import { clearSession } from "@redux/loginStatus"
import { setID, setMail, setName } from "@redux/profile"
import { MenuProps } from "@type/screenTypes"
import { startLogin } from "@utils/auth"
import { JSX, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ScrollView } from "react-native-gesture-handler"
import Svg, { LinearGradient, Rect, Stop } from "react-native-svg"
import { Dimensions, TouchableOpacity, View } from "react-native"
import PS from "@styles/profileStyles"
import T from "@styles/text"

type ScrollProps = {
    nativeEvent: {
        contentOffset: {
            y: number
        }
    }
}

export default function ProfileScreen({ navigation }: MenuProps<"ProfileScreen">): JSX.Element {
    const { theme, value } = useSelector((state: ReduxState) => state.theme)
    const { login, groups } = useSelector((state: ReduxState) => state.login)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { ban, name, allergies, preferences, mail, schoolyear, degree, image }
        = useSelector((state: ReduxState) => state.profile)
    const dispatch = useDispatch()

    const profile = {
        allergies,
        ban,
        degree,
        id: null,
        image,
        joinedevents: null,
        mail,
        name: name || (lang ? "Profil" : "Profile"),
        preferences,
        schoolyear
    }

    const profileInfo = { degree, schoolyear, mail, preferences, allergies }
    const [scrollPosition, setScrollPosition] = useState(0)

    function handleScroll(event: ScrollProps) {
        setScrollPosition(-event.nativeEvent.contentOffset.y)
    }

    function handleLogout() {
        dispatch(clearSession())
        dispatch(setID(null))
        dispatch(setName(null))
        dispatch(setMail(null))
    }

    return (
        <Swipe left="MenuScreen">
            <View>
                <View style={{ ...PS.content, backgroundColor: theme.darker }}>
                    <View style={{
                        ...PS.profileView,
                        backgroundColor: theme.orange,
                        opacity: Math.max(0, Math.min(scrollPosition / 220, 0.14)),
                        transform: [{ translateY: Math.min(scrollPosition * 0.18, 18) }]
                    }} />
                    <ScrollView
                        scrollEventThrottle={100}
                        onScroll={handleScroll}
                        showsVerticalScrollIndicator={false}
                    >
                        <Svg style={{
                            ...PS.profileGradientBackground,
                            transform: [{ translateY: Math.min(scrollPosition * 0.12, 16) }]
                        }}>
                            <LinearGradient
                                id='gradient'
                                x1='0%'
                                y1='0%'
                                x2='0%'
                                y2={0.72}
                            >
                                <Stop offset='28%' stopColor={theme.orange} />
                                <Stop
                                    offset={value === 1 ? "96%" : "100%"}
                                    stopColor={theme.darker}
                                />
                            </LinearGradient>
                            <Rect
                                x='0'
                                y={value === 1 ? 65 : 0}
                                width='100%'
                                height='100%'
                                fill='url(#gradient)'
                            />
                        </Svg>
                        <Space height={Dimensions.get("window").height / 8} />
                        <Profile profile={profile} />
                        <Space height={40} />
                        {login && <ProfileInfo profile={profileInfo} />}
                        <Space height={20} />
                        <View style={{ paddingHorizontal: 12 }}>
                            <TouchableOpacity onPress={() => navigation.navigate("AiScreen")}>
                                <View style={{
                                    borderRadius: 18,
                                    borderWidth: 1,
                                    borderColor: "#fd873844",
                                    backgroundColor: "#fd873814",
                                    padding: 14
                                }}>
                                    <Text style={{ ...T.centered20, color: theme.textColor }}>
                                        {lang ? "Åpne Login AI" : "Open Login AI"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <Space height={12} />
                            <TouchableOpacity
                                onPress={() => login ? navigation.navigate("QueenbeeScreen") : startLogin("queenbee")}
                            >
                                <View style={{
                                    borderRadius: 18,
                                    borderWidth: 1,
                                    borderColor: "#ffffff12",
                                    backgroundColor: theme.contrast,
                                    padding: 14
                                }}>
                                    <Text style={{ ...T.centered20, color: theme.textColor }}>
                                        {login
                                            ? (lang ? "Åpne Queenbee" : "Open Queenbee")
                                            : (lang ? "Logg inn for Queenbee" : "Sign in for Queenbee")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {!login ? (
                            <>
                                <Space height={12} />
                                <View style={{ paddingHorizontal: 12 }}>
                                    <TouchableOpacity onPress={() => startLogin("queenbee")}>
                                        <View style={{
                                            borderRadius: 18,
                                            borderWidth: 1,
                                            borderColor: "#ffffff12",
                                            backgroundColor: theme.contrast,
                                            padding: 14
                                        }}>
                                            <Text style={{ ...T.centered20, color: theme.textColor }}>
                                                {lang ? "Logg inn" : "Sign in"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Space height={20} />
                                <Cluster>
                                    <View style={{ padding: 12 }}>
                                        <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                                            {groups.length
                                                ? `${lang ? "Grupper" : "Groups"}: ${groups.join(", ")}`
                                                : (lang ? "Ingen grupper rapportert" : "No groups reported")}
                                        </Text>
                                    </View>
                                </Cluster>
                                <Space height={12} />
                                <View style={{ paddingHorizontal: 12 }}>
                                    <TouchableOpacity onPress={handleLogout}>
                                        <View style={{
                                            borderRadius: 18,
                                            borderWidth: 1,
                                            borderColor: "#ffffff12",
                                            backgroundColor: theme.contrast,
                                            padding: 14
                                        }}>
                                            <Text style={{ ...T.centered20, color: theme.textColor }}>
                                                {lang ? "Tøm lokal økt" : "Clear local session"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                        <Space height={Dimensions.get("window").height / 3} />
                    </ScrollView>
                </View>
            </View>
        </Swipe>
    )
}
