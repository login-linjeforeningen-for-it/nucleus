import Space from '@/components/shared/utils'
import { AlbumDownloadProgress, downloadAlbumImages } from '@/utils/albums/downloadImages'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Alert, Modal, useWindowDimensions, View } from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
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
    const selectedCount = selectedImages.length

    useEffect(() => {
        if (visible) {
            setSelectedImages(initialSelectedImage && images.includes(initialSelectedImage)
                ? [initialSelectedImage]
                : images)
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
                    </View>
                    <AlbumDownloadGrid
                        album={album}
                        images={images}
                        selectedImages={selectedImages}
                        title={title}
                        viewportHeight={viewport.height}
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
                        onDownloadAll={() => downloadImages(images, 'all')}
                        onDownloadSelected={() => downloadImages(selectedImages, 'selected')}
                    />
                </View>
            </View>
        </Modal>
    )
}
