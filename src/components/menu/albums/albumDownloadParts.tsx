import config from '@/constants'
import { AlbumDownloadProgress } from '@/utils/albums/downloadImages'
import { albumImageUri } from '@/utils/albums/imagePrefetch'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Image, Pressable, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

export type AlbumText = {
    clearSelection?: string
    close?: string
    downloadAll?: string
    downloadImages?: string
    downloadSelected?: string
    inspectHint?: string
    inspectImage?: string
    notSelected?: string
    noImagesSelected?: string
    selectedImages?: string
    toggleSelection?: string
}

export function AlbumDownloadGrid({
    album,
    images,
    onInspect,
    onToggle,
    selectedImages,
    title,
    viewportHeight,
}: {
    album: GetAlbumProps | null
    images: string[]
    onInspect: (image: string) => void
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
                const uri = album?.id ? albumImageUri(album.id, image, 'preview') : `${config.albumCdn}/albums/${image}`

                return (
                    <Pressable
                        key={image}
                        onPress={() => onToggle(image)}
                        onLongPress={() => onInspect(image)}
                        delayLongPress={320}
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
                            borderColor: selected ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
                            opacity: pressed ? 0.9 : 1,
                            transform: [{ scale: pressed ? 1.05 : 1 }],
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

export function AlbumDownloadActions({
    downloadAction,
    downloadProgress,
    downloading,
    imageCount,
    onClose,
    onClearSelection,
    onDownloadAll,
    onDownloadSelected,
    selectedCount,
    text,
}: {
    downloadAction: 'all' | 'selected' | null
    downloadProgress: AlbumDownloadProgress | null
    downloading: boolean
    imageCount: number
    onClose: () => void
    onClearSelection: () => void
    onDownloadAll: () => void
    onDownloadSelected: () => void
    selectedCount: number
    text: AlbumText
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            gap: 10,
            padding: 14,
            borderTopWidth: 1,
            borderTopColor: theme.greyTransparentBorder
        }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <AlbumDownloadButton
                    disabled={downloading}
                    flex={1}
                    label={text.close || 'Close'}
                    onPress={onClose}
                />
                <AlbumDownloadButton
                    flex={1}
                    disabled={!selectedCount || downloading}
                    label={text.clearSelection || 'Clear selection'}
                    labelColor={selectedCount ? theme.textColor : theme.oppositeTextColor}
                    onPress={onClearSelection}
                    testID='album-download-clear-selection'
                />
                <AlbumDownloadButton
                    disabled={!imageCount || downloading}
                    flex={1}
                    label={text.downloadAll || 'Download all'}
                    progress={downloadAction === 'all' ? downloadProgress : null}
                    onPress={onDownloadAll}
                    testID='album-download-all'
                />
            </View>
            <AlbumDownloadButton
                accent={Boolean(selectedCount)}
                disabled={!selectedCount || downloading}
                label={selectedCount ? text.downloadSelected || 'Download selected' : text.noImagesSelected || 'No images selected'}
                labelColor={selectedCount ? theme.orange : theme.oppositeTextColor}
                progress={downloadAction === 'selected' ? downloadProgress : null}
                onPress={onDownloadSelected}
                testID='album-download-selected'
            />
        </View>
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
            backgroundColor: selected ? theme.orangeTransparent : theme.greyTransparent,
            borderWidth: 1,
            borderColor: selected ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
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

function AlbumDownloadButton({
    accent,
    disabled,
    flex,
    label,
    labelColor,
    onPress,
    progress,
    testID,
}: {
    accent?: boolean
    disabled?: boolean
    flex?: number
    label: string
    labelColor?: string
    onPress: () => void
    progress?: AlbumDownloadProgress | null
    testID?: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const progressRatio = progress?.total ? progress.completed / progress.total : 0
    const progressLabel = progress ? `${progress.completed}/${progress.total}` : label

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
                    ? pressed ? theme.orangeTransparent : theme.orangeTransparent
                    : pressed ? theme.greyTransparent : theme.greyTransparent,
                borderWidth: 1,
                borderColor: accent ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
            })}
        >
            {progress ? (
                <View style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.max(3, Math.min(100, progressRatio * 100))}%`,
                    backgroundColor: theme.orangeTransparent,
                }} />
            ) : null}
            <Text style={{ ...T.text15, color: progress ? theme.orange : labelColor || theme.textColor }}>
                {progressLabel}
            </Text>
        </Pressable>
    )
}
