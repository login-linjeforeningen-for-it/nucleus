import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { cleanMarkdown, filterByContentQuery, formatContentDate, formatLocationDetails } from '@utils/content'
import { fetchLocations, fetchOrganizations, fetchRules } from '@utils/fetch'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Image, RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

type ContentTab = 'rules' | 'locations' | 'organizations'

export default function ContentScreen({ navigation }: MenuProps<'ContentScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [activeTab, setActiveTab] = useState<ContentTab>('rules')
    const [rules, setRules] = useState<WorkerbeeRule[]>([])
    const [locations, setLocations] = useState<WorkerbeeLocation[]>([])
    const [organizations, setOrganizations] = useState<WorkerbeeOrganization[]>([])
    const [counts, setCounts] = useState({ rules: 0, locations: 0, organizations: 0 })
    const [query, setQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const labels = useMemo(() => ({
        title: lang ? 'Innhold' : 'Content',
        intro: lang
            ? 'Native oversikt over Workerbee-regler, steder og organisasjoner.'
            : 'Native overview for Workerbee rules, locations, and organizations.',
        rules: lang ? 'Regler' : 'Rules',
        locations: lang ? 'Steder' : 'Locations',
        organizations: lang ? 'Organisasjoner' : 'Organizations',
        search: lang ? 'Søk i innhold...' : 'Search content...',
        updated: lang ? 'Oppdatert' : 'Updated',
        empty: lang ? 'Ingen treff å vise.' : 'No rows to show.',
        locationFallback: lang ? 'Ingen ekstra stedsdetaljer' : 'No additional location details',
    }), [lang])

    const tabs = useMemo(() => [
        { key: 'rules' as const, label: labels.rules, count: counts.rules },
        { key: 'locations' as const, label: labels.locations, count: counts.locations },
        { key: 'organizations' as const, label: labels.organizations, count: counts.organizations },
    ], [counts, labels])

    const visibleRules = useMemo(() => filterByContentQuery(rules, query, (rule) => [
        rule.name_no,
        rule.name_en,
        rule.description_no,
        rule.description_en,
    ]), [query, rules])
    const visibleLocations = useMemo(() => filterByContentQuery(locations, query, (location) => [
        location.name_no,
        location.name_en,
        location.type,
        location.address_street,
        location.address_postcode,
        location.city_name,
        location.mazemap_campus_id,
        location.mazemap_poi_id,
        location.url,
    ]), [locations, query])
    const visibleOrganizations = useMemo(() => filterByContentQuery(organizations, query, (organization) => [
        organization.name_no,
        organization.name_en,
        organization.description_no,
        organization.description_en,
        organization.link_homepage,
        organization.link_linkedin,
        organization.link_facebook,
        organization.link_instagram,
    ]), [organizations, query])

    async function load() {
        setRefreshing(true)
        try {
            const [nextRules, nextLocations, nextOrganizations] = await Promise.all([
                fetchRules(),
                fetchLocations(),
                fetchOrganizations(),
            ])

            setRules(nextRules.rules)
            setLocations(nextLocations.locations)
            setOrganizations(nextOrganizations.organizations)
            setCounts({
                rules: nextRules.total_count,
                locations: nextLocations.total_count,
                organizations: nextOrganizations.total_count,
            })
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load content')
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='ContentScreen' navigation={navigation} />
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>{labels.title}</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                {labels.intro}
                            </Text>
                        </View>
                    </Cluster>

                    {!!error && (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text15, color: '#ff8b8b' }}>{error}</Text>
                                </View>
                            </Cluster>
                        </>
                    )}

                    <Space height={10} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {tabs.map((tab) => (
                                    <TabPill
                                        key={tab.key}
                                        label={`${tab.label} · ${tab.count}`}
                                        active={tab.key === activeTab}
                                        onPress={() => setActiveTab(tab.key)}
                                    />
                                ))}
                            </View>
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
                        </View>
                    </Cluster>

                    <Space height={10} />
                    {activeTab === 'rules' && visibleRules.map((rule) => (
                        <ContentCard
                            key={rule.id}
                            title={lang ? rule.name_no : rule.name_en}
                            subtitle={`#${rule.id} · ${labels.updated} ${formatContentDate(rule.updated_at)}`}
                            body={lang ? rule.description_no : rule.description_en}
                        />
                    ))}
                    {activeTab === 'rules' && !visibleRules.length && <EmptyContent label={labels.empty} />}
                    {activeTab === 'locations' && visibleLocations.map((location) => (
                        <ContentCard
                            key={location.id}
                            title={lang ? location.name_no : location.name_en}
                            subtitle={`#${location.id} · ${location.type} · ${labels.updated} ${formatContentDate(location.updated_at)}`}
                            body={formatLocationDetails(location, labels.locationFallback)}
                        />
                    ))}
                    {activeTab === 'locations' && !visibleLocations.length && <EmptyContent label={labels.empty} />}
                    {activeTab === 'organizations' && visibleOrganizations.map((organization) => (
                        <OrganizationCard
                            key={organization.id}
                            organization={organization}
                            lang={lang}
                            updatedLabel={labels.updated}
                        />
                    ))}
                    {activeTab === 'organizations' && !visibleOrganizations.length && <EmptyContent label={labels.empty} />}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function TabPill({
    label,
    active,
    onPress,
}: {
    label: string
    active: boolean
    onPress: () => void
}) {
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
                <Text style={{
                    ...T.text12,
                    color: active ? theme.textColor : theme.oppositeTextColor,
                }}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

function ContentCard({
    title,
    subtitle,
    body,
}: {
    title: string
    subtitle: string
    body: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Cluster>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{subtitle}</Text>
                    <Space height={8} />
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                        {cleanMarkdown(body)}
                    </Text>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function OrganizationCard({
    organization,
    lang,
    updatedLabel,
}: {
    organization: WorkerbeeOrganization
    lang: boolean
    updatedLabel: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const logo = organization.logo ? `${config.cdn}/organizations/${organization.logo}` : ''

    return (
        <>
            <Cluster>
                <View style={{ padding: 12, flexDirection: 'row', gap: 12 }}>
                    <View style={{
                        width: 54,
                        height: 54,
                        borderRadius: 16,
                        overflow: 'hidden',
                        backgroundColor: theme.contrast,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {logo ? (
                            <Image source={{ uri: logo, cache: 'force-cache' }} style={{ width: 54, height: 54 }} />
                        ) : (
                            <Text style={{ ...T.text15, color: theme.orange }}>
                                {(lang ? organization.name_no : organization.name_en).slice(0, 1)}
                            </Text>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...T.text20, color: theme.textColor }}>
                            {lang ? organization.name_no : organization.name_en}
                        </Text>
                        <Space height={4} />
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                            #{organization.id} · {updatedLabel} {formatContentDate(organization.updated_at)}
                        </Text>
                        <Space height={8} />
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }} numberOfLines={5}>
                            {lang ? organization.description_no : organization.description_en}
                        </Text>
                    </View>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function EmptyContent({ label }: { label: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster>
            <View style={{ padding: 18, alignItems: 'center' }}>
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
            </View>
        </Cluster>
    )
}
