import config from '@/constants'

export async function fetchAnnouncements(limit = 20): Promise<GetAnnouncementsProps> {
    try {
        const params = new URLSearchParams({ limit: String(limit), includePlaceholders: 'true' })
        const response = await fetch(`${config.tekkom_bot_api}/announcements?${params.toString()}`, {
            headers: { btg: 'tekkom-bot' },
        })
        if (!response.ok) throw new Error('Failed to fetch announcements')

        const data = await response.json()
        const announcements = Array.isArray(data) ? data : Array.isArray(data?.announcements) ? data.announcements : []
        const embeddedCount = announcements
            .map((announcement: BotAnnouncement) => Number(announcement?.total_count))
            .find((count: number) => Number.isFinite(count) && count >= announcements.length)
        const totalCount = typeof data?.total_count === 'number' ? data.total_count : embeddedCount ?? announcements.length

        return { announcements, total_count: totalCount }
    } catch {
        return { announcements: [], total_count: 0 }
    }
}

export async function fetchAnnouncementRoles(token?: string | null): Promise<BotRole[]> {
    if (!token) return []

    return await fetchBotDirectory('roles', token, normalizeAnnouncementRole)
}

export async function fetchAnnouncementChannels(token?: string | null): Promise<BotChannel[]> {
    if (!token) return []

    return await fetchBotDirectory('channels', token, normalizeAnnouncementChannel)
}

async function fetchBotDirectory<T>(
    key: 'roles' | 'channels',
    token: string,
    normalize: (value: unknown) => T | null
): Promise<T[]> {
    try {
        const response = await fetch(`${config.tekkom_bot_api}/${key}`, {
            headers: { Authorization: `Bearer ${token}`, btg: 'tekkom-bot' },
        })
        if (!response.ok) throw new Error(`Failed to fetch announcement ${key}`)

        const data = await response.json()
        const values: unknown[] = Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : []
        return values.map(normalize).filter((value): value is T => value !== null)
    } catch {
        return []
    }
}

function normalizeAnnouncementRole(role: unknown): BotRole | null {
    if (!role || typeof role !== 'object') return null

    const record = role as Record<string, unknown>
    const id = stringValue(record.id ?? record.roleID ?? record.roleId ?? record.value)
    const name = stringValue(record.name ?? record.label)
    const color = normalizeAnnouncementRoleColor(record.color ?? record.hexColor ?? record.roleColor)
    return id && name ? { id, name, color } : null
}

function normalizeAnnouncementChannel(channel: unknown): BotChannel | null {
    if (!channel || typeof channel !== 'object') return null

    const record = channel as Record<string, unknown>
    const id = stringValue(record.id ?? record.channelID ?? record.channelId ?? record.value)
    const name = stringValue(record.name ?? record.label)
    if (!id || !name) return null

    return {
        category: stringValue(record.category),
        guildId: stringValue(record.guildId ?? record.guildID),
        guildName: stringValue(record.guildName),
        id,
        name,
    }
}

function stringValue(value: unknown) {
    return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
}

function normalizeAnnouncementRoleColor(value: unknown) {
    const raw = stringValue(value)

    if (!raw) return '#fd8738'
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw
    if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`

    const decimal = Number(raw)
    if (Number.isFinite(decimal) && decimal > 0) {
        return `#${Math.trunc(decimal).toString(16).padStart(6, '0').slice(-6)}`
    }

    return '#fd8738'
}
