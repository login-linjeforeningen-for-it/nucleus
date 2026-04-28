import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import Text from '@components/shared/text'
import T from '@styles/text'
import {
    Image,
    Linking,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

type AlbumText = {
    close?: string
    downloadAll?: string
    downloadImages?: string
    downloadSelected?: string
    noImagesSelected?: string
    selectedImages?: string
}

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
                {images.map((image, index) => {
                    const uri = `${config.cdn}/albums/${album.id}/${image}`
                    const openImage = () => setSelectedImage(uri)

                    return (
                        <Pressable
                            key={image}
                            onPress={openImage}
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
                })}
            </View>
            <AlbumImageViewer
                title={title}
                imageUri={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </>
    )
}

export function AlbumDownloadSheet({
    album,
    onClose,
    text,
    title,
    visible,
}: {
    album: GetAlbumProps | null
    onClose: () => void
    text: AlbumText
    title: string
    visible: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const viewport = useWindowDimensions()
    const images = useMemo(() => Array.isArray(album?.images) ? album.images : [], [album?.images])
    const [selectedImages, setSelectedImages] = useState<string[]>(images)
    const selectedCount = selectedImages.length

    useEffect(() => {
        if (visible) {
            setSelectedImages(images)
        }
    }, [images, visible])

    function toggleImage(image: string) {
        setSelectedImages((current) => current.includes(image)
            ? current.filter((candidate) => candidate !== image)
            : [...current, image])
    }

    function downloadOnWeb(uri: string, image: string) {
        const link = document.createElement('a')
        link.href = uri
        link.download = image
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        link.remove()
    }

    async function downloadImages(imagesToDownload: string[]) {
        if (!album || !imagesToDownload.length) {
            return
        }

        for (const image of imagesToDownload) {
            const uri = `${config.cdn}/albums/${album.id}/${image}`
            if (Platform.OS === 'web') {
                downloadOnWeb(uri, image)
            } else {
                await Linking.openURL(uri)
            }
        }
    }

    async function downloadSelected() {
        await downloadImages(selectedImages)
    }

    async function downloadAll() {
        await downloadImages(images)
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={{
                flex: 1,
                backgroundColor: '#050505d9',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 16,
            }}>
                <View style={{
                    width: Math.min(560, viewport.width - 28),
                    maxHeight: viewport.height * 0.78,
                    borderRadius: 28,
                    borderWidth: 1,
                    borderColor: '#ffffff20',
                    backgroundColor: '#151515e6',
                    overflow: 'hidden',
                }}>
                    <View style={{ padding: 16, paddingBottom: 12 }}>
                        <Text style={{ ...T.text20, color: theme.textColor }}>
                            {text.downloadImages || 'Download images'}
                        </Text>
                        <Space height={4} />
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                            {`${selectedCount} ${text.selectedImages || 'selected'}`}
                        </Text>
                    </View>
                    <ScrollView
                        style={{ maxHeight: viewport.height * 0.55 }}
                        contentContainerStyle={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 10,
                            padding: 12,
                            paddingTop: 0,
                        }}
                    >
                        {images.map((image, index) => {
                            const selected = selectedImages.includes(image)
                            const uri = `${config.cdn}/albums/${album?.id}/${image}`

                            return (
                                <Pressable
                                    key={image}
                                    onPress={() => toggleImage(image)}
                                    accessibilityRole='checkbox'
                                    accessibilityState={{ checked: selected }}
                                    accessibilityLabel={`${title} ${index + 1}`}
                                    testID={`album-download-image-${index}`}
                                    style={({ pressed }) => ({
                                        width: '48%',
                                        aspectRatio: 1,
                                        borderRadius: 18,
                                        overflow: 'hidden',
                                        backgroundColor: theme.contrast,
                                        borderWidth: 1,
                                        borderColor: selected
                                            ? theme.orangeTransparentBorder
                                            : '#ffffff14',
                                        opacity: pressed ? 0.82 : 1,
                                    })}
                                >
                                    <Image
                                        source={{ uri, cache: 'force-cache' }}
                                        accessibilityLabel={`${title} ${index + 1}`}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                    <View style={{
                                        position: 'absolute',
                                        right: 8,
                                        bottom: 8,
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: selected
                                            ? 'rgba(253,135,56,0.22)'
                                            : 'rgba(8,8,8,0.58)',
                                        borderWidth: 1,
                                        borderColor: selected
                                            ? theme.orangeTransparentBorder
                                            : '#ffffff42',
                                    }}>
                                        {selected ? (
                                            <View style={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: 6,
                                                backgroundColor: theme.orange,
                                            }} />
                                        ) : null}
                                    </View>
                                </Pressable>
                            )
                        })}
                    </ScrollView>
                    <View style={{
                        flexDirection: 'row',
                        gap: 10,
                        padding: 14,
                        borderTopWidth: 1,
                        borderTopColor: '#ffffff12',
                    }}>
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => ({
                                flex: 0.9,
                                borderRadius: 18,
                                paddingVertical: 13,
                                alignItems: 'center',
                                backgroundColor: pressed ? '#ffffff12' : '#ffffff08',
                                borderWidth: 1,
                                borderColor: '#ffffff14',
                            })}
                        >
                            <Text style={{ ...T.text15, color: theme.textColor }}>
                                {text.close || 'Close'}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={downloadAll}
                            disabled={!images.length}
                            testID='album-download-all'
                            style={({ pressed }) => ({
                                flex: 1,
                                borderRadius: 18,
                                paddingVertical: 13,
                                alignItems: 'center',
                                backgroundColor: images.length
                                    ? pressed
                                        ? '#ffffff16'
                                        : '#ffffff08'
                                    : '#ffffff06',
                                borderWidth: 1,
                                borderColor: images.length ? '#ffffff18' : '#ffffff12',
                                opacity: images.length ? 1 : 0.55,
                            })}
                        >
                            <Text style={{ ...T.text15, color: theme.textColor }}>
                                {text.downloadAll || 'Download all'}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={downloadSelected}
                            disabled={!selectedCount}
                            style={({ pressed }) => ({
                                flex: 1.25,
                                borderRadius: 18,
                                paddingVertical: 13,
                                alignItems: 'center',
                                backgroundColor: selectedCount
                                    ? pressed
                                        ? 'rgba(253,135,56,0.24)'
                                        : theme.orangeTransparent
                                    : '#ffffff08',
                                borderWidth: 1,
                                borderColor: selectedCount
                                    ? theme.orangeTransparentBorder
                                    : '#ffffff14',
                                opacity: selectedCount ? 1 : 0.55,
                            })}
                        >
                            <Text style={{ ...T.text15, color: selectedCount ? theme.orange : theme.oppositeTextColor }}>
                                {selectedCount
                                    ? text.downloadSelected || 'Download selected'
                                    : text.noImagesSelected || 'No images selected'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

function AlbumImageViewer({
    imageUri,
    onClose,
    title,
}: {
    imageUri: string | null
    onClose: () => void
    title: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [zoom, setZoom] = useState(1)
    const viewport = useWindowDimensions()
    const initialSize = useMemo(() => ({
        width: viewport.width * 0.8,
        height: viewport.height * 0.7,
    }), [viewport.height, viewport.width])

    const close = () => {
        setZoom(1)
        onClose()
    }

    return (
        <Modal
            visible={Boolean(imageUri)}
            transparent
            animationType='fade'
            onRequestClose={close}
            statusBarTranslucent
        >
            <View
                testID='album-image-viewer'
                style={{
                    flex: 1,
                    backgroundColor: '#050505f2',
                }}
            >
                <ScrollView
                    horizontal
                    style={{
                        flex: 1,
                        width: viewport.width,
                        height: viewport.height,
                    }}
                    maximumZoomScale={5}
                    minimumZoomScale={1}
                    bouncesZoom
                    centerContent
                    showsHorizontalScrollIndicator={zoom > 1}
                    showsVerticalScrollIndicator={zoom > 1}
                    contentContainerStyle={{
                        minWidth: viewport.width,
                        minHeight: viewport.height,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 24,
                    }}
                >
                    <ScrollView
                        style={{
                            width: Math.max(viewport.width, initialSize.width * zoom),
                            height: Math.max(viewport.height, initialSize.height * zoom),
                        }}
                        maximumZoomScale={5}
                        minimumZoomScale={1}
                        bouncesZoom
                        centerContent
                        showsVerticalScrollIndicator={zoom > 1}
                        contentContainerStyle={{
                            minWidth: Math.max(viewport.width, initialSize.width * zoom),
                            minHeight: Math.max(viewport.height, initialSize.height * zoom),
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {imageUri ? (
                            <Image
                                source={{ uri: imageUri, cache: 'force-cache' }}
                                accessibilityLabel={title}
                                resizeMode='contain'
                                style={{
                                    width: initialSize.width * zoom,
                                    height: initialSize.height * zoom,
                                    borderRadius: Math.max(8, 24 / zoom),
                                }}
                            />
                        ) : null}
                    </ScrollView>
                </ScrollView>
                <View style={{
                    position: 'absolute',
                    right: 18,
                    top: 18,
                    zIndex: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <Pressable
                        onPress={() => setZoom((value) => Math.max(1, value - 1))}
                        testID='album-image-zoom-out'
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#161616cc',
                            borderWidth: 1,
                            borderColor: '#ffffff24',
                        }}
                    >
                        <Text style={{ ...T.text20, color: theme.textColor }}>-</Text>
                    </Pressable>
                    <View style={{
                        minWidth: 58,
                        height: 38,
                        borderRadius: 19,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.orangeTransparent,
                        borderWidth: 1,
                        borderColor: theme.orangeTransparentBorder,
                    }}>
                        <Text style={{ ...T.text12, color: theme.textColor }}>{Math.round(zoom * 100)}%</Text>
                    </View>
                    <Pressable
                        onPress={() => setZoom((value) => Math.min(5, value + 1))}
                        testID='album-image-zoom-in'
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#161616cc',
                            borderWidth: 1,
                            borderColor: '#ffffff24',
                        }}
                    >
                        <Text style={{ ...T.text20, color: theme.orange }}>+</Text>
                    </Pressable>
                    <Pressable
                        onPress={close}
                        testID='album-image-close'
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#161616cc',
                            borderWidth: 1,
                            borderColor: '#ffffff24',
                        }}
                    >
                        <Text style={{ ...T.text20, color: theme.textColor }}>x</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
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
