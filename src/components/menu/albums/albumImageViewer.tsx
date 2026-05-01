import Text from '@components/shared/text'
import { useSwipeNavigationLock } from '@components/nav/swipe'
import T from '@styles/text'
import { Image, Modal, PanResponder, Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { Minus, Plus, RotateCcw, X } from 'lucide-react-native'

const MAX_ZOOM = 20
const SWIPE_DISTANCE = 10
const DISMISS_DISTANCE = 10
const VIEWPORT_CENTER = 'viewport-center'

type ZoomAnchor = {
    x: number
    y: number
}

export function AlbumImageViewer({
    footer,
    imageUri,
    imageUris = [],
    onChangeImage,
    onClose,
    onImageLoadEnd,
    title,
}: {
    footer?: ReactNode
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
    const pinchStartZoom = useRef(1)
    const currentZoom = useRef(1)
    const scrollOffset = useRef({ x: 0, y: 0 })
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
        pinchStartZoom.current = 1
        currentZoom.current = 1
        scrollOffset.current = { x: 0, y: 0 }
        lastImageTap.current = 0
    }, [imageUri])

    useEffect(() => {
        if (!imageUri) {
            return undefined
        }

        const centerFrame = requestAnimationFrame(() => {
            const x = Math.max(0, (initialSize.width - viewport.width) / 2)
            const y = Math.max(0, (initialSize.height - viewerHeight) / 2)

            horizontalScrollRef.current?.scrollTo({ x, animated: false })
            verticalScrollRef.current?.scrollTo({ y, animated: false })
            scrollOffset.current = { x, y }
        })

        return () => cancelAnimationFrame(centerFrame)
    }, [imageUri, initialSize.height, initialSize.width, viewerHeight, viewport.width])

    useEffect(() => {
        if (!imageUri) {
            return undefined
        }

        swipeNavigation.lock()
        return swipeNavigation.unlock
    }, [imageUri, swipeNavigation])

    function close() {
        setZoom(1)
        pinchStartZoom.current = 1
        currentZoom.current = 1
        scrollOffset.current = { x: 0, y: 0 }
        onClose()
    }

    const applyZoom = useCallback((value: number, anchor: ZoomAnchor | typeof VIEWPORT_CENTER = VIEWPORT_CENTER) => {
        const oldZoom = currentZoom.current
        const nextZoom = Math.min(MAX_ZOOM, Math.max(1, value))

        if (nextZoom === oldZoom) {
            return
        }

        const anchorPoint = anchor === VIEWPORT_CENTER
            ? { x: viewport.width / 2, y: viewerHeight / 2 }
            : {
                x: Math.min(Math.max(anchor.x, 0), viewport.width),
                y: Math.min(Math.max(anchor.y, 0), viewerHeight),
            }
        const oldContent = {
            width: Math.max(viewport.width, initialSize.width * oldZoom),
            height: Math.max(viewerHeight, initialSize.height * oldZoom),
        }
        const newContent = {
            width: Math.max(viewport.width, initialSize.width * nextZoom),
            height: Math.max(viewerHeight, initialSize.height * nextZoom),
        }
        const nextOffset = {
            x: clamp(
                ((scrollOffset.current.x + anchorPoint.x) / oldContent.width) * newContent.width - anchorPoint.x,
                0,
                Math.max(0, newContent.width - viewport.width),
            ),
            y: clamp(
                ((scrollOffset.current.y + anchorPoint.y) / oldContent.height) * newContent.height - anchorPoint.y,
                0,
                Math.max(0, newContent.height - viewerHeight),
            ),
        }

        currentZoom.current = nextZoom
        setZoom(nextZoom)

        requestAnimationFrame(() => {
            horizontalScrollRef.current?.scrollTo({ x: nextOffset.x, animated: false })
            verticalScrollRef.current?.scrollTo({ y: nextOffset.y, animated: false })
            scrollOffset.current = nextOffset
        })
    }, [initialSize.height, initialSize.width, viewerHeight, viewport.width])

    const resetZoom = useCallback(() => {
        currentZoom.current = 1
        pinchStartZoom.current = 1
        setZoom(1)

        requestAnimationFrame(() => {
            const x = Math.max(0, (initialSize.width - viewport.width) / 2)
            const y = Math.max(0, (initialSize.height - viewerHeight) / 2)

            horizontalScrollRef.current?.scrollTo({ x, animated: false })
            verticalScrollRef.current?.scrollTo({ y, animated: false })
            scrollOffset.current = { x, y }
        })
    }, [initialSize.height, initialSize.width, viewerHeight, viewport.width])

    function handleImagePress() {
        const now = Date.now()
        const isDoubleTap = now - lastImageTap.current < 280
        lastImageTap.current = now

        if (isDoubleTap) {
            applyZoom(zoom === 1 ? 2 : 1, VIEWPORT_CENTER)
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
        onMoveShouldSetPanResponderCapture: (event, gesture) => {
            if (event.nativeEvent.touches.length > 1) {
                return false
            }

            const horizontalSwipe = zoom < 2
                && canNavigateImages
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

    const pinchGesture = useMemo(() => Gesture.Pinch()
        .onBegin(() => {
            pinchStartZoom.current = currentZoom.current
        })
        .onUpdate((event) => {
            applyZoom(pinchStartZoom.current * event.scale, {
                x: event.focalX,
                y: event.focalY,
            })
        })
        .onEnd(() => {
            pinchStartZoom.current = currentZoom.current
        })
        .runOnJS(true), [applyZoom])

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
                    scrollEventThrottle={16}
                    onScroll={(event) => {
                        scrollOffset.current.x = event.nativeEvent.contentOffset.x
                    }}
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
                        scrollEventThrottle={16}
                        onScroll={(event) => {
                            scrollOffset.current.y = event.nativeEvent.contentOffset.y
                        }}
                        contentContainerStyle={{
                            minWidth: Math.max(viewport.width, scaledWidth),
                            minHeight: Math.max(viewerHeight, scaledHeight),
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {imageUri ? (
                            <GestureDetector gesture={pinchGesture}>
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
                            </GestureDetector>
                        ) : null}
                    </ScrollView>
                </ScrollView>
                <AlbumImageViewerActions
                    zoom={zoom}
                    top={controlsTop}
                    onClose={close}
                    onResetZoom={resetZoom}
                    onZoomIn={() => applyZoom(zoom + 1)}
                    onZoomOut={() => applyZoom(zoom - 0.5)}
                />
                {footer ? (
                    <View style={{
                        position: 'absolute',
                        left: 18,
                        right: canNavigateImages ? 90 : 18,
                        bottom: insets.bottom + 18,
                        zIndex: 10,
                    }}>
                        {footer}
                    </View>
                ) : null}
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

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
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
    onResetZoom,
    onZoomIn,
    onZoomOut,
    top,
    zoom,
}: {
    onClose: () => void
    onResetZoom: () => void
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
            <AlbumViewerButton label='reset' testID='album-image-reset-zoom' theme={theme} onPress={onResetZoom} />
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
            case 'reset': return <RotateCcw height={17} color={theme.orange} />
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
