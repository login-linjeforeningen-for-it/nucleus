import Space from '@/components/shared/utils'
import config from '@/constants'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Image, Linking, Modal, Platform, Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { AlbumText } from './albumTypes'

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

function AlbumDownloadGrid({
    album,
    images,
    onToggle,
    selectedImages,
    title,
    viewportHeight,
}: {
    album: GetAlbumProps | null
    images: string[]
    onToggle: (image: string) => void
    selectedImages: string[]
    title: string
    viewportHeight: number
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <ScrollView
            style={{ maxHeight: viewportHeight * 0.55 }}
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
                        onPress={() => onToggle(image)}
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
                            borderColor: selected ? theme.orangeTransparentBorder : '#ffffff14',
                            opacity: pressed ? 0.82 : 1,
                        })}
                    >
                        <Image
                            source={{ uri, cache: 'force-cache' }}
                            accessibilityLabel={`${title} ${index + 1}`}
                            style={{ width: '100%', height: '100%' }}
                        />
                        <SelectionDot selected={selected} />
                    </Pressable>
                )
            })}
        </ScrollView>
    )
}

function SelectionDot({ selected }: { selected: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected ? 'rgba(253,135,56,0.22)' : 'rgba(8,8,8,0.58)',
            borderWidth: 1,
            borderColor: selected ? theme.orangeTransparentBorder : '#ffffff42',
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
    )
}

function AlbumDownloadActions({
    imageCount,
    onClose,
    onDownloadAll,
    onDownloadSelected,
    selectedCount,
    text,
}: {
    imageCount: number
    onClose: () => void
    onDownloadAll: () => void
    onDownloadSelected: () => void
    selectedCount: number
    text: AlbumText
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: '#ffffff12' }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <AlbumDownloadButton flex={1} label={text.close || 'Close'} onPress={onClose} />
                <AlbumDownloadButton
                    disabled={!imageCount}
                    flex={1}
                    label={text.downloadAll || 'Download all'}
                    onPress={onDownloadAll}
                    testID='album-download-all'
                />
            </View>
            <AlbumDownloadButton
                accent={Boolean(selectedCount)}
                disabled={!selectedCount}
                label={selectedCount ? text.downloadSelected || 'Download selected' : text.noImagesSelected || 'No images selected'}
                labelColor={selectedCount ? theme.orange : theme.oppositeTextColor}
                onPress={onDownloadSelected}
                testID='album-download-selected'
            />
        </View>
    )
}

function AlbumDownloadButton({
    accent,
    disabled,
    flex,
    label,
    labelColor,
    onPress,
    testID,
}: {
    accent?: boolean
    disabled?: boolean
    flex?: number
    label: string
    labelColor?: string
    onPress: () => void
    testID?: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            testID={testID}
            style={({ pressed }) => ({
                ...(typeof flex === 'number' ? { flex } : null),
                borderRadius: 18,
                paddingVertical: flex ? 13 : 14,
                alignItems: 'center',
                backgroundColor: accent
                    ? pressed ? 'rgba(253,135,56,0.24)' : theme.orangeTransparent
                    : pressed ? '#ffffff16' : '#ffffff08',
                borderWidth: 1,
                borderColor: accent ? theme.orangeTransparentBorder : disabled ? '#ffffff12' : '#ffffff18',
                opacity: disabled ? 0.55 : 1,
            })}
        >
            <Text style={{ ...T.text15, color: labelColor || theme.textColor }}>
                {label}
            </Text>
        </Pressable>
    )
}
