export default function formatValue(value: unknown, lang: boolean) {
    if (value === null || typeof value === 'undefined') {
        return null
    }

    if (typeof value === 'boolean') {
        return value
            ? lang
                ? 'Ja' : 'Yes'
            : lang
                ? 'Nei' : 'No'
    }

    if (typeof value === 'number') {
        return String(value)
    }

    if (typeof value === 'string') {
        return value.trim() || null
    }

    return null
}
