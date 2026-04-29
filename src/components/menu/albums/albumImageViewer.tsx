import Text from '@components/shared/text'
import { useSwipeNavigationLock } from '@components/nav/swipe'
import T from '@styles/text'
import { Image, Modal, PanResponder, Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { Minus, Plus, X } from 'lucide-react-native'

const MAX_ZOOM = 20
const SWIPE_DISTANCE = 20
const DISMISS_DISTANCE = 20

export function AlbumImageViewer({
    imageUri,
    imageUris = [],
    onChangeImage,
    onClose,
    onImageLoadEnd,
    title,
}: {
    imageUri: string | null
    imageUris?: string[]
    onChangeImage?: (uri: string) => void
    onClose: () => void
    onImageLoadEnd?: () => void
    title: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [zoom, setZoom] = useState(1)
    const horizontalScrollRef = useRef<ScrollView>(null)
    const verticalScrollRef = useRef<ScrollView>(null)
    const lastImageTap = useRef(0)
    const swipeNavigation = useSwipeNavigationLock()
    const viewport = useWindowDimensions()
    const insets = useSafeAreaInsets()
    const controlsTop = insets.top
    const viewerHeight = viewport.height
    const restingImageHeight = Math.max(240, viewport.height - controlsTop - 54 - insets.bottom - 24)
    const initialSize = useMemo(() => ({
        width: viewport.width * 0.82,
        height: restingImageHeight,
    }), [restingImageHeight, viewport.width])
    const scaledWidth = initialSize.width * zoom
    const scaledHeight = initialSize.height * zoom
    const currentIndex = Math.max(0, imageUri ? imageUris.indexOf(imageUri) : -1)
    const canNavigateImages = imageUris.length > 1 && currentIndex >= 0

    useEffect(() => {
        setZoom(1)
        lastImageTap.current = 0
    }, [imageUri])

    useEffect(() => {
        if (!imageUri) {
            return undefined
        }

        const centerFrame = requestAnimationFrame(() => {
            const x = Math.max(0, (scaledWidth - viewport.width) / 2)
            const y = Math.max(0, (scaledHeight - viewerHeight) / 2)

            horizontalScrollRef.current?.scrollTo({ x, animated: false })
            verticalScrollRef.current?.scrollTo({ y, animated: false })
        })

        return () => cancelAnimationFrame(centerFrame)
    }, [imageUri, scaledHeight, scaledWidth, viewerHeight, viewport.width, zoom])

    useEffect(() => {
        if (!imageUri) {
            return undefined
        }

        swipeNavigation.lock()
        return swipeNavigation.unlock
    }, [imageUri, swipeNavigation])

    function close() {
        setZoom(1)
        onClose()
    }

    function handleImagePress() {
        const now = Date.now()
        const isDoubleTap = now - lastImageTap.current < 280
        lastImageTap.current = now

        if (isDoubleTap) {
            setZoom((value) => value === 1 ? 2 : 1)
            lastImageTap.current = 0
        }
    }
    function showImageAtIndex(nextIndex: number) {
        if (!canNavigateImages) {
            return
        }

        const boundedIndex = Math.min(Math.max(nextIndex, 0), imageUris.length - 1)
        if (boundedIndex !== currentIndex) {
            onChangeImage?.(imageUris[boundedIndex])
        }
    }
    const panResponder = useMemo(() => PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) => {
            const horizontalSwipe = canNavigateImages
                && Math.abs(gesture.dx) > 10
                && Math.abs(gesture.dx) > Math.abs(gesture.dy)
            const downwardDismiss = zoom < 2
                && gesture.dy > 10
                && gesture.dy > Math.abs(gesture.dx)

            if ((gesture.dx <= -SWIPE_DISTANCE) && zoom < 2) {
                showImageAtIndex(currentIndex + 1)
            }
            if ((gesture.dx >= SWIPE_DISTANCE) && zoom < 2) {
                showImageAtIndex(currentIndex - 1)
            }

            if (
                zoom < 2
                && gesture.dy >= DISMISS_DISTANCE
                && gesture.dy > Math.abs(gesture.dx)
            ) {
                close()
                return true
            }
            return horizontalSwipe || downwardDismiss
        },
        onPanResponderRelease: () => {}
    }), [canNavigateImages, currentIndex, imageUris, zoom])

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
                {...panResponder.panHandlers}
            >
                <ScrollView
                    ref={horizontalScrollRef}
                    horizontal
                    style={{ width: viewport.width, height: viewerHeight }}
                    maximumZoomScale={1}
                    minimumZoomScale={1}
                    bouncesZoom={false}
                    centerContent
                    showsHorizontalScrollIndicator={zoom > 1}
                    showsVerticalScrollIndicator={zoom > 1}
                    contentContainerStyle={{
                        width: Math.max(viewport.width, scaledWidth),
                        height: viewerHeight,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ScrollView
                        ref={verticalScrollRef}
                        style={{
                            width: Math.max(viewport.width, scaledWidth),
                            height: viewerHeight,
                        }}
                        maximumZoomScale={1}
                        minimumZoomScale={1}
                        bouncesZoom={false}
                        centerContent
                        showsVerticalScrollIndicator={zoom > 1}
                        contentContainerStyle={{
                            minWidth: Math.max(viewport.width, scaledWidth),
                            minHeight: Math.max(viewerHeight, scaledHeight),
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {imageUri ? (
                            <Pressable
                                accessibilityRole='imagebutton'
                                accessibilityLabel={title}
                                onPress={handleImagePress}
                                style={{
                                    width: scaledWidth,
                                    height: scaledHeight,
                                    borderRadius: Math.max(8, 24 / zoom),
                                    overflow: 'hidden',
                                }}
                            >
                                <Image
                                    source={{ uri: imageUri, cache: 'force-cache' }}
                                    accessibilityLabel={title}
                                    onLoadEnd={onImageLoadEnd}
                                    resizeMode='contain'
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />
                            </Pressable>
                        ) : null}
                    </ScrollView>
                </ScrollView>
                <AlbumImageViewerActions
                    zoom={zoom}
                    top={controlsTop}
                    onClose={close}
                    onZoomIn={() => setZoom((value) => Math.min(MAX_ZOOM, value + 1))}
                    onZoomOut={() => setZoom((value) => Math.max(1, value - 0.5))}
                />
                {canNavigateImages ? (
                    <AlbumImageCounter
                        current={currentIndex + 1}
                        total={imageUris.length}
                        theme={theme}
                    />
                ) : null}
            </View>
        </Modal>
    )
}

function AlbumImageCounter({
    current,
    theme,
    total,
}: {
    current: number
    theme: Theme
    total: number
}) {
    const insets = useSafeAreaInsets()

    return (
        <View style={{
            position: 'absolute',
            right: 18,
            bottom: insets.bottom + 18,
            minWidth: 54,
            height: 34,
            borderRadius: 17,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.greyTransparent,
            borderWidth: 1,
            borderColor: theme.greyTransparentBorder,
        }}>
            <Text style={{ ...T.text12, color: theme.textColor }}>
                {current}/{total}
            </Text>
        </View>
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
            <AlbumViewerButton label='-' testID='album-image-zoom-out' theme={theme} onPress={onZoomOut} />
            <View style={{
                minWidth: 58,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.greyTransparent,
                borderWidth: 1,
                borderColor: theme.greyTransparentBorder,
            }}>
                <Text style={{ ...T.text12, color: theme.textColor }}>{Math.round(zoom * 100)}%</Text>
            </View>
            <AlbumViewerButton label='+' testID='album-image-zoom-in' theme={theme} onPress={onZoomIn} />
            <AlbumViewerButton label='x' testID='album-image-close' theme={theme} onPress={onClose} />
        </View>
    )
}

function AlbumViewerButton({
    theme,
    label,
    onPress,
    testID,
}: {
    theme: Theme
    label: string
    onPress: () => void
    testID: string
}) {

    function getLabel() {
        switch (label) {
            case 'x': return <X height={18} color={theme.orange} />
            case '+': return <Plus height={18} color={theme.orange} />
            case '-': return <Minus height={18} color={theme.orange} />
        }
    }

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
                backgroundColor: theme.greyTransparent,
                borderWidth: 1,
                borderColor: theme.greyTransparentBorder,
            }}
        >
            {getLabel()}
        </Pressable>
    )
}
