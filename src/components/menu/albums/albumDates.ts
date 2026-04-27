export function formatAlbumDate(value?: string | null) {
    if (!value) {
        return ''
    }

    const date = new Date(value)
    if (Number.isNaN(date.valueOf())) {
        return ''
    }

    return `${new Intl.DateTimeFormat('nb-NO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date)} - `
}

export function formatShortDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.valueOf())) {
        return value
    }

    return new Intl.DateTimeFormat('nb-NO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}
