import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => void load()}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <Cluster>
                        <View style={{ padding: 14 }}>
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
                                {`${labels.showing} ${honeys.length} / ${totalCount}`}
                            </Text>
                        </View>
                    </Cluster>

                    <Space height={12} />
                    {honeys.length ? honeys.map((honey) => (
                        <HoneyCard
                            key={honey.id}
                            honey={honey}
                            labels={labels}
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
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
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
    labels,
    pageLabel,
    languageLabel,
}: {
    honey: WorkerbeeHoney
    labels: Record<string, string>
    pageLabel: string
    languageLabel: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const preview = formatHoneyPreview(honey.text)
    const updatedAt = honey.updated_at ? formatHoneyDate(honey.updated_at) : '-'
    const createdAt = honey.created_at ? formatHoneyDate(honey.created_at) : '-'

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 10,
                    }}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>
                                {honey.page || `#${honey.id}`}
                            </Text>
                            <Space height={4} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                {`#${honey.id}`}
                            </Text>
                        </View>
                        <LanguagePill language={honey.language} />
                    </View>
                    <Space height={10} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <MetaPill label={labels.service} value={honey.service || '-'} highlighted />
                        <MetaPill label={pageLabel} value={honey.page || '-'} />
                        <MetaPill label={languageLabel} value={honey.language || '-'} />
                    </View>
                    <Space height={12} />
                    <View style={{
                        borderLeftWidth: 2,
                        borderLeftColor: theme.orange,
                        paddingLeft: 10,
                    }}>
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{labels.text}</Text>
                        <Space height={4} />
                        <Text style={{
                            ...T.text15,
                            color: preview ? theme.textColor : theme.oppositeTextColor,
                            lineHeight: 21,
                        }} numberOfLines={8}>
                            {preview || '-'}
                        </Text>
                    </View>
                    <Space height={12} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <DatePill label={labels.updated} value={updatedAt} />
                        <DatePill label={labels.created} value={createdAt} />
                    </View>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function LanguagePill({ language }: { language?: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const normalized = (language || '-').toUpperCase()

    return (
        <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.orangeTransparentBorderHighlighted,
            backgroundColor: theme.orangeTransparentHighlighted,
            paddingHorizontal: 10,
            paddingVertical: 5,
        }}>
            <Text style={{ ...T.text12, color: theme.textColor, fontWeight: '700' }}>
                {normalized}
            </Text>
        </View>
    )
}

function MetaPill({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: highlighted ? theme.orangeTransparentBorderHighlighted : '#ffffff14',
            backgroundColor: highlighted ? theme.orangeTransparent : '#ffffff08',
            paddingHorizontal: 10,
            paddingVertical: 7,
            maxWidth: '100%',
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={2} />
            <Text style={{ ...T.text12, color: theme.textColor, fontWeight: '700' }} numberOfLines={2}>
                {value}
            </Text>
        </View>
    )
}

function DatePill({ label, value }: { label: string; value: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#ffffff12',
            backgroundColor: '#ffffff08',
            paddingHorizontal: 10,
            paddingVertical: 7,
        }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Space height={2} />
            <Text style={{ ...T.text12, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function formatHoneyPreview(text?: string) {
    if (!text) {
        return ''
    }

    try {
        const parsed = JSON.parse(text)
        return flattenHoneyText(parsed).join('\n')
    } catch {
        return text
    }
}

function flattenHoneyText(value: unknown, prefix = ''): string[] {
    if (value === null || value === undefined) {
        return []
    }

    if (typeof value !== 'object') {
        return [`${prefix ? `${prefix}: ` : ''}${String(value)}`]
    }

    if (Array.isArray(value)) {
        return value.flatMap((item, index) => flattenHoneyText(item, `${prefix}[${index}]`))
    }

    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
        flattenHoneyText(item, prefix ? `${prefix}.${key}` : key)
    )
}

function formatHoneyDate(date: string) {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) {
        return date
    }

    return parsed.toLocaleDateString('nb-NO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}
