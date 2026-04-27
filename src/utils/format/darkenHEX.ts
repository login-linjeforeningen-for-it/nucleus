export default function darkenColor(hexColor: string, percent: number) {
    // Convert hex to RGB
    let r = parseInt(hexColor.slice(1, 3), 16)
    let g = parseInt(hexColor.slice(3, 5), 16)
    let b = parseInt(hexColor.slice(5, 7), 16)

    // Calculate the darkened values
    r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent / 100))))
    g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent / 100))))
    b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent / 100))))

    // Convert back to hex and return
    const toHex = (value: number) => value.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
