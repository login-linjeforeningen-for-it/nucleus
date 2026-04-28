import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { AlbumDownloadSheet, AlbumImageGrid, AlbumPill } from '@/components/menu/albums/albumCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { fetchAlbumDetails } from '@utils/fetch'
import { formatNorwegianDate } from '@utils/general'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { JSX, useEffect, useState } from 'react'
import { X } from 'lucide-react-native'
import { Dimensions, Image, Platform, Pressable, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import MS from '@styles/menuStyles'

function formatAlbumDate(value?: string | null) {
    const formatted = formatNorwegianDate(value, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })

    return formatted ? `${formatted} - ` : ''
}

function formatShortDate(value: string) {
    return formatNorwegianDate(value, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }, value)
}

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
    const headerActionTop = Dimensions.get('window').height / 17 + (Platform.OS === 'ios' ? 9 : 1)
    const closeDownloadSheet = () => {
        setShowDownloadSheet(false)
        setInitialDownloadImage(null)
    }
    const toggleDownloadSheet = () => {
        setShowDownloadSheet((current) => {
            if (current) {
                setInitialDownloadImage(null)
                return false
            }

            setInitialDownloadImage(null)
            return true
        })
    }
    const selectImageForDownload = (image: string) => {
        setInitialDownloadImage(image)
        setShowDownloadSheet(true)
    }

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
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text25, color: theme.textColor }}>
                                        {title}
                                    </Text>
                                    <Space height={8} />
                                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                        {`${formatAlbumDate(album.event?.time_start)}${description}`}
                                    </Text>
                                    <Space height={12} />
                                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                        <AlbumPill label={String(album.year)} />
                                        <AlbumPill label={`${album.image_count || album.images?.length || 0} ${text.images}`} />
                                        <AlbumPill label={`${text.updated} ${formatShortDate(album.updated_at)}`} />
                                    </View>
                                    {album.event ? (
                                        <>
                                            <Space height={12} />
                                            <TouchableOpacity
                                                onPress={() => {
                                                    const tabNavigation = navigation
                                                        .getParent<BottomTabNavigationProp<TabBarParamList>>()
                                                    if (album.event?.id) {
                                                        tabNavigation?.navigate('EventNav', {
                                                            screen: 'SpecificEventScreen',
                                                            params: { eventID: album.event.id },
                                                        })
                                                    }
                                                }}
                                                activeOpacity={0.88}
                                            >
                                                <View style={{
                                                    borderRadius: 16,
                                                    borderWidth: 1,
                                                    borderColor: theme.orangeTransparentBorder,
                                                    backgroundColor: theme.orangeTransparent,
                                                    padding: 12,
                                                }}>
                                                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                                        {text.event}
                                                    </Text>
                                                    <Space height={4} />
                                                    <Text style={{ ...T.text15, color: theme.textColor }}>
                                                        {lang ? album.event.name_no : album.event.name_en}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </>
                                    ) : null}
                                </View>
                            </Cluster>

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
                {album?.images?.length ? (
                    <Pressable
                        accessibilityRole='button'
                        accessibilityLabel={showDownloadSheet ? text.close : text.downloadImages}
                        testID='album-download-button'
                        onPress={toggleDownloadSheet}
                        style={({ pressed }) => ({
                            position: 'absolute',
                            right: 18,
                            top: headerActionTop,
                            zIndex: 14,
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: showDownloadSheet
                                ? theme.orangeTransparentBorder
                                : 'rgba(255,255,255,0.14)',
                            backgroundColor: showDownloadSheet
                                ? theme.orangeTransparent
                                : pressed
                                    ? 'rgba(255,255,255,0.10)'
                                    : 'rgba(255,255,255,0.07)',
                        })}
                    >
                        {showDownloadSheet ? (
                            <X size={24} color={theme.orange} strokeWidth={2.4} />
                        ) : (
                            <Image
                                source={require('@assets/icons/download-orange.png')}
                                style={MS.multiIcon}
                            />
                        )}
                    </Pressable>
                ) : null}
                <AlbumDownloadSheet
                    album={album}
                    initialSelectedImage={initialDownloadImage}
                    title={title}
                    text={text}
                    visible={showDownloadSheet}
                    onClose={closeDownloadSheet}
                />
            </View>
        </Swipe>
    )
}
