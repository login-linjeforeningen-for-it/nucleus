import config from '@/constants'
import { getResponseErrorMessage, parseResponseBody } from '@utils/http'

export async function fetchProfile(token: string): Promise<Profile> {
    const response = await fetch(`${config.app_api}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const raw = await response.text()
    const data = parseResponseBody(raw)

    if (!response.ok) {
        throw new Error(getResponseErrorMessage(data) || 'Could not load profile.')
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
