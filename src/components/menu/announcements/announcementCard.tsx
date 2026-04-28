import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { filterByContentQuery, formatContentDate } from '@utils/content/content'
import { normalizeHexColor } from '@utils/general'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { CopyableChip, InfoChip, InfoRow, MetaPill, StatusPill } from './announcementPrimitives'

export type AnnouncementLabels = Record<string, string>

export function filterAnnouncements(announcements: BotAnnouncement[], query: string) {
    return filterByContentQuery(announcements, query, (announcement) => [
        announcement.id,
        announcement.title?.join(' '),
        announcement.description?.join(' '),
        announcement.channel,
        announcement.roles?.join(' '),
        announcement.interval,
        announcement.time,
        announcement.last_sent,
    ])
}

export default function AnnouncementCard({
    announcement,
    labels,
    channels,
    roles,
}: {
    announcement: BotAnnouncement
    labels: AnnouncementLabels
    channels: BotChannel[]
    roles: BotRole[]
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const titles = announcement.title?.filter(Boolean) || []
    const descriptions = announcement.description?.filter(Boolean) || []
    const title = titles[0] || titles[1] || `#${announcement.id}`
    const scheduledTime = announcement.time ? formatContentDate(announcement.time) : '-'
    const lastSent = announcement.last_sent ? formatContentDate(announcement.last_sent) : '-'
    const channel = resolveChannel(announcement.channel, channels)

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <AnnouncementHeader
                        announcement={announcement}
                        channel={channel}
                        labels={labels}
                        title={title}
                    />
                    <Space height={10} />
                    <AnnouncementMeta announcement={announcement} labels={labels} />
                    <Descriptions descriptions={descriptions} id={String(announcement.id)} />
                    <Space height={12} />
                    <InfoRow label={labels.roles}>
                        <RoleList roleIds={announcement.roles || []} roles={roles} />
                    </InfoRow>
                    <Space height={8} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <InfoChip label={labels.scheduled} value={scheduledTime} />
                        <InfoChip
                            label={labels.lastSent}
                            value={lastSent}
                            valueColor={announcement.sent ? theme.orange : theme.oppositeTextColor}
                        />
                    </View>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function AnnouncementHeader({
    announcement,
    channel,
    labels,
    title,
}: {
    announcement: BotAnnouncement
    channel: { id: string, label: string }
    labels: AnnouncementLabels
    title: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
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
    )
}

function AnnouncementMeta({ announcement, labels }: { announcement: BotAnnouncement, labels: AnnouncementLabels }) {
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <StatusPill label={announcement.active ? labels.active : labels.inactive} active={!!announcement.active} subtle />
            {!!announcement.interval && <MetaPill label={announcement.interval} />}
            {!!announcement.embed && <MetaPill label='Embed' />}
        </View>
    )
}

function Descriptions({ descriptions, id }: { descriptions: string[], id: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    if (!descriptions.length) return null

    return (
        <>
            <Space height={12} />
            {descriptions.slice(0, 2).map((description, index) => (
                <View key={`${id}-description-${index}`} style={{
                    borderLeftWidth: 2,
                    borderLeftColor: index === 0 ? theme.orange : '#ffffff20',
                    paddingLeft: 10,
                    marginBottom: index === descriptions.length - 1 ? 0 : 8,
                }}>
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{index === 0 ? 'NO' : 'EN'}</Text>
                    <Space height={3} />
                    <Text style={{ ...T.text15, color: theme.textColor }} numberOfLines={5}>{description}</Text>
                </View>
            ))}
        </>
    )
}

function RoleList({ roleIds, roles }: { roleIds: string[]; roles: BotRole[] }) {
    if (!roleIds.length) return <Text style={{ ...T.text12, color: '#ffffff80' }}>-</Text>

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 }}>
            {roleIds.map((roleId, index) => <RolePill key={`${roleId}-${index}`} roleId={roleId} roles={roles} />)}
        </View>
    )
}

function RolePill({ roleId, roles }: { roleId: string; roles: BotRole[] }) {
    const normalizedRoleId = String(roleId)
    const role = roles.find((candidate) => candidate.id === normalizedRoleId)
    const color = normalizeHexColor(role?.color)

    return <CopyableChip label={`@${role?.name || 'Unknown role'}`} copyValue={`#${normalizedRoleId}`} color={color} backgroundColor={`${color}26`} />
}

function resolveChannel(channelId: string | undefined, channels: BotChannel[]) {
    if (!channelId) return { id: '', label: 'Unknown channel' }
    const normalizedChannelId = String(channelId)
    const channel = channels.find((candidate) => candidate.id === normalizedChannelId)
    return { id: normalizedChannelId, label: `#${channel?.name || 'unknown-channel'}` }
}
