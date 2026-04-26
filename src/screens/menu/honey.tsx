import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { fetchHoneyList, fetchHoneyServices } from '@utils/fetch'
import { JSX, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

const HONEY_PAGE_SIZE = 20

export default function HoneyScreen({ navigation }: MenuProps<'HoneyScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [services, setServices] = useState<string[]>([])
    const [activeService, setActiveService] = useState('beehive')
    const [honeys, setHoneys] = useState<WorkerbeeHoney[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [limit, setLimit] = useState(HONEY_PAGE_SIZE)
    const [refreshing, setRefreshing] = useState(false)
    const labels = useMemo(() => ({
        title: lang ? 'Honey' : 'Honey',
        intro: lang
            ? 'Tekstinnhold brukt av Login-tjenester, gruppert etter service, side og sprak.'
            : 'Text content used by Login services, grouped by service, page, and language.',
        empty: lang ? 'Ingen honey funnet.' : 'No honey found.',
        showing: lang ? 'Viser' : 'Showing',
        loadMore: lang ? 'Last inn mer' : 'Load more',
        language: lang ? 'Sprak' : 'Language',
        page: lang ? 'Side' : 'Page',
    }), [lang])

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
        void load()
    }, [activeService, limit])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='HoneyScreen' navigation={navigation} />
                <ScrollView
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 90 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <Cluster>
                        <View style={{ padding: 14 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>{labels.title}</Text>
                            <Space height={8} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{labels.intro}</Text>
                            <Space height={12} />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {services.map((service) => (
                                    <ServicePill
                                        key={service}
                                        label={service}
                                        active={service === activeService}
                                        onPress={() => {
                                            setLimit(HONEY_PAGE_SIZE)
                                            setActiveService(service)
                                        }}
                                    />
                                ))}
                            </View>
                            <Space height={10} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                {labels.showing} {honeys.length} / {totalCount}
                            </Text>
                        </View>
                    </Cluster>

                    <Space height={12} />
                    {honeys.length ? honeys.map((honey) => (
                        <HoneyCard
                            key={honey.id}
                            honey={honey}
                            pageLabel={labels.page}
                            languageLabel={labels.language}
                        />
                    )) : (
                        <Cluster>
                            <View style={{ padding: 18, alignItems: 'center' }}>
                                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{labels.empty}</Text>
                            </View>
                        </Cluster>
                    )}

                    {honeys.length < totalCount && (
                        <TouchableOpacity
                            onPress={() => setLimit((currentLimit) => currentLimit + HONEY_PAGE_SIZE)}
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

function HoneyCard({
    honey,
    pageLabel,
    languageLabel,
}: {
    honey: WorkerbeeHoney
    pageLabel: string
    languageLabel: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>
                        {honey.page || `#${honey.id}`}
                    </Text>
                    <Space height={6} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        #{honey.id} · {pageLabel}: {honey.page || '-'} · {languageLabel}: {honey.language || '-'}
                    </Text>
                    {!!honey.text && (
                        <>
                            <Space height={8} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }} numberOfLines={4}>
                                {honey.text}
                            </Text>
                        </>
                    )}
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}
