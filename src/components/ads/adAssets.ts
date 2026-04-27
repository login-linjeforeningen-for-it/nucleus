import config from '@/constants'

export function resolveOrganizationLogo(url: string | undefined) {
    return resolveAssetUrl(url, 'organizations')
}

export function resolveJobBanner(url: string | undefined) {
    return resolveAssetUrl(url, 'jobs')
}

function resolveAssetUrl(url: string | undefined, folder: 'jobs' | 'organizations') {
    if (!url) {
        return ''
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    return `${config.cdn}/img/${folder}/${url.replace(/^\/+/, '')}`
}
