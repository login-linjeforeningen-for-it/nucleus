import Space from '@/components/shared/utils'
import config from '@/constants'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Linking, Modal, Platform, useWindowDimensions, View } from 'react-native'
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
        if (!album || !imagesToDownload.length || downloading) {
            return
        }

        setDownloading(true)
        onDownloadingChange?.(true)

        try {
            for (const image of imagesToDownload) {
                const uri = `${config.cdn}/albums/${album.id}/${image}`
                if (Platform.OS === 'web') {
                    downloadOnWeb(uri, image)
                } else {
                    await Linking.openURL(uri)
                }
            }
        } finally {
            setDownloading(false)
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
                        selectedCount={selectedCount}
                        text={text}
                        onClose={onClose}
                        onDownloadAll={() => downloadImages(images)}
                        onDownloadSelected={() => downloadImages(selectedImages)}
                    />
                </View>
            </View>
        </Modal>
    )
}
