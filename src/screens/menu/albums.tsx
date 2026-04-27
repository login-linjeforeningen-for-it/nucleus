import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { AlbumCard } from '@/components/menu/albums/albumCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { fetchAlbums } from '@utils/fetch'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function AlbumsScreen({ navigation }: MenuProps<'AlbumsScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
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
        load()
    }, [])

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
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
                >
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
