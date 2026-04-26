import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { filterByContentQuery, formatContentDate } from '@utils/content'
import { fetchAnnouncements } from '@utils/fetch'
import { JSX, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

const ANNOUNCEMENT_PAGE_SIZE = 20

export default function AnnouncementsScreen({ navigation }: MenuProps<'AnnouncementsScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [announcements, setAnnouncements] = useState<BotAnnouncement[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [limit, setLimit] = useState(ANNOUNCEMENT_PAGE_SIZE)
    const [query, setQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const labels = useMemo(() => ({
        title: lang ? 'Kunngjøringer' : 'Announcements',
        intro: lang
            ? 'Native oversikt over planlagte og tidligere Discord-kunngjoringer fra TekKom-boten.'
            : 'Native overview for scheduled and previous Discord announcements from the TekKom bot.',
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
            const payload = await fetchAnnouncements(limit)
            setAnnouncements(payload.announcements)
            setTotalCount(payload.total_count)
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        void load()
    }, [limit])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='AnnouncementsScreen' navigation={navigation} />
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <Cluster>
                        <View style={{ padding: 14 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>{labels.title}</Text>
                            <Space height={8} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{labels.intro}</Text>
                            <Space height={12} />
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
                                {labels.showing} {announcements.length} / {totalCount}
                            </Text>
                        </View>
                    </Cluster>

                    <Space height={12} />
                    {visibleAnnouncements.length ? visibleAnnouncements.map((announcement) => (
                        <AnnouncementCard
                            key={announcement.id}
                            announcement={announcement}
                            labels={labels}
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
            </View>
        </Swipe>
    )
}

function AnnouncementCard({
    announcement,
    labels,
}: {
    announcement: BotAnnouncement
    labels: Record<string, string>
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const title = announcement.title?.filter(Boolean).join(' / ') || `#${announcement.id}`
    const description = announcement.description?.filter(Boolean).join('\n\n') || ''
    const roleLabel = announcement.roles?.length ? announcement.roles.join(', ') : '-'
    const scheduledTime = announcement.time ? formatContentDate(announcement.time) : '-'
    const lastSent = announcement.last_sent ? formatContentDate(announcement.last_sent) : '-'

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <StatusPill label={announcement.active ? labels.active : labels.inactive} active={!!announcement.active} />
                        <StatusPill label={announcement.sent ? labels.sent : labels.pending} active={!!announcement.sent} subtle />
                    </View>
                    <Space height={8} />
                    <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                    {!!description && (
                        <>
                            <Space height={8} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }} numberOfLines={5}>
                                {description}
                            </Text>
                        </>
                    )}
                    <Space height={10} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        #{announcement.id} · {labels.channel}: {announcement.channel || '-'} · {labels.roles}: {roleLabel}
                    </Text>
                    <Space height={4} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {labels.scheduled}: {scheduledTime} · {labels.lastSent}: {lastSent}
                    </Text>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
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
