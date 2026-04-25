import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import { MenuProps } from "@type/screenTypes"
import { getPublicStatus, type NativeMonitoringService } from "@utils/discoveryApi"
import { JSX, useEffect, useState } from "react"
import { RefreshControl, ScrollView, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"

export default function StatusScreen(_: MenuProps<"StatusScreen">): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const screenTitle = lang ? require("@text/no.json").screens.StatusScreen : require("@text/en.json").screens.StatusScreen
    const text = lang ? require("@text/no.json").status : require("@text/en.json").status
    const [services, setServices] = useState<NativeMonitoringService[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")

    async function load() {
        setRefreshing(true)
        try {
            setServices(await getPublicStatus())
            setError("")
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : text.failedToLoad)
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    return (
        <Swipe left="MenuScreen">
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 80 }}
                >
                    <Space height={90} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>{screenTitle}</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {text.intro}
                            </Text>
                        </View>
                    </Cluster>
                    <Space height={12} />
                    {error ? (
                        <Cluster>
                            <View style={{ padding: 12 }}>
                                <Text style={{ ...T.text15, color: "#ff8b8b" }}>{error}</Text>
                            </View>
                        </Cluster>
                    ) : null}
                    {services.map((service) => {
                        const latest = service.bars?.[0]
                        const healthy = latest ? latest.status < 400 : false
                        return (
                            <TouchableOpacity key={service.id} onPress={() => void 0} activeOpacity={0.9}>
                                <Cluster>
                                    <View style={{ padding: 12, gap: 10 }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <View style={{ flex: 1, paddingRight: 12 }}>
                                                <Text style={{ ...T.text20, color: theme.textColor }}>
                                                    {service.name}
                                                </Text>
                                                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                                    {service.url || text.noUrl}
                                                </Text>
                                            </View>
                                            <View style={{
                                                backgroundColor: healthy ? "#113c1b" : "#4a1616",
                                                borderRadius: 999,
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                            }}>
                                                <Text style={{ ...T.text15, color: "#fff" }}>
                                                    {healthy ? text.healthy : text.issue}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                                            <MetricPill label={text.uptime} value={`${service.uptime}%`} />
                                            <MetricPill label={text.response} value={latest ? `${Math.round(latest.delay)} ${text.ms}` : text.noDelay} />
                                        </View>
                                    </View>
                                </Cluster>
                                <Space height={10} />
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function MetricPill({ label, value }: { label: string, value: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "#ffffff12",
            backgroundColor: "#ffffff08",
            paddingHorizontal: 10,
            paddingVertical: 7,
        }}>
            <View style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: theme.orange,
            }} />
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                {label}
            </Text>
            <Text style={{ ...T.text15, color: theme.textColor }}>
                {value}
            </Text>
        </View>
    )
}
