import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import SongList from '@components/music/songList'
import Swipe from "@components/nav/swipe"
import Text from "@components/shared/text"
import GS from "@styles/globalStyles"
import T from "@styles/text"
import { MenuProps } from "@type/screenTypes"
import { getSafeMusicActivity, type NativeMusicActivity } from "@utils/discoveryApi"
import { JSX, useEffect, useState } from "react"
import { Dimensions, RefreshControl, ScrollView, View } from "react-native"
import { useSelector } from "react-redux"

export default function MusicScreen(_: MenuProps<"MusicScreen">): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const screenTitle = lang ? require("@text/no.json").screens.MusicScreen : require("@text/en.json").screens.MusicScreen
    const text = lang ? require("@text/no.json").music : require("@text/en.json").music
    const [data, setData] = useState<NativeMusicActivity | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")

    async function load() {
        setRefreshing(true)
        try {
            setData(await getSafeMusicActivity())
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
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get("window").height / 8} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>{screenTitle}</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {text.intro}
                            </Text>
                        </View>
                    </Cluster>
                    {error ? (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text15, color: "#ff8b8b" }}>{error}</Text>
                                </View>
                            </Cluster>
                        </>
                    ) : null}
                    {data ? (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                                    <StatCard label={text.stats.totalMinutes} value={formatNumber(data.stats.total_minutes)} />
                                    <StatCard label={text.stats.thisYear} value={formatNumber(data.stats.total_minutes_this_year)} />
                                    <StatCard label={text.stats.songsPlayed} value={formatNumber(data.stats.total_songs)} />
                                    <StatCard label={text.stats.averageLength} value={`${Math.round(data.stats.avg_seconds / 60)} ${text.stats.minutesShort}`} />
                                </View>
                            </Cluster>
                            <Space height={10} />
                            <SongList title={text.sections.playingNow} items={data.currentlyListening} metricLabel="listeners" />
                            <Space height={10} />
                            <SongList title={text.sections.topToday} items={data.topFiveToday} metricLabel="plays" />
                            <Space height={10} />
                            <SongList title={text.sections.topThisWeek} items={data.topFiveThisWeek} metricLabel="plays" />
                            <Space height={10} />
                            <SongList title={text.sections.topThisMonth} items={data.topFiveThisMonth} metricLabel="plays" />
                        </>
                    ) : null}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("nb-NO").format(Math.round(value))
}

function StatCard({
    label,
    value,
}: {
    label: string
    value: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            flexBasis: "47%",
            flexGrow: 1,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#ffffff12",
            backgroundColor: "#ffffff08",
            padding: 12,
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={4} />
            <Text style={{ ...T.text20, color: theme.textColor }}>{value}</Text>
        </View>
    )
}
