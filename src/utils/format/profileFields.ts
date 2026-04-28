export function formatValue(value: unknown, lang: boolean) {
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

export function normalizeGroup(group: unknown) {
    if (typeof group === 'string') {
        return group
    }

    if (group && typeof group === 'object') {
        const record = group as Record<string, unknown>
        const value = record.name || record.group_name || record.group || record.slug || record.pk
        return value === undefined || value === null ? '' : String(value)
    }

    return ''
}

export function toField(
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
