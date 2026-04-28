import { toRecord } from '@utils/http'

export function getDatabaseCount(...sources: unknown[]) {
    const counts = sources
        .flatMap((source) => getDatabaseCountsFromSource(source))
        .filter((count): count is number => count !== null)

    return counts.length ? Math.max(...counts) : null
}

export function getDatabaseSize(source: GetDatabaseOverview | null) {
    return source ? readNumber(source.totalSizeBytes) : null
}

export function getClusterDatabaseCount(cluster: unknown) {
    const record = toRecord(cluster)
    if (!record) {
        return 0
    }

    return Math.max(
        readNumber(record.databaseCount) || 0,
        toArray(record.databases).length
    )
}

export function getVulnerabilitySummary(dockerSource: GetVulnerabilities | null, scoutSource: ScoutOverview | null): SnapshotSummary | null {
    const dockerFindings = getDockerVulnerabilityFindings(dockerSource)
    const scoutFindings = getScoutVulnerabilityFindings(scoutSource)
    const hasFindingsSource = dockerFindings.findings !== null || scoutFindings.findings !== null
    if (!hasFindingsSource) {
        return null
    }

    const findings = Math.max(
        dockerFindings.findings ?? 0,
        scoutFindings.findings ?? 0
    )

    if (
        scoutFindings.projects !== null
        && scoutFindings.findings !== null
        && (scoutFindings.projects > 0 || scoutFindings.findings > 0)
    ) {
        return {
            value: `${scoutFindings.projects} projects`,
            subvalue: `${findings} findings`,
        }
    }

    return {
        value: `${dockerFindings.images ?? 0} images`,
        subvalue: `${findings} findings`,
    }
}

export async function loadDashboardPart<T>(
    request: () => Promise<T>,
    update: (value: T) => void,
    errors: string[],
    finishRequest: () => void
) {
    try {
        update(await request())
    } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Failed to load Queenbee data.')
    } finally {
        finishRequest()
    }
}

function getDatabaseCountsFromSource(source: unknown): (number | null)[] {
    const records = findRecords(source)
    if (!records.length) {
        return [readNumber(source)]
    }

    return records.flatMap((record) => {
        const clusters = toArray(record.clusters)
        const clusterTotal = clusters.reduce<number>(
            (sum, cluster) => sum + getClusterDatabaseCount(cluster),
            0
        )
        const databases = toArray(record.databases)

        return [
            readNumber(record.databaseCount),
            readNumber(record.count),
            databases.length ? databases.length : null,
            clusterTotal || null,
        ]
    })
}

function getDockerVulnerabilityFindings(source: GetVulnerabilities | null) {
    if (!source || !Array.isArray(source.images)) {
        return { images: null, findings: null }
    }

    const images = readNumber(source.imageCount) ?? source.images.length
    const findings = source.images.reduce(
        (sum, image) => sum + (readNumber(image.totalVulnerabilities) ?? 0),
        0
    )

    return { images, findings }
}

function getScoutVulnerabilityFindings(source: ScoutOverview | null) {
    const projectFindings = source?.projects.result?.findings
    if (!Array.isArray(projectFindings)) {
        return { projects: null, findings: null }
    }

    const findings = projectFindings.reduce(
        (sum, finding) => sum + getScoutFindingCount(finding),
        0
    )

    return { projects: projectFindings.length, findings }
}

function getScoutFindingCount(finding: ScoutProjectFinding) {
    const vulnerabilities = finding.vulnerabilities

    return (readNumber(vulnerabilities.critical) ?? 0)
        + (readNumber(vulnerabilities.high) ?? 0)
        + (readNumber(vulnerabilities.moderate) ?? 0)
        + (readNumber(vulnerabilities.medium) ?? 0)
        + (readNumber(vulnerabilities.low) ?? 0)
        + (readNumber(vulnerabilities.info) ?? 0)
}

function findRecords(source: unknown) {
    const queue = [source]
    const visited = new Set<unknown>()
    const records: Record<string, unknown>[] = []

    while (queue.length) {
        const current = queue.shift()
        const record = toRecord(current)
        if (!record || visited.has(record)) {
            continue
        }

        visited.add(record)
        records.push(record)

        for (const value of Object.values(record)) {
            if (toRecord(value)) {
                queue.push(value)
            }
        }
    }

    return records
}

function toArray(value: unknown): unknown[] {
    if (Array.isArray(value)) {
        return value
    }

    const record = toRecord(value)
    return record ? Object.values(record) : []
}

function readNumber(value: unknown): number | null {
    const nextValue = Number(value)
    return Number.isFinite(nextValue) ? nextValue : null
}
