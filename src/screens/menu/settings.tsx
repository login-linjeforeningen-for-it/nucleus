import { Text, View, Dimensions, Platform } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import Notification from "@/components/settings/notification"
import ThemeSwitch from "@/components/settings/themeSwitch"
import Reminders from "@/components/settings/reminders"
import Language from "@/components/settings/language"
import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import GS from "@styles/globalStyles"
import { useSelector } from "react-redux"
import en from "@text/menu/settings/en.json"
import no from "@text/menu/settings/no.json"
import T from "@styles/text"
import Swipe from "@components/nav/swipe"
import { JSX } from 'react'

type ClusterWithSwitchProps = {
    obj: infoProps
    category: string
}

type infoProps = {
    title: string
    description?: string
}

export default function SettingScreen(): JSX.Element {

    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Swipe left="MenuScreen">
            <View>
                <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                    <Content />
                </View>
            </View>
        </Swipe>
    )
}

function SectionHeader({ title }: { title: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ marginBottom: 8 }}>
            <Text style={{
                ...T.text18,
                color: theme.orange,
                letterSpacing: 0.3,
            }}>
                {title}
            </Text>
        </View>
    )
}

function SettingRow({
    title,
    description,
    control,
}: {
    title: string
    description?: string
    control: JSX.Element
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster marginHorizontal={0}>
            <View style={{
                ...GS.notificationBack,
                paddingVertical: 4,
            }}>
                <View style={{
                    width: 3,
                    alignSelf: "stretch",
                    borderRadius: 99,
                    backgroundColor: theme.orange,
                    marginRight: 10,
                    opacity: 0.75,
                }} />
                <View style={{
                    flex: 1,
                    minWidth: 0,
                }}>
                    <Text style={{
                        ...T.text18,
                        color: theme.textColor
                    }}>
                        {title}
                    </Text>
                    {description ? (
                        <Text style={{
                            ...T.text12,
                            color: theme.oppositeTextColor,
                            lineHeight: 17,
                            marginTop: 2,
                        }}>
                            {description}
                        </Text>
                    ) : null}
                </View>
                <View style={{
                    ...GS.view2,
                    minWidth: 52,
                    marginLeft: 12,
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    {control}
                </View>
            </View>
        </Cluster>
    )
}

function Content(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const info = lang ? no.info : en.info
    const height = Dimensions.get("window").height
    const extraHeight = Platform.OS === 'ios' ? 0 : height > 800 && height < 900 ? 20 : 10

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <Space height={Dimensions.get("window").height / 8.1 + extraHeight} />
            <SettingRow
                title={info[0].title}
                description={info[0].description}
                control={<ThemeSwitch />}
            />

            <SettingRow
                title={info[1].title}
                description={info[1].description}
                control={<Language />}
            />

            <Space height={12} />
            <SectionHeader title={info[2].title} />
            <SwitchCluster obj={info[3]} category="IMPORTANT" />
            <Space height={12} />
            <SectionHeader title={info[4].title} />
            <SwitchCluster obj={info[5]} category="BEDPRES" />
            <SwitchCluster obj={info[6]} category="TEKKOM" />
            <SwitchCluster obj={info[7]} category="CTF" />
            <SwitchCluster obj={info[8]} category="SOCIAL" />
            <SwitchCluster obj={info[9]} category="KARRIEREDAG" />
            <SwitchCluster obj={info[10]} category="FADDERUKA" />
            <SwitchCluster obj={info[11]} category="LOGIN" />
            <SwitchCluster obj={info[12]} category="ANNET" />

            <Space height={12} />
            <SectionHeader title={info[13].title} />
            <Reminders />
            <Space height={Dimensions.get("window").height / (Platform.OS === 'ios' ? 6 : 7)} />
        </ScrollView>
    )
}

function SwitchCluster({ obj, category }: ClusterWithSwitchProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ marginBottom: 8 }}>
            <Cluster marginHorizontal={0}>
                <View style={{
                    ...GS.notificationBack,
                    paddingVertical: 4,
                }}>
                    <View style={{
                        width: 3,
                        alignSelf: "stretch",
                        borderRadius: 99,
                        backgroundColor: theme.orange,
                        marginRight: 10,
                        opacity: 0.45,
                    }} />
                    <View style={{
                        flex: 1,
                        minWidth: 0,
                    }}>
                        <Text style={{
                            ...T.text16,
                            color: theme.textColor
                        }}>
                            {obj.title}
                        </Text>
                        <Text style={{
                            ...T.text12,
                            color: theme.oppositeTextColor,
                            lineHeight: 17,
                            marginTop: 2,
                        }}>
                            {obj.description}
                        </Text>
                    </View>
                    <View style={{
                        ...GS.view2,
                        minWidth: 52,
                        marginLeft: 12,
                        alignSelf: "center",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Notification category={category} />
                    </View>
                </View>
            </Cluster>
        </View>
    )
}
