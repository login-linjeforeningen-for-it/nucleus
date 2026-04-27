import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { filterByContentQuery, formatContentDate } from '@utils/content'
import { copyToClipboard } from '@utils/general/clipboard'
import { fetchAnnouncementChannels, fetchAnnouncementRoles, fetchAnnouncements } from '@utils/fetch'
import { Check } from 'lucide-react-native'
import { JSX, useEffect, useMemo, useRef, useState } from 'react'
import { RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

const ANNOUNCEMENT_PAGE_SIZE = 20

export default function AnnouncementsScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { token } = useSelector((state: ReduxState) => state.login)
    const [announcements, setAnnouncements] = useState<BotAnnouncement[]>([])
    const [roles, setRoles] = useState<BotRole[]>([])
    const [channels, setChannels] = useState<BotChannel[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [limit, setLimit] = useState(ANNOUNCEMENT_PAGE_SIZE)
    const [query, setQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const labels = useMemo(() => ({
        search: lang ? 'Søk i kunngjøringer...' : 'Search announcements...',
        showing: lang ? 'Viser' : 'Showing',
        loadMore: lang ? 'Last inn mer' : 'Load more',
        empty: lang ? 'Ingen kunngjøringer funnet.' : 'No announcements found.',
        channel: lang ? 'Kanal' : 'Channel',
        roles: lang ? 'Roller' : 'Roles',
        scheduled: lang ? 'Planlagt' : 'Scheduled',
        lastSent: lang ? 'Sist sendt' : 'Last sent',
        active: lang ? 'Aktiv' : 'Active',
        inactive: lang ? 'Inaktiv' : 'Inactive',
        sent: lang ? 'Sendt' : 'Sent',
        pending: lang ? 'Venter' : 'Pending',
    }), [lang])

    const visibleAnnouncements = useMemo(() => filterByContentQuery(announcements, query, (announcement) => [
        announcement.id,
        announcement.title?.join(' '),
        announcement.description?.join(' '),
        announcement.channel,
        announcement.roles?.join(' '),
        announcement.interval,
        announcement.time,
        announcement.last_sent,
    ]), [announcements, query])

    async function load() {
        setRefreshing(true)
        try {
            const [payload, nextRoles, nextChannels] = await Promise.all([
                fetchAnnouncements(limit),
                fetchAnnouncementRoles(token),
                fetchAnnouncementChannels(token),
            ])
            setAnnouncements(payload.announcements)
            setTotalCount(payload.total_count)
            setRoles(nextRoles)
            setChannels(nextChannels)
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        void load()
    }, [limit, token])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => void load()}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <Cluster>
                        <View style={{ padding: 14 }}>
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder={labels.search}
                                placeholderTextColor={theme.oppositeTextColor}
                                autoCapitalize='none'
                                autoCorrect={false}
                                style={{
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: '#ffffff18',
                                    backgroundColor: theme.contrast,
                                    color: theme.textColor,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    fontSize: T.text15.fontSize,
                                }}
                            />
                            <Space height={10} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                {`${labels.showing} ${announcements.length} / ${totalCount}`}
                            </Text>
                        </View>
                    </Cluster>

                    <Space height={12} />
                    {visibleAnnouncements.length ? visibleAnnouncements.map((announcement) => (
                        <AnnouncementCard
                            key={announcement.id}
                            announcement={announcement}
                            labels={labels}
                            channels={channels}
                            roles={roles}
                        />
                    )) : (
                        <Cluster>
                            <View style={{ padding: 18, alignItems: 'center' }}>
                                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{labels.empty}</Text>
                            </View>
                        </Cluster>
                    )}

                    {announcements.length < totalCount && (
                        <TouchableOpacity
                            onPress={() => setLimit((currentLimit) => currentLimit + ANNOUNCEMENT_PAGE_SIZE)}
                            activeOpacity={0.88}
                        >
                            <Cluster>
                                <View style={{
                                    padding: 14,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: theme.orangeTransparentBorderHighlighted,
                                    backgroundColor: theme.orangeTransparent,
                                }}>
                                    <Text style={{ ...T.text15, color: theme.textColor }}>{labels.loadMore}</Text>
                                </View>
                            </Cluster>
                        </TouchableOpacity>
                    )}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function AnnouncementCard({
    announcement,
    labels,
    channels,
    roles,
}: {
    announcement: BotAnnouncement
    labels: Record<string, string>
    channels: BotChannel[]
    roles: BotRole[]
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const titles = announcement.title?.filter(Boolean) || []
    const descriptions = announcement.description?.filter(Boolean) || []
    const title = titles[0] || titles[1] || `#${announcement.id}`
    const scheduledTime = announcement.time ? formatContentDate(announcement.time) : '-'
    const lastSent = announcement.last_sent ? formatContentDate(announcement.last_sent) : '-'
    const statusTone = announcement.sent ? theme.orange : theme.oppositeTextColor
    const channel = resolveChannel(announcement.channel, channels)

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <View style={{
                        alignItems: 'flex-start',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: 10,
                    }}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                            <Space height={4} />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                    {`#${announcement.id} · ${labels.channel}:`}
                                </Text>
                                <CopyableChip
                                    label={channel.label}
                                    copyValue={`#${channel.id}`}
                                    color={theme.textColor}
                                    backgroundColor='rgba(255,255,255,0.06)'
                                />
                            </View>
                        </View>
                        <StatusPill label={announcement.sent ? labels.sent : labels.pending} active={!!announcement.sent} />
                    </View>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <StatusPill label={announcement.active ? labels.active : labels.inactive} active={!!announcement.active} subtle />
                        {!!announcement.interval && <MetaPill label={announcement.interval} />}
                        {!!announcement.embed && <MetaPill label='Embed' />}
                    </View>
                    {descriptions.length ? (
                        <>
                            <Space height={12} />
                            {descriptions.slice(0, 2).map((description, index) => (
                                <View
                                    key={`${announcement.id}-description-${index}`}
                                    style={{
                                        borderLeftWidth: 2,
                                        borderLeftColor: index === 0 ? theme.orange : '#ffffff20',
                                        paddingLeft: 10,
                                        marginBottom: index === descriptions.length - 1 ? 0 : 8,
                                    }}
                                >
                                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                        {index === 0 ? 'NO' : 'EN'}
                                    </Text>
                                    <Space height={3} />
                                    <Text style={{ ...T.text15, color: theme.textColor }} numberOfLines={5}>
                                        {description}
                                    </Text>
                                </View>
                            ))}
                        </>
                    ) : null}
                    <Space height={12} />
                    <InfoRow label={labels.roles}>
                        <RoleList roleIds={announcement.roles || []} roles={roles} />
                    </InfoRow>
                    <Space height={8} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <InfoChip label={labels.scheduled} value={scheduledTime} />
                        <InfoChip label={labels.lastSent} value={lastSent} valueColor={statusTone} />
                    </View>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function RoleList({ roleIds, roles }: { roleIds: string[]; roles: BotRole[] }) {
    if (!roleIds.length) {
        return <Text style={{ ...T.text12, color: '#ffffff80' }}>-</Text>
    }

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 }}>
            {roleIds.map((roleId, index) => (
                <RolePill key={`${roleId}-${index}`} roleId={roleId} roles={roles} />
            ))}
        </View>
    )
}

function RolePill({ roleId, roles }: { roleId: string; roles: BotRole[] }) {
    const normalizedRoleId = String(roleId)
    const role = roles.find((candidate) => candidate.id === normalizedRoleId)
    const color = normalizeRoleColor(role?.color)

    return (
        <CopyableChip
            label={`@${role?.name || 'Unknown role'}`}
            copyValue={`#${normalizedRoleId}`}
            color={color}
            backgroundColor={`${color}26`}
        />
    )
}

function CopyableChip({
    label,
    copyValue,
    color,
    backgroundColor,
}: {
    label: string
    copyValue: string
    color: string
    backgroundColor: string
}) {
    const [copied, setCopied] = useState(false)
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => () => {
        if (timeout.current) {
            clearTimeout(timeout.current)
        }
    }, [])

    function handleCopy() {
        copyToClipboard(copyValue)
        setCopied(true)

        if (timeout.current) {
            clearTimeout(timeout.current)
        }

        timeout.current = setTimeout(() => setCopied(false), 600)
    }

    return (
        <TouchableOpacity onPress={handleCopy} activeOpacity={0.82}>
            <View style={{
                alignItems: 'center',
                borderRadius: 6,
                backgroundColor,
                flexDirection: 'row',
                gap: 5,
                paddingHorizontal: 7,
                paddingVertical: 4,
            }}>
                <Text style={{ ...T.text12, color, fontWeight: '700' }}>
                    {label}
                </Text>
                {copied ? <Check color='#22c55e' size={12} strokeWidth={3} /> : null}
            </View>
        </TouchableOpacity>
    )
}

function InfoRow({ label, children }: { label: string; children: JSX.Element }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor, width: 58 }}>
                {label}
            </Text>
            {children}
        </View>
    )
}

function InfoChip({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 12,
            backgroundColor: '#ffffff08',
            borderWidth: 1,
            borderColor: '#ffffff12',
            paddingHorizontal: 10,
            paddingVertical: 7,
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={2} />
            <Text style={{ ...T.text12, color: valueColor || theme.textColor, fontWeight: '700' }}>
                {value}
            </Text>
        </View>
    )
}

function MetaPill({ label }: { label: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#ffffff16',
            backgroundColor: '#ffffff08',
            paddingHorizontal: 10,
            paddingVertical: 5,
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
        </View>
    )
}

function normalizeRoleColor(color?: string) {
    return /^#[0-9a-f]{6}$/i.test(color || '') ? color! : '#fd8738'
}

function resolveChannel(channelId: string | undefined, channels: BotChannel[]) {
    if (!channelId) {
        return {
            id: '',
            label: 'Unknown channel',
        }
    }

    const normalizedChannelId = String(channelId)
    const channel = channels.find((candidate) => candidate.id === normalizedChannelId)

    return {
        id: normalizedChannelId,
        label: `#${channel?.name || 'unknown-channel'}`,
    }
}

function StatusPill({ label, active, subtle = false }: { label: string; active: boolean; subtle?: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: active ? theme.orangeTransparentBorderHighlighted : '#ffffff18',
            backgroundColor: active
                ? theme.orangeTransparentHighlighted
                : subtle
                    ? '#ffffff08'
                    : theme.contrast,
            paddingHorizontal: 10,
            paddingVertical: 5,
        }}>
            <Text style={{ ...T.text12, color: active ? theme.textColor : theme.oppositeTextColor }}>
                {label}
            </Text>
        </View>
    )
}
