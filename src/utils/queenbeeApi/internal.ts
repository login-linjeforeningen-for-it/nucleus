import config from '@/constants'
import { isObject, requestApi } from './request'

export async function getInternalDashboard(): Promise<System> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/dashboard/internal')
    const dashboard = isObject(payload) ? payload : {}
    const information = isObject(dashboard.information) ? dashboard.information : {}
    const runtime = isObject(dashboard.runtime) ? dashboard.runtime : {}
    const systemInfo = isObject(information.system) ? information.system : {}
    const metrics = isObject(runtime.metrics) ? runtime.metrics : {}
    const metricsSystem = isObject(metrics.system) ? metrics.system : {}
    const docker = isObject(runtime.docker) ? runtime.docker : {}
    const containers = Number(
        docker.count
        ?? systemInfo.containers
        ?? (Array.isArray(docker.containers) ? docker.containers.length : 0)
    )

    return {
        ram: typeof systemInfo.ram === 'string' ? systemInfo.ram : `${formatBytes(Number(metricsSystem.memory || 0))}`,
        processes: Number(systemInfo.processes ?? metricsSystem.processes ?? 0),
        disk: typeof systemInfo.disk === 'string' ? systemInfo.disk : String(metricsSystem.disk ?? 'Unavailable'),
        load: typeof systemInfo.load === 'string'
            ? systemInfo.load
            : Array.isArray(metricsSystem.load)
                ? metricsSystem.load.join(', ')
                : 'Unavailable',
        containers: Number.isFinite(containers) ? containers : 0,
    }
}

export async function getInternalOverview(): Promise<NativeInternalOverview> {
    const payload = await requestApi<unknown>(config.beekeeper_api_url, '/dashboard/internal')
    const dashboard = isObject(payload) ? payload : {}
    const statistics = isObject(dashboard.statistics) ? dashboard.statistics : {}
    const runtime = isObject(dashboard.runtime) ? dashboard.runtime : {}
    const databaseOverview = isObject(runtime.databaseOverview)
        ? runtime.databaseOverview as GetDatabaseOverview
        : null
    const databaseCount = readNumber(statistics.databases)
        ?? readNumber(databaseOverview?.databaseCount)
        ?? null

    return {
        system: await getInternalDashboard(),
        requestsToday: Number(statistics.requestsToday || 0),
        databaseCount,
        databaseOverview,
    }
}

export async function getDatabaseOverview(): Promise<GetDatabaseOverview> {
    return await requestApi<GetDatabaseOverview>(config.internal_api_url, '/db')
}

export async function getDatabaseContainerCount(): Promise<number> {
    const payload = await requestApi<unknown>(config.internal_api_url, '/databases')
    if (!isObject(payload)) {
        return 0
    }

    return readNumber(payload.count) ?? readNumber(payload.databaseCount) ?? 0
}

export async function getVulnerabilitiesOverview(): Promise<GetVulnerabilities> {
    return await requestApi<GetVulnerabilities>(config.beekeeper_api_url, '/vulnerabilities')
}

export async function triggerVulnerabilityScan(): Promise<{ message: string, status: GetVulnerabilities['scanStatus'] }> {
    return await requestApi<{ message: string, status: GetVulnerabilities['scanStatus'] }>(
        config.beekeeper_api_url,
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
        config.beekeeper_api_url,
        suffix ? `/docker/logs?${suffix}` : '/docker/logs'
    )
}

function formatBytes(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return 'Unavailable'
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / Math.pow(1024, power)
    return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`
}

function readNumber(value: unknown) {
    const nextValue = Number(value)
    return Number.isFinite(nextValue) ? nextValue : null
}
