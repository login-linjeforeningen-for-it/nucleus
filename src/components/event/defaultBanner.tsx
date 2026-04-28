import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'
import { BedpresBanner, CtfBanner, EventBanner, SocialBanner, TekkomBanner } from './defaultBannerIllustrations'

type DefaultBannerProps = {
    category: string | null | undefined
    color?: string | null
    height?: number
    borderRadius?: number
}

function getBannerStyle(color?: string | null) {
    const normalizedColor = typeof color === 'string' && isValidHex(color) ? color : '#7c7c7c'
    const [start, end] = createGradient(normalizedColor)

    return {
        colors: [start, end] as const,
        fill: adjustBrightnessHex(normalizedColor, -0.3) || '#ffffff',
    }
}

function isValidHex(hex: string) {
    return /^#([0-9A-F]{6})$/i.test(hex)
}

function hexToRgb(hex: string) {
    if (!isValidHex(hex)) {
        return { r: 0, g: 0, b: 0 }
    }

    const value = hex.replace('#', '')
    return {
        r: Number.parseInt(value.slice(0, 2), 16),
        g: Number.parseInt(value.slice(2, 4), 16),
        b: Number.parseInt(value.slice(4, 6), 16),
    }
}

function rgbToHex(r: number, g: number, b: number) {
    const toHex = (channel: number) => Math.round(channel).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function adjustBrightnessHex(hex: string, percent: number) {
    if (!isValidHex(hex)) {
        return null
    }

    const { r, g, b } = hexToRgb(hex)
    const factor = 1 + percent

    return rgbToHex(
        Math.max(0, Math.min(255, r * factor)),
        Math.max(0, Math.min(255, g * factor)),
        Math.max(0, Math.min(255, b * factor)),
    )
}

function createGradient(color: string) {
    if (!isValidHex(color)) {
        return [color, color] as const
    }

    return [
        adjustBrightnessHex(color, 0.14) || color,
        adjustBrightnessHex(color, -0.12) || color,
    ] as const
}

export default function DefaultBanner({
    category,
    color,
    height = 170,
    borderRadius = 18,
}: DefaultBannerProps) {
    const normalized = category?.toLowerCase() || ''
    const style = getBannerStyle(color || undefined)

    let content = <EventBanner fill={style.fill} />

    if (normalized === 'sosialt' || normalized === 'social' || normalized === 'evntkom') {
        content = <SocialBanner fill={style.fill} />
    } else if (normalized === 'tekkom') {
        content = <TekkomBanner fill={style.fill} />
    } else if (normalized === 'ctf') {
        content = <CtfBanner fill={style.fill} />
    } else if (normalized === 'bedkom' || normalized === 'bedpres') {
        content = <BedpresBanner fill={style.fill} />
    }

    return (
        <BannerFrame colors={style.colors} borderRadius={borderRadius} height={height}>
            <View style={{ width: '100%', height: '100%' }}>
                {content}
            </View>
        </BannerFrame>
    )
}

function BannerFrame({
    colors,
    borderRadius,
    height,
    children,
}: React.PropsWithChildren<{ colors: readonly [string, string], borderRadius: number, height: number }>) {
    return (
        <LinearGradient
            colors={[colors[0], colors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                width: '100%',
                height,
                borderRadius,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {children}
        </LinearGradient>
    )
}
