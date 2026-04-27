export function getBannerStyle(color?: string | null) {
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
