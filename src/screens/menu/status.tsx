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
    const [services, setServices] = useState<NativeMonitoringService[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")

    async function load() {
        setRefreshing(true)
        try {
            setServices(await getPublicStatus())
            setError("")
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load status")
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    return (
        <Swipe left="MenuScreen">
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
                style={{ ...GS.content, backgroundColor: theme.darker }}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 80 }}
            >
                <Space height={90} />
                <Cluster>
                    <View style={{ padding: 12 }}>
                        <Text style={{ ...T.text25, color: theme.textColor }}>Status</Text>
                        <Space height={6} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            Mobile-native view of Beehive service health.
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
                                <View style={{ padding: 12, gap: 8 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <View style={{ flex: 1, paddingRight: 12 }}>
                                            <Text style={{ ...T.text20, color: theme.textColor }}>
                                                {service.name}
                                            </Text>
                                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                                {service.url || "No URL"}
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: healthy ? "#113c1b" : "#4a1616",
                                            borderRadius: 999,
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                        }}>
                                            <Text style={{ ...T.text15, color: "#fff" }}>
                                                {healthy ? "Healthy" : "Issue"}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                                        <Text style={{ ...T.text15, color: theme.textColor }}>
                                            Uptime {service.uptime}%
                                        </Text>
                                        <Text style={{ ...T.text15, color: theme.textColor }}>
                                            {latest ? `${Math.round(latest.delay)} ms` : "No delay"}
                                        </Text>
                                    </View>
                                </View>
                            </Cluster>
                            <Space height={10} />
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </Swipe>
    )
}
