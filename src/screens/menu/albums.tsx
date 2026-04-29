import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { AlbumCard } from '@/components/menu/albums/albumCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getAlbumPreviewImages, getCachedAlbumPreviewCounts, stageAlbumListImages } from '@/utils/albums/imagePrefetch'
import { fetchAlbums } from '@utils/fetch'
import { JSX, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, FlatList, RefreshControl, View, ViewToken } from 'react-native'
import { useSelector } from 'react-redux'

export default function AlbumsScreen({ navigation }: MenuProps<'AlbumsScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').albums : require('@text/en.json').albums
    const [albums, setAlbums] = useState<GetAlbumProps[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [visibleAlbumIds, setVisibleAlbumIds] = useState<number[]>([])
    const [previewCounts, setPreviewCounts] = useState<Record<number, number>>({})
    const visibleAlbumIdSet = useMemo(() => new Set(visibleAlbumIds), [visibleAlbumIds])

    async function load() {
        setRefreshing(true)
        try {
            const nextAlbums = await fetchAlbums()
            setAlbums(nextAlbums.albums)
            setPreviewCounts(getCachedAlbumPreviewCounts(nextAlbums.albums))
            setTotalCount(nextAlbums.total_count)
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : text.failedToLoad)
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        load()
    }, [])
    useEffect(() => {
        if (!albums.length) {
            return
        }

        let cancelled = false
        function setPreviewCount(albumIds: number[], count: number) {
            if (cancelled || !albumIds.length) {
                return
            }

            setPreviewCounts((current) => {
                const next = { ...current }
                albumIds.forEach((id) => {
                    next[id] = Math.max(next[id] || 0, count)
                })
                return next
            })
        }

        stageAlbumListImages({
            albums,
            visibleAlbumIds: visibleAlbumIdSet,
            onPreviewCount: setPreviewCount,
        })

        return () => {
            cancelled = true
        }
    }, [albums, visibleAlbumIdSet])
    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 18 }).current
    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<GetAlbumProps>[] }) => {
        setVisibleAlbumIds(viewableItems
            .map((item) => item.item?.id)
            .filter((id): id is number => typeof id === 'number'))
    }).current

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <FlatList
                    data={albums}
                    keyExtractor={(album) => String(album.id)}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => load()}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={4}
                    maxToRenderPerBatch={4}
                    removeClippedSubviews
                    windowSize={5}
                    viewabilityConfig={viewabilityConfig}
                    onViewableItemsChanged={onViewableItemsChanged}
                    ListHeaderComponent={(
                        <>
                            <Space height={Dimensions.get('window').height / 8} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
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
                        </>
                    )}
                    renderItem={({ item: album }) => (
                        <AlbumCard
                            album={album}
                            imageLabel={album.image_count === 1 ? text.image : text.images}
                            previewImageCount={Math.min(
                                previewCounts[album.id] ?? 0,
                                getAlbumPreviewImages(album, 3).length
                            )}
                            onPress={() => navigation.navigate('SpecificAlbumScreen', { albumID: album.id })}
                        />
                    )}
                    ListEmptyComponent={(
                        <Cluster>
                            <View style={{ padding: 12 }}>
                                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                    {refreshing ? '' : text.empty}
                                </Text>
                            </View>
                        </Cluster>
                    )}
                    ListFooterComponent={totalCount > albums.length ? (
                        <View>
                            <Space height={6} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor, textAlign: 'center' }}>
                                {`${albums.length} / ${totalCount}`}
                            </Text>
                        </View>
                    ) : null}
                />
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}
