export function formatBytes(bytes: number) {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / Math.pow(1024, power)
    return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`
}

export function formatDuration(seconds: number | null) {
    if (seconds === null || seconds === undefined) {
        return 'No active queries'
    }

    if (seconds < 1) {
        return '<1s'
    }

    if (seconds < 60) {
        return `${Math.round(seconds)}s`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
}

export function getStatusColor(status: string) {
    const normalized = status.toLowerCase()
    if (normalized.includes('healthy') || normalized.includes('running') || normalized.includes('up')) {
        return '#4ade80'
    }
    if (normalized.includes('warn') || normalized.includes('degraded')) {
        return '#facc15'
    }
    if (normalized.includes('error') || normalized.includes('down') || normalized.includes('failed')) {
        return '#fb7185'
    }

    return '#fd8738'
}
