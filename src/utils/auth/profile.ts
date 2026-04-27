import config from '@/constants'

export async function fetchProfile(token: string): Promise<Profile> {
    const response = await fetch(`${config.app_api_url}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const raw = await response.text()
    const data = parseJson(raw)

    if (!response.ok) {
        throw new Error(getErrorMessage(data) || 'Could not load profile.')
    }

    return data as Profile
}

export function formatProfileDate(value: string | null, locale: string) {
    if (!value) {
        return null
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }

    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

function parseJson(raw: string) {
    if (!raw) {
        return null
    }

    try {
        return JSON.parse(raw)
    } catch {
        return raw
    }
}

function getErrorMessage(data: unknown) {
    if (!data) {
        return null
    }

    if (typeof data === 'string') {
        return data
    }

    if (typeof data === 'object') {
        const record = data as Record<string, unknown>
        return String(record.error || record.message || '')
    }

    return null
}
