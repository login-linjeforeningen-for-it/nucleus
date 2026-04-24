import Cluster from '@components/shared/cluster'
import Space from '@components/shared/utils'
import T from '@styles/text'
import { Image, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function SongList({ title, items }: { title: string, items: { name: string, artist: string, image: string, listens: number }[] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster>
            <View style={{ padding: 12 }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                <Space height={8} />
                {items.slice(0, 5).map((item, index) => (
                    <View key={`${title}-${item.name}-${index}`} style={{ flexDirection: "row", gap: 10, marginBottom: 10, alignItems: "center" }}>
                        <Image
                            source={{ uri: item.image }}
                            style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "#222" }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...T.text15, color: theme.textColor }}>{item.name}</Text>
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{item.artist}</Text>
                        </View>
                        <Text style={{ ...T.text15, color: theme.textColor }}>{item.listens}</Text>
                    </View>
                ))}
            </View>
        </Cluster>
    )
}
