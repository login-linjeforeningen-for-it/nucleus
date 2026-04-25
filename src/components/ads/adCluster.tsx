import BellIcon from "@components/shared/bellIcon"
import Cluster from "@components/shared/cluster"
import Marquee from "@components/shared/marquee"
import Space from "@/components/shared/utils"
import LastFetch from "@/utils/fetch"
import T from "@styles/text"
import { AdClusterImage, getAdClusterMeta } from "@components/ads/adContent"
import { setClickedAds, toggleSearch } from "@redux/ad"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { TouchableOpacity, Dimensions, Text, View } from "react-native"
import TopicManager from "@utils/notification/topicManager"
import { StackNavigationProp } from "@react-navigation/stack"
import { AdStackParamList } from "@type/screenTypes"
import { JSX } from "react"

type Ad = {
    ad: GetJobProps
    index: number
    embed?: boolean
}

export default function AdCluster({ ad, index }: Ad): JSX.Element {
    const { search, clickedAds } = useSelector((state: ReduxState) => state.ad)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const dispatch = useDispatch()
    const isSubscribed = clickedAds.some((entry) => entry.id === ad.id)
    const navigation = useNavigation<StackNavigationProp<AdStackParamList>>()
    const title = lang ? ad.title_no || ad.title_en : ad.title_en || ad.title_no
    const meta = getAdClusterMeta(ad, lang)
    const deadline = LastFetch(ad.time_expire)
    const metaLine = [meta, deadline].filter(Boolean).join(" · ")

    function isClicked() {
        return clickedAds.some((clickedAd) => ad.id === clickedAd.id)
    }

    function handleNotificationPress() {
        dispatch(setClickedAds(clickedAds.some((entry) => entry.id === ad.id)
            ? clickedAds.filter((entry) => entry.id !== ad.id)
            : [...clickedAds, ad]))
        TopicManager({ topic: `${lang ? "n" : "e"}a${ad.id}`, unsub: isClicked() })
    }

    function handleOpen() {
        if (search) {
            dispatch(toggleSearch())
        }

        navigation.navigate("SpecificAdScreen", { adID: ad.id })
    }

    return (
        <>
            <TouchableOpacity onPress={handleOpen} activeOpacity={0.9} style={{ marginBottom: 10 }}>
                <Cluster style={{ paddingHorizontal: 0 }}>
                    <View style={{
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                    }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "stretch",
                            gap: 12,
                        }}>
                            <View style={{
                                width: 74,
                                minHeight: 60,
                                borderRadius: 12,
                                backgroundColor: "#ffffff08",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}>
                                <AdClusterImage
                                    logoUrl={ad.organization?.logo}
                                    bannerUrl={ad.banner_image || undefined}
                                    compact
                                />
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                                {ad.highlight ? (
                                    <View style={{
                                        alignSelf: "flex-start",
                                        borderRadius: 999,
                                        backgroundColor: "rgba(253,135,56,0.14)",
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        marginBottom: 8,
                                    }}>
                                        <Text style={{ ...T.text12, color: theme.orange }}>
                                            {lang ? "Fremhevet" : "Featured"}
                                        </Text>
                                    </View>
                                ) : null}
                                <Marquee
                                    containerStyle={{ marginBottom: 4 }}
                                    style={{
                                        ...T.text15,
                                        color: theme.textColor,
                                        lineHeight: 20,
                                    }}
                                    numberOfLines={2}
                                >
                                    {title}
                                </Marquee>
                                {metaLine ? (
                                    <Text
                                        numberOfLines={1}
                                        style={{ ...T.text12, color: theme.oppositeTextColor }}
                                    >
                                        {metaLine}
                                    </Text>
                                ) : null}
                            </View>
                            <TouchableOpacity
                                onPress={handleNotificationPress}
                                style={{ alignSelf: "center" }}
                            >
                                <View style={{ padding: 2, justifyContent: "center", alignItems: "center" }}>
                                    <BellIcon orange={isSubscribed} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Cluster>
            </TouchableOpacity>
            <ListFooter index={index} />
        </>
    )
}

export function ListFooter({ index }: ListFooterProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { lastFetch, renderedAds } = useSelector((state: ReduxState) => state.ad)

    return (
        <>
            {index === renderedAds.length - 1 && <Text style={{
                ...T.contact,
                color: theme.oppositeTextColor
            }}>
                {lang ? "Oppdatert kl:" : "Updated:"} {lastFetch}.
            </Text>}
            {index === renderedAds.length - 1 &&
                <Space height={Dimensions.get("window").height / 7} />}
        </>
    )
}
