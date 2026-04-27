import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Image, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export function AlbumCard({
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
                        <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                        <Space height={5} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }} numberOfLines={2}>
                            {description}
                        </Text>
                        <Space height={10} />
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <AlbumPill label={String(album.year)} />
                            <AlbumPill label={`${album.image_count || images.length} ${imageLabel}`} />
                        </View>
                    </View>
                </Cluster>
            </TouchableOpacity>
            <Space height={10} />
        </>
    )
}

export function AlbumImageGrid({ album, title }: { album: GetAlbumProps, title: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const images = Array.isArray(album.images) ? album.images : []

    if (!images.length) {
        return (
            <Cluster>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>No images</Text>
                </View>
            </Cluster>
        )
    }

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {images.map((image, index) => (
                <View
                    key={image}
                    style={{
                        width: '48%',
                        aspectRatio: 1,
                        borderRadius: 18,
                        overflow: 'hidden',
                        backgroundColor: theme.contrast,
                        borderWidth: 1,
                        borderColor: '#ffffff14',
                    }}
                >
                    <Image
                        source={{ uri: `${config.cdn}/albums/${album.id}/${image}`, cache: 'force-cache' }}
                        accessibilityLabel={`${title} ${index + 1}`}
                        style={{ width: '100%', height: '100%' }}
                    />
                </View>
            ))}
        </View>
    )
}

export function AlbumPill({ label }: { label: string }) {
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

function AlbumImageStack({ albumID, images, title }: {
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
