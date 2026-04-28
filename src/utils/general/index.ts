import config from '@/constants'

type GetCategoriesProps = {
    lang: boolean
    categories: {
        no: string[]
        en: string[]
    }
}

export function capitalizeFirstLetter(word: string | undefined): string {
    return word ? `${word?.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}` : ''
}

export function getCategories({ lang, categories }: GetCategoriesProps) {
    if (lang && categories.no.length) {
        return categories.no
    }

    if (!lang && categories.en && categories.en.length) {
        return categories.en
    }

    return categories.no
}

export function getHeight(length: number) {
    return length > 9 ? 100 : length > 6 ? 90 : length > 3 ? 60 : 30
}

export function formatEscapedText(value: string | null | undefined) {
    return value ? value.replace(/\\n/g, '\n').trim() : ''
}

export function formatSourceLabel(source: string, fallback = '') {
    if (!source) {
        return fallback
    }

    return source
        .split('_')
        .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ')
}

export function formatAdditionAction(action: 'created' | 'updated') {
    return action === 'created' ? 'Created' : 'Updated'
}

export function resolveCdnAssetUrl(url: string | null | undefined, folder: string) {
    if (!url) {
        return ''
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    return `${config.cdn}/img/${folder}/${url.replace(/^\/+/, '')}`
}

export function formatNorwegianDate(
    value: string | null | undefined,
    options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' },
    fallback = ''
) {
    if (!value) {
        return fallback
    }

    const date = new Date(value)
    if (Number.isNaN(date.valueOf())) {
        return fallback || value
    }

    return new Intl.DateTimeFormat('nb-NO', options).format(date)
}

export function normalizeHexColor(value: unknown, fallback = '#fd8738') {
    const raw = typeof value === 'string' || typeof value === 'number' ? String(value) : ''

    if (!raw) return fallback
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw
    if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`

    const decimal = Number(raw)
    if (Number.isFinite(decimal) && decimal > 0) {
        return `#${Math.trunc(decimal).toString(16).padStart(6, '0').slice(-6)}`
    }

    return fallback
}
