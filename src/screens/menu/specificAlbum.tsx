import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { AlbumDownloadSheet, AlbumImageGrid } from '@/components/menu/albums/albumCards'
import { AlbumDownloadButton, SpecificAlbumSummary } from '@/components/menu/albums/specificAlbumParts'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { fetchAlbumDetails } from '@utils/fetch'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function SpecificAlbumScreen({
    navigation,
    route,
}: MenuProps<'SpecificAlbumScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').albums : require('@text/en.json').albums
    const [album, setAlbum] = useState<GetAlbumProps | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [showDownloadSheet, setShowDownloadSheet] = useState(false)
    const [downloadingImages, setDownloadingImages] = useState(false)
    const [initialDownloadImage, setInitialDownloadImage] = useState<string | null>(null)

    async function load() {
        setRefreshing(true)
        try {
            const nextAlbum = await fetchAlbumDetails(route.params.albumID)
            if (!nextAlbum) {
                throw new Error(text.failedToLoadAlbum)
            }
            setAlbum(nextAlbum)
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : text.failedToLoadAlbum)
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        load()
    }, [route.params.albumID])

    const title = album ? (lang ? album.name_no : album.name_en) : ''
    const description = album ? (lang ? album.description_no : album.description_en) : ''

    function closeDownloadSheet() {
        setShowDownloadSheet(false)
        setInitialDownloadImage(null)
    }

    function toggleDownloadSheet() {
        setShowDownloadSheet((current) => {
            if (current) {
                setInitialDownloadImage(null)
                return false
            }

            setInitialDownloadImage(null)
            return true
        })
    }

    function selectImageForDownload(image: string) {
        setInitialDownloadImage(image)
        setShowDownloadSheet(true)
    }

    useEffect(() => {
        navigation.setOptions({
            headerComponents: {
                right: album?.images?.length ? [
                    <AlbumDownloadButton
                        key='album-download'
                        downloading={downloadingImages}
                        onPress={toggleDownloadSheet}
                        showDownloadSheet={showDownloadSheet}
                        theme={theme}
                    />
                ] : []
            }
        } as any)
    }, [album?.images?.length, downloadingImages, navigation, showDownloadSheet, text, theme])

    return (
        <Swipe left='AlbumsScreen'>
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
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    {error ? (
                        <Cluster>
                            <View style={{ padding: 12 }}>
                                <Text style={{ ...T.text15, color: '#ff8b8b' }}>{error}</Text>
                            </View>
                        </Cluster>
                    ) : null}

                    {album ? (
                        <>
                            <SpecificAlbumSummary
                                album={album}
                                description={description}
                                lang={lang}
                                navigation={navigation}
                                text={text}
                                theme={theme}
                                title={title}
                            />

                            <Space height={10} />
                            <AlbumImageGrid
                                album={album}
                                title={title}
                                onSelectImage={selectImageForDownload}
                            />
                        </>
                    ) : null}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
                <AlbumDownloadSheet
                    album={album}
                    initialSelectedImage={initialDownloadImage}
                    title={title}
                    text={text}
                    visible={showDownloadSheet}
                    onClose={closeDownloadSheet}
                    onDownloadingChange={setDownloadingImages}
                />
            </View>
        </Swipe>
    )
}
