import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { filterByContentQuery, formatContentDate } from '@utils/content'
import { fetchAlerts } from '@utils/fetch'
import { JSX, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

const ALERT_PAGE_SIZE = 20

export default function AlertsScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [alerts, setAlerts] = useState<WorkerbeeAlert[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [limit, setLimit] = useState(ALERT_PAGE_SIZE)
    const [query, setQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const labels = useMemo(() => ({
        search: lang ? 'Søk i varsler...' : 'Search alerts...',
        showing: lang ? 'Viser' : 'Showing',
        loadMore: lang ? 'Last inn mer' : 'Load more',
        empty: lang ? 'Ingen varsler funnet.' : 'No alerts found.',
        service: lang ? 'Tjeneste' : 'Service',
        page: lang ? 'Side' : 'Page',
        updated: lang ? 'Oppdatert' : 'Updated',
    }), [lang])
    const visibleAlerts = useMemo(() => filterByContentQuery(alerts, query, (alert) => [
        alert.id,
        alert.service,
        alert.page,
        alert.title_no,
        alert.title_en,
        alert.description_no,
        alert.description_en,
    ]), [alerts, query])

    async function load() {
        setRefreshing(true)
        try {
            const payload = await fetchAlerts(limit)
            setAlerts(payload.alerts)
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
                    keyboardShouldPersistTaps='handled'
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
                                {`${labels.showing} ${alerts.length} / ${totalCount}`}
                            </Text>
                        </View>
                    </Cluster>

                    <Space height={12} />
                    {visibleAlerts.length ? visibleAlerts.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} labels={labels} lang={lang} />
                    )) : (
                        <Cluster>
                            <View style={{ padding: 18, alignItems: 'center' }}>
                                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{labels.empty}</Text>
                            </View>
                        </Cluster>
                    )}

                    {alerts.length < totalCount && (
                        <TouchableOpacity
                            onPress={() => setLimit((currentLimit) => currentLimit + ALERT_PAGE_SIZE)}
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

function AlertCard({
    alert,
    labels,
    lang,
}: {
    alert: WorkerbeeAlert
    labels: Record<string, string>
    lang: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const title = lang ? alert.title_no || alert.title_en : alert.title_en || alert.title_no
    const description = lang
        ? alert.description_no || alert.description_en
        : alert.description_en || alert.description_no

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>
                        {title || `#${alert.id}`}
                    </Text>
                    {!!description && (
                        <>
                            <Space height={8} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }} numberOfLines={4}>
                                {description}
                            </Text>
                        </>
                    )}
                    <Space height={10} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`#${alert.id} · ${labels.service}: ${alert.service || '-'} · ${labels.page}: ${alert.page || '-'}`}
                    </Text>
                    {!!alert.updated_at && (
                        <>
                            <Space height={4} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                {`${labels.updated}: ${formatContentDate(alert.updated_at)}`}
                            </Text>
                        </>
                    )}
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}
