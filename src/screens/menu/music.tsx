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
import { Dimensions, Image, RefreshControl, ScrollView, View } from "react-native"
import { useSelector } from "react-redux"

export default function MusicScreen(_: MenuProps<"MusicScreen">): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<NativeMusicActivity | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")

    async function load() {
        setRefreshing(true)
        try {
            setData(await getSafeMusicActivity())
            setError("")
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load music")
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
                <Space height={Dimensions.get("window").height / 8} />
                <Cluster>
                    <View style={{ padding: 12 }}>
                        <Text style={{ ...T.text25, color: theme.textColor }}>Music</Text>
                        <Space height={6} />
                    </View>
                </Cluster>
                {error ? (
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text15, color: "#ff8b8b" }}>{error}</Text>
                        </View>
                    </Cluster>
                ) : null}
                {data ? (
                    <>
                        <Cluster>
                            <View style={{ padding: 12, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                    Total minutes {Math.round(data.stats.total_minutes)}
                                </Text>
                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                    This year {Math.round(data.stats.total_minutes_this_year)}
                                </Text>
                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                    Songs {data.stats.total_songs}
                                </Text>
                            </View>
                        </Cluster>
                        <Space height={10} />
                        <SongList title="Playing now" items={data.currentlyListening.map((item) => ({
                            name: item.name,
                            artist: item.artist,
                            image: item.image,
                            listens: 1,
                        }))} />
                        <Space height={10} />
                        <SongList title="Top today" items={data.topFiveToday} />
                        <Space height={10} />
                        <SongList title="Top this week" items={data.topFiveThisWeek} />
                        <Space height={10} />
                        <SongList title="Top this month" items={data.topFiveThisMonth} />
                    </>
                ) : null}
            </ScrollView>
        </Swipe>
    )
}
