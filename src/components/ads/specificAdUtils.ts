import { resolveCdnAssetUrl } from '@utils/general'

export function resolveAssetUrl(url: string | null | undefined, folder: 'jobs' | 'organizations') {
    return resolveCdnAssetUrl(url, folder)
}

export function formatList(value: string[] | null | undefined) {
    if (!Array.isArray(value) || !value.length) {
        return ''
    }

    return value.join(', ')
}
