import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { fetchAlbums } from '@utils/fetch'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, Image, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function AlbumsScreen({ navigation }: MenuProps<'AlbumsScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const screenTitle = lang ? require('@text/no.json').screens.AlbumsScreen : require('@text/en.json').screens.AlbumsScreen
    const text = lang ? require('@text/no.json').albums : require('@text/en.json').albums
    const [albums, setAlbums] = useState<GetAlbumProps[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')

    async function load() {
        setRefreshing(true)
        try {
            const nextAlbums = await fetchAlbums()
            setAlbums(nextAlbums.albums)
            setTotalCount(nextAlbums.total_count)
            setError('')
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
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => void load()}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>{screenTitle}</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {text.intro}
                            </Text>
                            <Space height={8} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                {text.privacyNotice}
                            </Text>
                        </View>
                    </Cluster>

                    {error ? (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text15, color: '#ff8b8b' }}>{error}</Text>
                                </View>
                            </Cluster>
                        </>
                    ) : null}

                    <Space height={10} />
                    {albums.length ? albums.map((album) => (
                        <AlbumCard
                            key={album.id}
                            album={album}
                            imageLabel={album.image_count === 1 ? text.image : text.images}
                            onPress={() => navigation.navigate('SpecificAlbumScreen', { albumID: album.id })}
                        />
                    )) : (
                        <Cluster>
                            <View style={{ padding: 12 }}>
                                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                    {refreshing ? '' : text.empty}
                                </Text>
                            </View>
                        </Cluster>
                    )}

                    {totalCount > albums.length ? (
                        <>
                            <Space height={6} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor, textAlign: 'center' }}>
                                {`${albums.length} / ${totalCount}`}
                            </Text>
                        </>
                    ) : null}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function AlbumCard({
    album,
    imageLabel,
    onPress,
}: {
    album: GetAlbumProps
    imageLabel: string
    onPress: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const title = lang ? album.name_no : album.name_en
    const description = lang ? album.description_no : album.description_en
    const images = Array.isArray(album.images) ? album.images.slice(0, 3) : []

    return (
        <>
            <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
                <Cluster style={{ paddingHorizontal: 0 }}>
                    <View style={{ padding: 12 }}>
                        <View style={{ height: 170, marginBottom: 12 }}>
                            <AlbumImageStack albumID={album.id} images={images} title={title} />
                        </View>
                        <Text style={{ ...T.text20, color: theme.textColor }}>
                            {title}
                        </Text>
                        <Space height={5} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }} numberOfLines={2}>
                            {description}
                        </Text>
                        <Space height={10} />
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <Pill label={String(album.year)} />
                            <Pill label={`${album.image_count || images.length} ${imageLabel}`} />
                        </View>
                    </View>
                </Cluster>
            </TouchableOpacity>
            <Space height={10} />
        </>
    )
}

function AlbumImageStack({
    albumID,
    images,
    title,
}: {
    albumID: number
    images: string[]
    title: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    if (!images.length) {
        return (
            <View style={{
                flex: 1,
                borderRadius: 18,
                backgroundColor: theme.contrast,
                borderWidth: 1,
                borderColor: '#ffffff14',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Text style={{ ...T.text20, color: theme.orange }}>LOGIN</Text>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {images.map((image, index) => (
                <Image
                    key={image}
                    source={{ uri: `${config.cdn}/albums/${albumID}/${image}`, cache: 'force-cache' }}
                    accessibilityLabel={title}
                    style={{
                        position: 'absolute',
                        left: index === 0 ? 12 : index === 1 ? 0 : 24,
                        right: index === 0 ? 12 : index === 1 ? 26 : 0,
                        top: index === 0 ? 0 : index === 1 ? 12 : 20,
                        bottom: index === 0 ? 0 : index === 1 ? 8 : 16,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: '#ffffff24',
                        transform: [{ rotate: index === 1 ? '-3deg' : index === 2 ? '3deg' : '0deg' }],
                        zIndex: 10 - index,
                    }}
                />
            ))}
        </View>
    )
}

function Pill({ label }: { label: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.orangeTransparentBorder,
            backgroundColor: theme.orangeTransparent,
            paddingHorizontal: 10,
            paddingVertical: 5,
        }}>
            <Text style={{ ...T.text12, color: theme.textColor }}>{label}</Text>
        </View>
    )
}
