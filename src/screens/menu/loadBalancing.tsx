import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import { getLoadBalancingSites, setPrimaryLoadBalancingSite, type NativeLoadBalancingSite } from "@utils/queenbeeApi"
import { JSX, useEffect, useMemo, useState } from "react"
import { RefreshControl, ScrollView, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"

export default function LoadBalancingScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [sites, setSites] = useState<NativeLoadBalancingSite[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")
    const [switchingId, setSwitchingId] = useState<number | null>(null)

    const summary = useMemo(() => {
        const primary = sites.find(site => site.primary) || null
        const healthy = sites.filter(site => site.operational && !site.maintenance).length
        return { primary, healthy }
    }, [sites])

    async function load() {
        setRefreshing(true)
        try {
            setSites(await getLoadBalancingSites())
            setError("")
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load load balancing")
        } finally {
            setRefreshing(false)
        }
    }

    async function makePrimary(id: number) {
        setSwitchingId(id)
        try {
            await setPrimaryLoadBalancingSite(id)
            await load()
        } catch (switchError) {
            setError(switchError instanceof Error ? switchError.message : "Failed to switch primary")
        } finally {
            setSwitchingId(null)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    return (
        <Swipe left="QueenbeeScreen">
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>Load balancing</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                Review active targets and switch the primary site directly from the app.
                            </Text>
                        </View>
                    </Cluster>
                    <Space height={10} />
                    <Cluster>
                        <View style={{ padding: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                            <View style={{ flexBasis: "47%", flexGrow: 1 }}>
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Primary site</Text>
                                <Space height={4} />
                                <Text style={{ ...T.text20, color: theme.textColor }}>{summary.primary?.name || "Unset"}</Text>
                            </View>
                            <View style={{ flexBasis: "47%", flexGrow: 1 }}>
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Healthy targets</Text>
                                <Space height={4} />
                                <Text style={{ ...T.text20, color: theme.textColor }}>{summary.healthy}/{sites.length}</Text>
                            </View>
                        </View>
                    </Cluster>
                    {!!error && (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text15, color: "#ff8b8b" }}>{error}</Text>
                                </View>
                            </Cluster>
                        </>
                    )}
                    <Space height={10} />
                    {sites.map(site => (
                        <View key={site.id}>
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text20, color: theme.textColor }}>{site.name}</Text>
                                    <Space height={4} />
                                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{site.ip}</Text>
                                    <Space height={8} />
                                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                        {site.primary ? "Primary" : "Secondary"} · {site.operational ? "Operational" : "Down"}{site.maintenance ? " · Maintenance" : ""}
                                    </Text>
                                    {!!site.note && (
                                        <>
                                            <Space height={6} />
                                            <Text style={{ ...T.text15, color: theme.textColor }}>{site.note}</Text>
                                        </>
                                    )}
                                    <Space height={10} />
                                    <TouchableOpacity disabled={site.primary || switchingId === site.id} onPress={() => void makePrimary(site.id)}>
                                        <View style={{
                                            borderRadius: 14,
                                            backgroundColor: site.primary ? "#ffffff10" : theme.orange,
                                            paddingHorizontal: 14,
                                            paddingVertical: 10
                                        }}>
                                            <Text style={{ ...T.centered15, color: site.primary ? theme.textColor : theme.darker }}>
                                                {site.primary ? "Serving traffic" : switchingId === site.id ? "Switching..." : "Make primary"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </Cluster>
                            <Space height={10} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        </Swipe>
    )
}
