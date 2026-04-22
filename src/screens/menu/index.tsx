import { nativeApplicationVersion } from "expo-application"
import Feedback from "@/components/menu/feedback"
import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import CS from "@styles/clusterStyles"
import GS from "@styles/globalStyles"
import { useDispatch, useSelector } from "react-redux"
import { JSX, useEffect, useState } from "react"
import en from "@text/menu/en.json"
import no from "@text/menu/no.json"
import T from "@styles/text"
import LogoNavigation from "@/components/shared/logoNavigation"
import Text from "@components/shared/text"
import { View, Image, TouchableOpacity, Dimensions, Platform } from "react-native"
import { ItemProps, MenuProps, MenuStackParamList } from "@type/screenTypes"
import { NavigationProp } from "@react-navigation/native"
import NotificationIcon from "@components/notification/notificationIcon"
import Swipe from "@components/nav/swipe"
import { fetchAds, fetchEvents } from "@utils/fetch"
import { setAds, setLastFetch as setAdLastFetch } from "@redux/ad"
import { setEvents, setLastFetch as setEventLastFetch } from "@redux/event"
import LastFetch from "@utils/fetch"

type MenuItemProps = {
    index: number
    item: ItemProps
    navigation: NavigationProp<MenuStackParamList, 'MenuScreen'>
    setting: SettingProps[]
    feedback: boolean
    toggleFeedback: () => void
    login: boolean
}


export default function MenuScreen({ navigation }: MenuProps<'MenuScreen'>): JSX.Element {

    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { login } = useSelector((state: ReduxState) => state.login)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const events = useSelector((state: ReduxState) => state.event.events)
    const ads = useSelector((state: ReduxState) => state.ad.ads)
    const { id, name, image } = useSelector((state: ReduxState) =>
        state.profile)
    const profile = { id, name, image }
    const text: Setting = lang ? no as Setting : en as Setting
    const height = Dimensions.get("window").height
    const dispatch = useDispatch()

    // Feedback options visibility boolean
    const [feedback, setFeedback] = useState(false)

    // --- UPDATES FEEDBACK STATE ---
    function toggleFeedback() {
        setFeedback(prevFeedback => !prevFeedback)
    }

    useEffect(() => {
        navigation.setOptions({
            headerComponents: {
                left: [<LogoNavigation />],
            }
        } as any)
    }, [navigation])

    useEffect(() => {
        if (events.length && ads.length) {
            return
        }

        void (async () => {
            const [nextEvents, nextAds] = await Promise.all([fetchEvents(), fetchAds()])

            if (nextEvents.length) {
                dispatch(setEvents(nextEvents))
                dispatch(setEventLastFetch(LastFetch()))
            }

            if (nextAds.length) {
                dispatch(setAds(nextAds))
                dispatch(setAdLastFetch(LastFetch()))
            }
        })()
    }, [ads.length, dispatch, events.length])

    return (
        <Swipe left="AdNav">
            <View style={{
                ...GS.content,
                backgroundColor: theme.darker
            }}>
                <Space height={height / (Platform.OS === 'ios' ? 8 : height > 800 && height < 900 ? 6.5 : 8)} />
                <TouchableOpacity onPress={() => navigation.navigate(login ? "LoginScreen" : "LoginScreen")}>
                    <Cluster>
                        <View>
                            <Text style={{ ...T.text20, color: theme.textColor }}>
                                {login ? "Connected" : "Connect Login"}
                            </Text>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {login ? "AI and Queenbee unlocked" : "Sign in for AI and Queenbee"}
                            </Text>
                        </View>
                    </Cluster>
                </TouchableOpacity>
                <Space height={10} />
                {/* <SmallProfile navigation={navigation} profile={profile} login={login} /> */}
                {text.setting.map((item, index) => {
                    if (item.nav === "ProfileScreen") {
                        return null
                    }

                    return (
                        <MenuItem
                            index={index}
                            item={item}
                            navigation={navigation}
                            setting={text.setting}
                            feedback={feedback}
                            toggleFeedback={toggleFeedback}
                            login={login}
                            key={index}
                        />
                    )
                })}
                <Space height={height / 10} />
            </View>
        </Swipe>
    )
}

function MenuItem({ index, item, navigation, setting, feedback, toggleFeedback }: MenuItemProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const info = lang ? no : en
    const version = `${info.version}${nativeApplicationVersion}`

    return (
        <View>
            <TouchableOpacity onPress={() => navigation.navigate(item.nav as any)}>
                <Cluster>
                    <View style={{ ...CS.clusterBack }}>
                        <View style={CS.twinLeft}>
                            {item.nav === "NotificationScreen" && <NotificationIcon position="left" />}
                            <Text style={{ ...T.text20, color: theme.textColor }}>
                                {item.title}
                            </Text>
                        </View>
                        <View style={CS.twinRight}>
                            <Image
                                style={CS.arrowImage}
                                source={require("@assets/icons/dropdownBase.png")}
                            />
                        </View>
                    </View>
                </Cluster>
            </TouchableOpacity>
            <View>
                <Space height={10} />
                <Feedback
                    index={index}
                    setting={setting}
                    feedback={feedback}
                    toggleFeedback={toggleFeedback}
                />
            </View>
            {index === setting.length - 1
                ? <TouchableOpacity onPress={() => navigation.navigate('InternalScreen')}>
                    <Text style={{ ...T.contact, color: theme.oppositeTextColor }}>
                        {version}
                    </Text>
                </TouchableOpacity>
                : null}
        </View>
    )
}
