import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { AlbumImageGrid, AlbumPill } from '@/components/menu/albums/albumCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { fetchAlbumDetails } from '@utils/fetch'
import { formatNorwegianDate } from '@utils/general'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

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
                            <AlbumImageGrid album={album} title={title} />
                        </>
                    ) : null}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}
