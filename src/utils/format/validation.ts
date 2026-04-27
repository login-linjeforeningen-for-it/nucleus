const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'] as const

export function valid(token: string | null) {
    if (!token) {
        return false
    }

    const decoded = atob(token)
    const match = decoded.match(/[a-zA-Z]/)?.index || 0
    const valid = Number(decoded.slice(0, match - 1)) - new Date().getTime() < 28800000 ? 1 : 0
    return valid === Number(decoded[match - 1])
}

export function validFileType(url: string | undefined) {
    const normalized = url?.toLowerCase()
    return imageExtensions.some((extension) => normalized?.endsWith(extension))
}
