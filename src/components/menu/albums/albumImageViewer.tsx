import Text from '@components/shared/text'
import T from '@styles/text'
import { Image, Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import { useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'

export function AlbumImageViewer({
    imageUri,
    onClose,
    title,
}: {
    imageUri: string | null
    onClose: () => void
    title: string
}) {
    const [zoom, setZoom] = useState(1)
    const viewport = useWindowDimensions()
    const insets = useSafeAreaInsets()
    const controlsTop = insets.top + 56
    const viewerTop = controlsTop + 54
    const viewerHeight = Math.max(240, viewport.height - viewerTop - insets.bottom - 24)
    const imageSize = useMemo(() => ({
        width: viewport.width - 32,
        height: viewerHeight - 16,
    }), [viewerHeight, viewport.width])
    const scaledSize = {
        width: imageSize.width * zoom,
        height: imageSize.height * zoom,
    }

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
                    paddingTop: viewerTop,
                }}
            >
                <ScrollView
                    style={{ width: viewport.width, height: viewerHeight }}
                    contentContainerStyle={{
                        width: Math.max(viewport.width, scaledSize.width),
                        minHeight: Math.max(viewerHeight, scaledSize.height),
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    maximumZoomScale={5}
                    minimumZoomScale={1}
                    bouncesZoom
                    centerContent
                    showsHorizontalScrollIndicator={zoom > 1}
                    showsVerticalScrollIndicator={zoom > 1}
                    onScroll={(event) => {
                        const nextZoom = event.nativeEvent.zoomScale
                        if (nextZoom && Math.abs(nextZoom - zoom) > 0.05) {
                            setZoom(nextZoom)
                        }
                    }}
                    scrollEventThrottle={16}
                >
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri, cache: 'force-cache' }}
                            accessibilityLabel={title}
                            resizeMode='contain'
                            style={{
                                width: scaledSize.width,
                                height: scaledSize.height,
                                borderRadius: Math.max(8, 24 / zoom),
                            }}
                        />
                    ) : null}
                </ScrollView>
                <AlbumImageViewerActions
                    zoom={zoom}
                    top={controlsTop}
                    onClose={close}
                    onZoomIn={() => setZoom((value) => Math.min(5, value + 0.5))}
                    onZoomOut={() => setZoom((value) => Math.max(1, value - 0.5))}
                />
            </View>
        </Modal>
    )
}

function AlbumImageViewerActions({
    onClose,
    onZoomIn,
    onZoomOut,
    top,
    zoom,
}: {
    onClose: () => void
    onZoomIn: () => void
    onZoomOut: () => void
    top: number
    zoom: number
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            position: 'absolute',
            right: 18,
            top,
            zIndex: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        }}>
            <AlbumViewerButton label='-' testID='album-image-zoom-out' color={theme.textColor} onPress={onZoomOut} />
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
            <AlbumViewerButton label='+' testID='album-image-zoom-in' color={theme.orange} onPress={onZoomIn} />
            <AlbumViewerButton label='x' testID='album-image-close' color={theme.textColor} onPress={onClose} />
        </View>
    )
}

function AlbumViewerButton({
    color,
    label,
    onPress,
    testID,
}: {
    color: string
    label: string
    onPress: () => void
    testID: string
}) {
    return (
        <Pressable
            onPress={onPress}
            testID={testID}
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
            <Text style={{ ...T.text20, color }}>{label}</Text>
        </Pressable>
    )
}
