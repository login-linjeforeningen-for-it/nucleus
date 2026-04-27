import config from '@/constants'

export function resolveAssetUrl(url: string | null | undefined, folder: 'jobs' | 'organizations') {
    if (!url) {
        return ''
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    return `${config.cdn}/img/${folder}/${url.replace(/^\/+/, '')}`
}

export function resolveOrganizationLogo(url: string | null | undefined) {
    return resolveAssetUrl(url, 'organizations')
}

export function resolveJobBanner(url: string | null | undefined) {
    return resolveAssetUrl(url, 'jobs')
}

export function formatText(value: string | null | undefined) {
    return value ? value.replace(/\\n/g, '\n').trim() : ''
}

export function formatList(value: string[] | null | undefined) {
    if (!Array.isArray(value) || !value.length) {
        return ''
    }

    return value.join(', ')
}
