import { useEffect, useMemo, useRef, useState } from "react"
import { Animated, Easing, Text, View } from "react-native"

type MarqueeProps = {
    children: string
    style?: object
    containerStyle?: object
    numberOfLines?: 1 | 2
}

export default function Marquee({
    children,
    style,
    containerStyle,
    numberOfLines = 1
}: MarqueeProps) {
    const translateX = useRef(new Animated.Value(0)).current
    const [containerWidth, setContainerWidth] = useState(0)
    const [singleLineWidth, setSingleLineWidth] = useState(0)
    const [measuredLineCount, setMeasuredLineCount] = useState(1)

    const lineHeight = typeof (style as { lineHeight?: number } | undefined)?.lineHeight === "number"
        ? (style as { lineHeight?: number }).lineHeight as number
        : typeof (style as { fontSize?: number } | undefined)?.fontSize === "number"
            ? ((style as { fontSize?: number }).fontSize as number) * 1.35
            : 20

    const targetWidth = useMemo(() => {
        if (numberOfLines === 1 || !containerWidth || !singleLineWidth) {
            return singleLineWidth
        }

        return Math.max(containerWidth, Math.ceil(singleLineWidth / numberOfLines) + 24)
    }, [containerWidth, numberOfLines, singleLineWidth])

    const shouldScroll = numberOfLines === 1
        ? targetWidth > containerWidth && containerWidth > 0
        : measuredLineCount > numberOfLines && targetWidth > containerWidth && containerWidth > 0
    const distance = Math.max(targetWidth - containerWidth, 0)
    const duration = useMemo(() => Math.max(5000, distance * 45), [distance])
    const containerHeight = lineHeight * numberOfLines

    useEffect(() => {
        translateX.stopAnimation()
        translateX.setValue(0)

        if (!shouldScroll) {
            return
        }

        const animation = Animated.loop(
            Animated.sequence([
                Animated.delay(1200),
                Animated.timing(translateX, {
                    toValue: -distance,
                    duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.delay(900),
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 1,
                    useNativeDriver: true,
                })
            ])
        )

        animation.start()
        return () => animation.stop()
    }, [distance, duration, shouldScroll, translateX])

    return (
        <View
            style={[{
                overflow: "hidden",
                width: "100%",
                minHeight: containerHeight,
                height: containerHeight,
            }, containerStyle]}
            onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        >
            <Text
                style={[style, {
                    position: "absolute",
                    opacity: 0,
                    left: -10000,
                    top: -10000,
                }]}
                numberOfLines={1}
                onLayout={(event) => setSingleLineWidth(event.nativeEvent.layout.width)}
            >
                {children}
            </Text>
            {containerWidth > 0 ? (
                <Text
                    style={[style, {
                        position: "absolute",
                        opacity: 0,
                        width: containerWidth,
                        left: -10000,
                        top: -10000,
                    }]}
                    onTextLayout={(event) => setMeasuredLineCount(event.nativeEvent.lines.length)}
                >
                    {children}
                </Text>
            ) : null}
            <Animated.Text
                style={[style, {
                    width: shouldScroll && targetWidth ? targetWidth : containerWidth || undefined,
                    transform: shouldScroll ? [{ translateX }] : undefined,
                }]}
            >
                {children}
            </Animated.Text>
        </View>
    )
}
