export default function formatBoolean(value: boolean | null | undefined, lang: boolean) {
    if (typeof value !== 'boolean') {
        return lang ? 'Ukjent' : 'Unknown'
    }

    return value ? (lang ? 'Ja' : 'Yes') : 'No'
}
