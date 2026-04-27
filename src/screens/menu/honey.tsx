import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import HoneyCard from '@components/menu/honey/honeyCard'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { fetchHoneyList, fetchHoneyServices } from '@utils/fetch'
import { JSX, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

const HONEY_PAGE_SIZE = 20

export default function HoneyScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [services, setServices] = useState<string[]>([])
    const [activeService, setActiveService] = useState('beehive')
    const [honeys, setHoneys] = useState<WorkerbeeHoney[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [limit, setLimit] = useState(HONEY_PAGE_SIZE)
    const [refreshing, setRefreshing] = useState(false)
    const labels = useHoneyLabels(lang)

    async function load() {
        setRefreshing(true)
        try {
            const [nextServices, nextHoney] = await Promise.all([
                fetchHoneyServices(),
                fetchHoneyList(activeService, limit),
            ])
            setServices(nextServices.length ? nextServices : [activeService])
            setHoneys(nextHoney.honeys)
            setTotalCount(nextHoney.total_count)
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        load()
    }, [activeService, limit])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 90 }}
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => load()}
                        tintColor={theme.orange}
                        colors={[theme.orange]}
                        progressViewOffset={0}
                    />}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <HoneyToolbar
                        services={services}
                        activeService={activeService}
                        setActiveService={(service) => {
                            setLimit(HONEY_PAGE_SIZE)
                            setActiveService(service)
                        }}
                        labels={labels}
                        loaded={honeys.length}
                        total={totalCount}
                    />
                    <Space height={12} />
                    {honeys.length
                        ? honeys.map(honey => <HoneyCard key={honey.id} honey={honey} labels={labels} />)
                        : <EmptyHoney label={labels.empty} />}
                    {honeys.length < totalCount && (
                        <LoadMoreButton
                            label={labels.loadMore}
                            onPress={() => setLimit(currentLimit => currentLimit + HONEY_PAGE_SIZE)}
                        />
                    )}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function useHoneyLabels(lang: boolean) {
    return useMemo(() => ({
        empty: lang ? 'Ingen honey funnet.' : 'No honey found.',
        showing: lang ? 'Viser' : 'Showing',
        loadMore: lang ? 'Last inn mer' : 'Load more',
        language: lang ? 'Sprak' : 'Language',
        service: lang ? 'Tjeneste' : 'Service',
        page: lang ? 'Side' : 'Page',
        updated: lang ? 'Oppdatert' : 'Updated',
        created: lang ? 'Opprettet' : 'Created',
        text: lang ? 'Tekst' : 'Text',
    }), [lang])
}

function HoneyToolbar({ services, activeService, setActiveService, labels, loaded, total }: {
    services: string[]
    activeService: string
    setActiveService: (service: string) => void
    labels: Record<string, string>
    loaded: number
    total: number
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster>
            <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {services.map(service => <ServicePill
                        key={service}
                        label={service}
                        active={service === activeService}
                        onPress={() => setActiveService(service)}
                    />)}
                </View>
                <Space height={10} />
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                    {`${labels.showing} ${loaded} / ${total}`}
                </Text>
            </View>
        </Cluster>
    )
}

function ServicePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
            <View style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? theme.orangeTransparentBorderHighlighted : '#ffffff18',
                backgroundColor: active ? theme.orangeTransparentHighlighted : theme.contrast,
                paddingHorizontal: 11,
                paddingVertical: 7,
            }}>
                <Text style={{ ...T.text12, color: active ? theme.textColor : theme.oppositeTextColor }}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

function EmptyHoney({ label }: { label: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return (
        <Cluster>
            <View style={{ padding: 18, alignItems: 'center' }}>
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
            </View>
        </Cluster>
    )
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
                    backgroundColor: theme.orangeTransparent
                }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>
                        {label}
                    </Text>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}
