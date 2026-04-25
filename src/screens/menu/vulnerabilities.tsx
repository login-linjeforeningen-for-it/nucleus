import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import { getVulnerabilitiesOverview, triggerVulnerabilityScan } from "@utils/queenbeeApi"
import { JSX, useEffect, useMemo, useState } from "react"
import { RefreshControl, ScrollView, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"

export default function VulnerabilitiesScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<GetVulnerabilities | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [running, setRunning] = useState(false)
    const [error, setError] = useState("")

    const totalFindings = useMemo(() => data?.images.reduce((sum, image) => sum + image.totalVulnerabilities, 0) || 0, [data])

    async function load() {
        setRefreshing(true)
        try {
            setData(await getVulnerabilitiesOverview())
            setError("")
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load vulnerabilities")
        } finally {
            setRefreshing(false)
        }
    }

    async function runScan() {
        setRunning(true)
        try {
            await triggerVulnerabilityScan()
            await load()
        } catch (scanError) {
            setError(scanError instanceof Error ? scanError.message : "Failed to start scan")
        } finally {
            setRunning(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    useEffect(() => {
        if (!data?.scanStatus.isRunning) {
            return
        }

        const timer = setInterval(() => {
            void load()
        }, 3000)

        return () => clearInterval(timer)
    }, [data?.scanStatus.isRunning])

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
                            <Text style={{ ...T.text25, color: theme.textColor }}>Vulnerabilities</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                Review Docker Scout findings and start a new scan from the app.
                            </Text>
                        </View>
                    </Cluster>
                    <Space height={10} />
                    <TouchableOpacity onPress={() => void runScan()}>
                        <View style={{
                            borderRadius: 16,
                            backgroundColor: theme.orange,
                            padding: 14
                        }}>
                            <Text style={{ ...T.centered20, color: theme.darker }}>
                                {running || data?.scanStatus.isRunning ? "Scanning..." : "Run scan"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {!!error && (
                        <>
                            <Space height={10} />
                            <Cluster><View style={{ padding: 12 }}><Text style={{ ...T.text15, color: "#ff8b8b" }}>{error}</Text></View></Cluster>
                        </>
                    )}
                    {data && (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                                    <View style={{ flexBasis: "47%", flexGrow: 1 }}>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Images</Text>
                                        <Text style={{ ...T.text20, color: theme.textColor }}>{data.imageCount}</Text>
                                    </View>
                                    <View style={{ flexBasis: "47%", flexGrow: 1 }}>
                                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Findings</Text>
                                        <Text style={{ ...T.text20, color: theme.textColor }}>{totalFindings}</Text>
                                    </View>
                                </View>
                            </Cluster>
                            <Space height={10} />
                            {data.images.map(image => (
                                <View key={image.image}>
                                    <Cluster>
                                        <View style={{ padding: 12 }}>
                                            <Text style={{ ...T.text15, color: theme.textColor }}>{image.image}</Text>
                                            <Space height={6} />
                                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                {image.totalVulnerabilities} findings · Critical {image.severity.critical} · High {image.severity.high}
                                            </Text>
                                            {!!image.scanError && (
                                                <>
                                                    <Space height={6} />
                                                    <Text style={{ ...T.text12, color: "#ff8b8b" }}>{image.scanError}</Text>
                                                </>
                                            )}
                                        </View>
                                    </Cluster>
                                    <Space height={10} />
                                </View>
                            ))}
                        </>
                    )}
                </ScrollView>
            </View>
        </Swipe>
    )
}
