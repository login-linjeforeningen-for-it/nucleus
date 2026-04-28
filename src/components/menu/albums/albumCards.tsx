import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Image, Platform, Pressable, TouchableOpacity, View } from 'react-native'
import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { AlbumImageViewer } from './albumImageViewer'
import { AlbumImageStack, AlbumPill } from './albumPrimitives'

export { AlbumDownloadSheet } from './albumDownloadSheet'
export { AlbumPill } from './albumPrimitives'

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

export function AlbumImageGrid({
    album,
    onSelectImage,
    title,
}: {
    album: GetAlbumProps
    onSelectImage?: (image: string) => void
    title: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const images = Array.isArray(album.images) ? album.images : []
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

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
        <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {images.map((image, index) => (
                    <AlbumGridImage
                        key={image}
                        albumID={album.id}
                        image={image}
                        index={index}
                        title={title}
                        onOpen={setSelectedImage}
                        onSelectImage={onSelectImage}
                    />
                ))}
            </View>
            <AlbumImageViewer
                title={title}
                imageUri={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </>
    )
}

function AlbumGridImage({
    albumID,
    image,
    index,
    onOpen,
    onSelectImage,
    title,
}: {
    albumID: number
    image: string
    index: number
    onOpen: (uri: string) => void
    onSelectImage?: (image: string) => void
    title: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const longPressHandled = useRef(false)
    const uri = `${config.cdn}/albums/${albumID}/${image}`
    const openImage = () => {
        if (longPressHandled.current) {
            longPressHandled.current = false
            return
        }

        onOpen(uri)
    }
    const selectImage = () => {
        longPressHandled.current = true
        onSelectImage?.(image)
    }

    return (
        <Pressable
            onPress={openImage}
            onLongPress={selectImage}
            delayLongPress={320}
            {...(Platform.OS === 'web'
                ? {
                    onStartShouldSetResponder: () => true,
                    onResponderRelease: openImage,
                }
                : {})}
            accessibilityRole='button'
            accessibilityLabel={`${title} ${index + 1}`}
            testID={`album-image-${index}`}
            style={({ pressed }) => ({
                width: '48%',
                aspectRatio: 1,
                borderRadius: 18,
                overflow: 'hidden',
                backgroundColor: theme.contrast,
                borderWidth: 1,
                borderColor: '#ffffff14',
                opacity: pressed ? 0.84 : 1,
            })}
        >
            <Image
                source={{ uri, cache: 'force-cache' }}
                accessibilityLabel={`${title} ${index + 1}`}
                style={{ width: '100%', height: '100%' }}
            />
        </Pressable>
    )
}
