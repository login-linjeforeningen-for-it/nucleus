export const SEVERITY_ORDER: SeverityLevel[] = ['critical', 'high', 'medium', 'low', 'unknown']

export function severityColor(level: SeverityLevel) {
    if (level === 'critical') return 'rgba(255, 107, 107, 0.14)'
    if (level === 'high') return 'rgba(255, 160, 67, 0.14)'
    if (level === 'medium') return 'rgba(255, 214, 102, 0.14)'
    if (level === 'low') return 'rgba(90, 200, 250, 0.14)'
    return 'rgba(255,255,255,0.05)'
}

export function severityBorder(level: SeverityLevel) {
    if (level === 'critical') return 'rgba(255, 107, 107, 0.24)'
    if (level === 'high') return 'rgba(255, 160, 67, 0.24)'
    if (level === 'medium') return 'rgba(255, 214, 102, 0.24)'
    if (level === 'low') return 'rgba(90, 200, 250, 0.24)'
    return 'rgba(255,255,255,0.08)'
}

export function severityTitle(level: SeverityLevel) {
    return level.charAt(0).toUpperCase() + level.slice(1)
}

export function emptySeverity(): SeverityCount {
    return {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        unknown: 0,
    }
}

export function formatScanStatus(scanStatus?: DockerScoutScanStatus) {
    if (!scanStatus) {
        return 'No scan status available yet'
    }

    if (scanStatus.isRunning) {
        const progress = scanStatus.totalImages
            ? `${scanStatus.completedImages}/${scanStatus.totalImages}`
            : `${scanStatus.completedImages}`

        return `Scanning now · ${progress}${scanStatus.currentImage ? ` · ${scanStatus.currentImage}` : ''}`
    }

    if (scanStatus.lastError) {
        return `Last scan error: ${scanStatus.lastError}`
    }

    if (scanStatus.lastSuccessAt) {
        return `Last successful scan ${formatDateTime(scanStatus.lastSuccessAt)}`
    }

    return 'Ready to run a vulnerability scan'
}

export function formatDateTime(value: string | null) {
    if (!value) {
        return 'Unknown'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString()
}
