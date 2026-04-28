type RequestOptions = {
    timeoutMs?: number
}

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 5000)

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return await response.json() as T
    } finally {
        clearTimeout(timeout)
    }
}
