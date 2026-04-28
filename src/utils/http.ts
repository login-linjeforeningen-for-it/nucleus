export function parseResponseBody(raw: string) {
    if (!raw) {
        return null
    }

    try {
        return JSON.parse(raw)
    } catch {
        return raw
    }
}

export function getResponseErrorMessage(data: unknown) {
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
