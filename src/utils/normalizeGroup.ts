export default function normalizeGroup(group: unknown) {
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
