import Text from '@components/shared/text'
import T from '@styles/text'
import { Image, Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import { useMemo, useState } from 'react'
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
                    style={{ flex: 1, width: viewport.width, height: viewport.height }}
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
                <AlbumImageViewerActions
                    zoom={zoom}
                    onClose={close}
                    onZoomIn={() => setZoom((value) => Math.min(5, value + 1))}
                    onZoomOut={() => setZoom((value) => Math.max(1, value - 1))}
                />
            </View>
        </Modal>
    )
}

function AlbumImageViewerActions({
    onClose,
    onZoomIn,
    onZoomOut,
    zoom,
}: {
    onClose: () => void
    onZoomIn: () => void
    onZoomOut: () => void
    zoom: number
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            position: 'absolute',
            right: 18,
            top: 18,
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
