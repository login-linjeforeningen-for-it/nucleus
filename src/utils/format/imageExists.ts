// Checks if a resource exists in our CDN
export default async function imageExists(url: string) {
    if (!url.startsWith('http')) {
        return 404
    }

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Image does not exist: ${response.text()}`)
        }

        return response.status
    } catch {
        return 404
    }
}
