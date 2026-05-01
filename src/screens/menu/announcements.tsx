import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import AnnouncementCard, { filterAnnouncements } from '@components/menu/announcements/announcementCard'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { fetchAnnouncementChannels, fetchAnnouncementRoles, fetchAnnouncements } from '@utils/fetch'
import { JSX, useEffect, useMemo, useState } from 'react'
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
    const labels = useAnnouncementLabels(lang)
    const visibleAnnouncements = useMemo(
        () => filterAnnouncements(announcements, query),
        [announcements, query],
    )

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
        load()
    }, [limit, token])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => load()}
                        tintColor={theme.refresh}
                        progressViewOffset={config.progressViewOffset}
                    />}
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <AnnouncementSearch
                        query={query}
                        setQuery={setQuery}
                        labels={labels}
                        loaded={announcements.length}
                        total={totalCount}
                    />
                    <Space height={12} />
                    <AnnouncementList
                        announcements={visibleAnnouncements}
                        labels={labels}
                        channels={channels}
                        roles={roles}
                    />
                    {announcements.length < totalCount && (
                        <LoadMoreButton
                            label={labels.loadMore}
                            onPress={() => setLimit(currentLimit => currentLimit + ANNOUNCEMENT_PAGE_SIZE)}
                        />
                    )}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function useAnnouncementLabels(lang: boolean) {
    return useMemo(() => ({
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
}

function AnnouncementSearch({ query, setQuery, labels, loaded, total }: {
    query: string
    setQuery: (value: string) => void
    labels: Record<string, string>
    loaded: number
    total: number
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
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
                    {`${labels.showing} ${loaded} / ${total}`}
                </Text>
            </View>
        </Cluster>
    )
}

function AnnouncementList({ announcements, labels, channels, roles }: {
    announcements: BotAnnouncement[]
    labels: Record<string, string>
    channels: BotChannel[]
    roles: BotRole[]
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    if (!announcements.length) {
        return <Cluster><View style={{ padding: 18, alignItems: 'center' }}><Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{labels.empty}</Text></View></Cluster>
    }

    return announcements.map(announcement => (
        <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            labels={labels}
            channels={channels}
            roles={roles}
        />
    ))
}

function LoadMoreButton({ label, onPress }: { label: string, onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
            <Cluster>
                <View style={{
                    padding: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme.orangeTransparentBorderHighlighted,
                    backgroundColor: theme.orangeTransparent,
                }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>{label}</Text>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}
