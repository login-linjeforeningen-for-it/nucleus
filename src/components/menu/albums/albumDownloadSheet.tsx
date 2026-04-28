import Space from '@/components/shared/utils'
import { downloadAlbumImages, type AlbumDownloadResult } from '@/utils/albums/downloadImages'
import Text from '@components/shared/text'
import T from '@styles/text'
import { useWindowDimensions, View } from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { AlbumDownloadActions, AlbumDownloadGrid, AlbumText } from './albumDownloadParts'

export function AlbumDownloadSheet({
    album,
    initialSelectedImage,
    onClose,
    text,
    title,
    visible,
}: {
    album: GetAlbumProps | null
    initialSelectedImage?: string | null
    onClose: () => void
    text: AlbumText
    title: string
    visible: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const viewport = useWindowDimensions()
    const images = useMemo(() => Array.isArray(album?.images) ? album.images : [], [album?.images])
    const [selectedImages, setSelectedImages] = useState<string[]>(images)
    const [downloading, setDownloading] = useState(false)
    const [downloadResult, setDownloadResult] = useState<AlbumDownloadResult | null>(null)
    const selectedCount = selectedImages.length

    useEffect(() => {
        if (visible) {
            setSelectedImages(initialSelectedImage && images.includes(initialSelectedImage)
                ? [initialSelectedImage]
                : images)
            setDownloadResult(null)
        }
    }, [images, initialSelectedImage, visible])

    function toggleImage(image: string) {
        setSelectedImages((current) => current.includes(image)
            ? current.filter((candidate) => candidate !== image)
            : [...current, image])
    }

    async function downloadImages(imagesToDownload: string[]) {
        if (!album || !imagesToDownload.length || downloading) {
            return
        }

        setDownloading(true)
        setDownloadResult(null)
        try {
            setDownloadResult(await downloadAlbumImages({
                albumId: album.id,
                images: imagesToDownload,
            }))
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown download error'
            setDownloadResult({ errors: [message], failed: imagesToDownload, saved: [] })
        } finally {
            setDownloading(false)
        }
    }

    if (!visible) {
        return null
    }

    return (
        <View
            testID='album-download-sheet'
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                left: 0,
                height: viewport.height,
                zIndex: 20,
                backgroundColor: '#050505d9',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 16,
            }}
        >
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
                <AlbumDownloadStatus downloading={downloading} result={downloadResult} text={text} />
                <AlbumDownloadActions
                    downloading={downloading}
                    imageCount={images.length}
                    selectedCount={selectedCount}
                    text={text}
                    onClose={onClose}
                    onDownloadAll={() => downloadImages(images)}
                    onDownloadSelected={() => downloadImages(selectedImages)}
                />
            </View>
        </View>
    )
}

function AlbumDownloadStatus({
    downloading,
    result,
    text,
}: {
    downloading: boolean
    result: AlbumDownloadResult | null
    text: AlbumText
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    if (!downloading && !result) {
        return null
    }

    const label = downloading
        ? text.downloading || 'Downloading directly in app...'
        : result?.failed.length
            ? `${result.saved.length} ${text.downloadedImages || 'downloaded'}, ${result.failed.length} ${text.failedImages || 'failed'}`
            : `${result?.saved.length || 0} ${text.downloadedImages || 'downloaded'}`
    const details = result?.errors[0]

    return (
        <View
            testID='album-download-status'
            style={{
                marginHorizontal: 14,
                marginBottom: 2,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: result?.failed.length ? '#ff6b6b44' : theme.orangeTransparentBorder,
                backgroundColor: result?.failed.length ? '#ff6b6b16' : theme.orangeTransparent,
                paddingHorizontal: 12,
                paddingVertical: 9,
            }}
        >
            <Text style={{ ...T.text12, color: result?.failed.length ? '#ffb4b4' : theme.textColor }}>
                {label}
            </Text>
            {!!details && (
                <>
                    <Space height={4} />
                    <Text style={{ ...T.text10, color: result?.failed.length ? '#ffcdcd' : theme.oppositeTextColor }}>
                        {details}
                    </Text>
                </>
            )}
        </View>
    )
}
