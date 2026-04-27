import Cluster from '@components/shared/cluster'
import Marquee from '@components/shared/marquee'
import Space from '@components/shared/utils'
import T from '@styles/text'
import { buildSpotifyUrl } from '@utils/discovery/discoveryApi'
import { Linking, Pressable, Image, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

type SongListProps = {
    title: string
    items: NativeMusicRow[]
    metricLabel: 'plays' | 'listeners'
}

export default function SongList({ title, items, metricLabel }: SongListProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').music : require('@text/en.json').music

    async function openItem(item: NativeMusicRow) {
        const url = buildSpotifyUrl(item)
        if (!url) {
            return
        }

        await Linking.openURL(url)
    }

    return (
        <Cluster>
            <View style={{ padding: 12 }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                <Space height={10} />
                {items.slice(0, 5).map((item, index) => {
                    const url = buildSpotifyUrl(item)
                    const Wrapper = url ? Pressable : View
                    const metric = formatMetricValue(item.listens, metricLabel, text.metrics)

                    return (
                        <Wrapper
                            key={`${title}-${item.name}-${index}`}
                            onPress={url ? () => openItem(item) : undefined}
                            style={{
                                flexDirection: 'row',
                                gap: 10,
                                marginBottom: index === 4 ? 0 : 12,
                                alignItems: 'center'
                            }}
                        >
                            <SongImage item={item} />
                            <View style={{ flex: 1, minWidth: 0 }}>
                                <Marquee
                                    containerStyle={{ marginBottom: 2 }}
                                    style={{ ...T.text15, color: theme.textColor }}
                                >
                                    {item.name}
                                </Marquee>
                                <Marquee
                                    style={{ ...T.text12, color: theme.oppositeTextColor }}
                                >
                                    {item.artist}
                                </Marquee>
                            </View>
                            <View style={{ alignItems: 'flex-end', minWidth: 62 }}>
                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                    {metric.value}
                                </Text>
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                    {metric.label}
                                </Text>
                            </View>
                        </Wrapper>
                    )
                })}
            </View>
        </Cluster>
    )
}

function formatMetricValue(
    listens: number,
    metricLabel: 'plays' | 'listeners',
    labels: {
        plays: string
        listener: string
        listeners: string
    }
) {
    if (metricLabel !== 'listeners') {
        return {
            value: listens,
            label: labels.plays,
        }
    }

    const listenerCount = Math.max(1, listens)

    return {
        value: listenerCount,
        label: listenerCount === 1 ? labels.listener : labels.listeners,
    }
}

function SongImage({ item }: { item: NativeMusicRow }) {
    if (!item.image) {
        return (
            <View style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: '#ffffff10',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Text style={{ ...T.text12, color: '#ffffff88' }}>♪</Text>
            </View>
        )
    }

    return (
        <Image
            source={{ uri: item.image, cache: 'force-cache' }}
            style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#222' }}
        />
    )
}
