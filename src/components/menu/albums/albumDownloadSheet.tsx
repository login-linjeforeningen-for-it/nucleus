import Space from '@/components/shared/utils'
import { AlbumDownloadProgress, downloadAlbumImages } from '@/utils/albums/downloadImages'
import { albumImageUri } from '@/utils/albums/imagePrefetch'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Alert, Modal, Pressable, useWindowDimensions, View } from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { AlbumImageViewer } from './albumImageViewer'
import { AlbumDownloadActions, AlbumDownloadGrid, AlbumText } from './albumDownloadParts'

export function AlbumDownloadSheet({
    album,
    initialSelectedImage,
    onClose,
    onDownloadingChange,
    text,
    title,
    visible,
}: {
    album: GetAlbumProps | null
    initialSelectedImage?: string | null
    onClose: () => void
    onDownloadingChange?: (downloading: boolean) => void
    text: AlbumText
    title: string
    visible: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const viewport = useWindowDimensions()
    const images = useMemo(() => Array.isArray(album?.images) ? album.images : [], [album?.images])
    const [selectedImages, setSelectedImages] = useState<string[]>(images)
    const [downloading, setDownloading] = useState(false)
    const [downloadAction, setDownloadAction] = useState<'all' | 'selected' | null>(null)
    const [downloadProgress, setDownloadProgress] = useState<AlbumDownloadProgress | null>(null)
    const [inspectedImage, setInspectedImage] = useState<string | null>(null)
    const selectedCount = selectedImages.length

    useEffect(() => {
        if (visible) {
            setSelectedImages(initialSelectedImage && images.includes(initialSelectedImage)
                ? [initialSelectedImage]
                : images)
            setInspectedImage(null)
        }
    }, [images, initialSelectedImage, visible])

    function toggleImage(image: string) {
        setSelectedImages((current) => current.includes(image)
            ? current.filter((candidate) => candidate !== image)
            : [...current, image])
    }

    async function downloadImages(imagesToDownload: string[], action: 'all' | 'selected') {
        if (!album || !imagesToDownload.length || downloading) {
            return
        }

        setDownloading(true)
        setDownloadAction(action)
        setDownloadProgress({ completed: 0, total: Array.from(new Set(imagesToDownload)).filter(Boolean).length })
        onDownloadingChange?.(true)

        try {
            const result = await downloadAlbumImages({
                albumId: album.id,
                images: imagesToDownload,
                onProgress: setDownloadProgress,
            })

            if (result.failed.length) {
                Alert.alert(
                    text.downloadImages || 'Download images',
                    `${result.saved.length} downloaded, ${result.failed.length} failed.`
                )
            }
        } finally {
            setDownloading(false)
            setDownloadAction(null)
            setDownloadProgress(null)
            onDownloadingChange?.(false)
        }
    }

    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose} statusBarTranslucent>
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
                        <Space height={3} />
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                            {text.inspectHint || 'Press and hold an image to inspect it.'}
                        </Text>
                    </View>
                    <AlbumDownloadGrid
                        album={album}
                        images={images}
                        selectedImages={selectedImages}
                        title={title}
                        viewportHeight={viewport.height}
                        onInspect={setInspectedImage}
                        onToggle={toggleImage}
                    />
                    <AlbumDownloadActions
                        imageCount={images.length}
                        downloadAction={downloadAction}
                        downloadProgress={downloadProgress}
                        downloading={downloading}
                        selectedCount={selectedCount}
                        text={text}
                        onClose={onClose}
                        onClearSelection={() => setSelectedImages([])}
                        onDownloadAll={() => downloadImages(images, 'all')}
                        onDownloadSelected={() => downloadImages(selectedImages, 'selected')}
                    />
                </View>
                <AlbumDownloadInspect
                    album={album}
                    image={inspectedImage}
                    images={images}
                    selected={Boolean(inspectedImage && selectedImages.includes(inspectedImage))}
                    text={text}
                    title={title}
                    onChangeImage={setInspectedImage}
                    onClose={() => setInspectedImage(null)}
                    onToggle={() => {
                        if (inspectedImage) {
                            toggleImage(inspectedImage)
                        }
                    }}
                />
            </View>
        </Modal>
    )
}

function AlbumDownloadInspect({
    album,
    image,
    images,
    onChangeImage,
    onClose,
    onToggle,
    selected,
    text,
    title,
}: {
    album: GetAlbumProps | null
    image: string | null
    images: string[]
    onChangeImage: (image: string) => void
    onClose: () => void
    onToggle: () => void
    selected: boolean
    text: AlbumText
    title: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    if (!image || !album?.id) {
        return null
    }

    const index = images.indexOf(image)
    const name = image.split('/').pop() || image
    const uri = albumImageUri(album.id, image)
    const imageUris = images.map((candidate) => albumImageUri(album.id, candidate))

    return (
        <AlbumImageViewer
            footer={(
                <View style={{
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.greyTransparentBorder,
                    backgroundColor: theme.greyTransparent,
                    padding: 12,
                    gap: 9,
                }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>
                        {text.inspectImage || 'Inspect image'}
                    </Text>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`${index + 1} / ${images.length} · ${selected ? text.selectedImages || 'selected' : text.notSelected || 'not selected'}`}
                    </Text>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }} numberOfLines={2}>
                        {name}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <InspectButton label={text.close || 'Close'} onPress={onClose} />
                        <InspectButton accent label={text.toggleSelection || 'Toggle selection'} onPress={onToggle} />
                    </View>
                </View>
            )}
            imageUri={uri}
            imageUris={imageUris}
            title={`${title} ${index + 1}`}
            onClose={onClose}
            onChangeImage={(nextUri) => {
                const nextImage = images.find((candidate) => albumImageUri(album.id, candidate) === nextUri)
                if (nextImage) {
                    onChangeImage(nextImage)
                }
            }}
        />
    )
}

function InspectButton({
    accent,
    label,
    onPress,
}: {
    accent?: boolean
    label: string
    onPress: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                flex: 1,
                borderRadius: 16,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor: accent ? theme.orangeTransparent : theme.greyTransparent,
                borderWidth: 1,
                borderColor: accent ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
                opacity: pressed ? 0.78 : 1,
            })}
        >
            <Text style={{ ...T.text12, color: accent ? theme.orange : theme.textColor }}>
                {label}
            </Text>
        </Pressable>
    )
}
