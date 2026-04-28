import config from '@/constants'
import { formatAvailableBytes } from './databaseFormatting'
import { isObject, requestApi } from './request'

export async function getInternalDashboard(): Promise<System> {
    const [payload, dockerPayload] = await Promise.all([
        requestApi<unknown>(config.beekeeper_api, '/dashboard/internal'),
        requestApi<unknown>(config.beekeeper_api, '/docker').catch(() => null),
    ])

    return buildSystem(payload, dockerPayload)
}

export async function getInternalOverview(): Promise<NativeInternalOverview> {
    const [payload, dockerPayload] = await Promise.all([
        requestApi<unknown>(config.beekeeper_api, '/dashboard/internal'),
        requestApi<unknown>(config.beekeeper_api, '/docker').catch(() => null),
    ])
    const dashboard = isObject(payload) ? payload : {}
    const statistics = isObject(dashboard.statistics) ? dashboard.statistics : {}
    const runtime = isObject(dashboard.runtime) ? dashboard.runtime : {}
    const databaseOverview = isObject(runtime.databaseOverview)
        ? runtime.databaseOverview as GetDatabaseOverview
        : null
    const databaseCount = readNumber(databaseOverview?.databaseCount)
        ?? readNumber(statistics.databases)
        ?? null

    return {
        system: buildSystem(payload, dockerPayload),
        requestsToday: Number(statistics.requestsToday || 0),
        databaseCount,
        databaseOverview,
    }
}

function buildSystem(payload: unknown, dockerPayload: unknown): System {
    const dashboard = isObject(payload) ? payload : {}
    const information = isObject(dashboard.information) ? dashboard.information : {}
    const runtime = isObject(dashboard.runtime) ? dashboard.runtime : {}
    const systemInfo = isObject(information.system) ? information.system : {}
    const metrics = isObject(runtime.metrics) ? runtime.metrics : {}
    const metricsSystem = isObject(metrics.system) ? metrics.system : {}
    const runtimeDocker = isObject(runtime.docker) ? runtime.docker : {}
    const docker = isObject(dockerPayload) ? dockerPayload : runtimeDocker
    const dockerContainers = Array.isArray(docker.containers) ? docker.containers.length : null
    const containers = readNumber(docker.count)
        ?? readNumber(systemInfo.containers)
        ?? dockerContainers
        ?? 0

    return {
        ram: typeof systemInfo.ram === 'string'
            ? systemInfo.ram
            : formatAvailableBytes(Number(metricsSystem.memory || 0)),
        processes: Number(systemInfo.processes ?? metricsSystem.processes ?? 0),
        disk: typeof systemInfo.disk === 'string' ? systemInfo.disk : String(metricsSystem.disk ?? 'Unavailable'),
        load: typeof systemInfo.load === 'string'
            ? systemInfo.load
            : Array.isArray(metricsSystem.load)
                ? metricsSystem.load.join(', ')
                : 'Unavailable',
        containers,
    }
}

export async function getDatabaseOverview(): Promise<GetDatabaseOverview> {
    return await requestApi<GetDatabaseOverview>(config.beekeeper_api, '/db')
}

export async function getDatabaseContainerCount(): Promise<number> {
    const payload = await getDatabaseOverview()
    return readNumber(payload.databaseCount) ?? 0
}

export async function listDatabaseBackups(): Promise<NativeDatabaseBackup[]> {
    const payload = await requestApi<unknown>(config.beekeeper_api, '/backup')
    return Array.isArray(payload) ? payload.filter(isDatabaseBackup) : []
}

export async function triggerDatabaseBackup(): Promise<{ message: string }> {
    return await requestApi<{ message: string }>(config.beekeeper_api, '/backup', {
        method: 'POST',
        body: {},
    })
}

export async function listDatabaseBackupFiles(params?: {
    service?: string
    date?: string
}): Promise<NativeDatabaseBackupFile[]> {
    const query = new URLSearchParams()
    if (params?.service) query.set('service', params.service)
    if (params?.date) query.set('date', params.date)

    const suffix = query.toString()
    const payload = await requestApi<unknown>(
        config.beekeeper_api,
        suffix ? `/backup/files?${suffix}` : '/backup/files',
    )
    return Array.isArray(payload) ? payload.filter(isDatabaseBackupFile) : []
}

export async function restoreDatabaseBackup(body: {
    service: string
    file: string
}): Promise<{ message: string }> {
    return await requestApi<{ message: string }>(config.beekeeper_api, '/backup/restore', {
        method: 'POST',
        body,
    })
}

export async function getVulnerabilitiesOverview(): Promise<GetVulnerabilities> {
    const payload = await requestApi<unknown>(config.beekeeper_api, '/vulnerabilities')
    if (!isVulnerabilityPayload(payload)) {
        throw new Error('The vulnerability API returned an unexpected response.')
    }

    return payload
}

export async function getScoutOverview(): Promise<ScoutOverview> {
    const payload = await requestApi<unknown>(config.beekeeper_api, '/scout')
    if (!isScoutPayload(payload)) {
        throw new Error('The scout API returned an unexpected response.')
    }

    return payload
}

export async function triggerVulnerabilityScan(): Promise<{ message: string, status: GetVulnerabilities['scanStatus'] }> {
    return await requestApi<{ message: string, status: GetVulnerabilities['scanStatus'] }>(
        config.beekeeper_api,
        '/vulnerabilities/scan',
        {
            method: 'POST',
            body: {}
        }
    )
}

export async function getInternalLogs(params?: {
    service?: string
    search?: string
    level?: 'all' | 'error'
    tail?: number
}) {
    const query = new URLSearchParams()

    if (params?.service) query.set('service', params.service)
    if (params?.search) query.set('search', params.search)
    if (params?.level) query.set('level', params.level)
    if (params?.tail) query.set('tail', String(params.tail))

    const suffix = query.toString()
    return await requestApi<LogsPayload>(
        config.beekeeper_api,
        suffix ? `/docker/logs?${suffix}` : '/docker/logs'
    )
}

function readNumber(value: unknown) {
    const nextValue = Number(value)
    return Number.isFinite(nextValue) ? nextValue : null
}

function isDatabaseBackup(value: unknown): value is NativeDatabaseBackup {
    return isObject(value)
        && typeof value.id === 'string'
        && typeof value.name === 'string'
        && typeof value.status === 'string'
}

function isDatabaseBackupFile(value: unknown): value is NativeDatabaseBackupFile {
    return isObject(value)
        && typeof value.service === 'string'
        && typeof value.file === 'string'
}

function isVulnerabilityPayload(value: unknown): value is GetVulnerabilities {
    return isObject(value)
        && Array.isArray(value.images)
        && isObject(value.scanStatus)
}

function isScoutPayload(value: unknown): value is ScoutOverview {
    return isObject(value)
        && isObject(value.projects)
}
