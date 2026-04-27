import formatValue from './formatValue'

export default function toField(
    lang: boolean,
    title: string,
    value: unknown,
    options: Pick<ProfileField, 'copyValue' | 'verified' | 'wrapEvery'> = {}
): ProfileField | null {
    const text = formatValue(value, lang)

    if (!text) {
        return null
    }

    return { title, text, ...options }
}
