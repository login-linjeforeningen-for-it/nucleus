import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import { ContentCard, EmptyContent, LoadMoreButton, OrganizationCard, TabPill } from '@components/menu/content/contentCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { filterByContentQuery, formatContentDate, formatLocationDetails } from '@utils/content/content'
import { fetchLocations, fetchOrganizations, fetchRules } from '@utils/fetch'
import { JSX, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, TextInput, View } from 'react-native'
import { useSelector } from 'react-redux'

type ContentTab = 'rules' | 'locations' | 'organizations'
const CONTENT_PAGE_SIZE = 20

export default function ContentScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [activeTab, setActiveTab] = useState<ContentTab>('rules')
    const [rules, setRules] = useState<WorkerbeeRule[]>([])
    const [locations, setLocations] = useState<WorkerbeeLocation[]>([])
    const [organizations, setOrganizations] = useState<WorkerbeeOrganization[]>([])
    const [counts, setCounts] = useState({ rules: 0, locations: 0, organizations: 0 })
    const [limit, setLimit] = useState(CONTENT_PAGE_SIZE)
    const [query, setQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const labels = useContentLabels(lang)
    const visible = useVisibleContent({ locations, organizations, query, rules })
    const loadedCounts = { rules: rules.length, locations: locations.length, organizations: organizations.length }
    const hasMore = loadedCounts[activeTab] < counts[activeTab]

    async function load() {
        setRefreshing(true)
        try {
            const [nextRules, nextLocations, nextOrganizations] = await Promise.all([
                fetchRules(limit),
                fetchLocations(limit),
                fetchOrganizations(limit),
            ])
            setRules(nextRules.rules)
            setLocations(nextLocations.locations)
            setOrganizations(nextOrganizations.organizations)
            setCounts({ rules: nextRules.total_count, locations: nextLocations.total_count, organizations: nextOrganizations.total_count })
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load content')
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        load()
    }, [limit])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => load()}
                            tintColor={theme.refresh}
                            progressViewOffset={config.progressViewOffset}
                        />
                    }
                    style={GS.content}
                    contentContainerStyle={{ paddingTop: 90, paddingHorizontal: 4, paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    {!!error && <ErrorBlock error={error} />}
                    <Space height={10} />
                    <ContentToolbar
                        activeTab={activeTab}
                        counts={counts}
                        labels={labels}
                        loaded={loadedCounts[activeTab]}
                        query={query}
                        setActiveTab={setActiveTab}
                        setQuery={setQuery}
                        total={counts[activeTab]}
                    />
                    <Space height={10} />
                    <ContentResults activeTab={activeTab} labels={labels} lang={lang} visible={visible} />
                    {hasMore && <>
                        <LoadMoreButton
                            label={labels.loadMore}
                            onPress={() => setLimit(current => current + CONTENT_PAGE_SIZE)}
                        />
                        <Space height={10} />
                    </>}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function useContentLabels(lang: boolean) {
    return useMemo(() => ({
        rules: lang ? 'Regler' : 'Rules',
        locations: lang ? 'Steder' : 'Locations',
        organizations: lang ? 'Organisasjoner' : 'Organizations',
        search: lang ? 'Søk i innhold...' : 'Search content...',
        showing: lang ? 'Viser' : 'Showing',
        loadMore: lang ? 'Last inn mer' : 'Load more',
        updated: lang ? 'Oppdatert' : 'Updated',
        empty: lang ? 'Ingen treff å vise.' : 'No rows to show.',
        locationFallback: lang ? 'Ingen ekstra stedsdetaljer' : 'No additional location details',
    }), [lang])
}

function useVisibleContent({ locations, organizations, query, rules }: {
    locations: WorkerbeeLocation[]
    organizations: WorkerbeeOrganization[]
    query: string
    rules: WorkerbeeRule[]
}) {
    const visibleRules = useMemo(() => filterByContentQuery(rules, query, rule => [
        rule.name_no, rule.name_en, rule.description_no, rule.description_en,
    ]), [query, rules])
    const visibleLocations = useMemo(() => filterByContentQuery(locations, query, location => [
        location.name_no, location.name_en, location.type, location.address_street,
        location.address_postcode, location.city_name, location.mazemap_campus_id, location.mazemap_poi_id, location.url,
    ]), [locations, query])
    const visibleOrganizations = useMemo(() => filterByContentQuery(organizations, query, organization => [
        organization.name_no, organization.name_en, organization.description_no, organization.description_en,
        organization.link_homepage, organization.link_linkedin, organization.link_facebook, organization.link_instagram,
    ]), [organizations, query])

    return { locations: visibleLocations, organizations: visibleOrganizations, rules: visibleRules }
}

function ContentToolbar({ activeTab, counts, labels, loaded, query, setActiveTab, setQuery, total }: {
    activeTab: ContentTab
    counts: Record<ContentTab, number>
    labels: Record<string, string>
    loaded: number
    query: string
    setActiveTab: (tab: ContentTab) => void
    setQuery: (query: string) => void
    total: number
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const tabs = [
        { key: 'rules' as const, label: labels.rules, count: counts.rules },
        { key: 'locations' as const, label: labels.locations, count: counts.locations },
        { key: 'organizations' as const, label: labels.organizations, count: counts.organizations },
    ]

    return (
        <Cluster>
            <View style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {tabs.map(tab => <TabPill key={tab.key} label={`${tab.label} · ${tab.count}`} active={tab.key === activeTab} onPress={() => setActiveTab(tab.key)} />)}
                </View>
                <Space height={12} />
                <TextInput value={query} onChangeText={setQuery} placeholder={labels.search} placeholderTextColor={theme.oppositeTextColor} autoCapitalize='none' autoCorrect={false} style={{
                    borderRadius: 16, borderWidth: 1, borderColor: '#ffffff18', backgroundColor: theme.contrast, color: theme.textColor, paddingHorizontal: 12, paddingVertical: 10, fontSize: T.text15.fontSize,
                }} />
                <Space height={10} />
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{`${labels.showing} ${loaded} / ${total}`}</Text>
            </View>
        </Cluster>
    )
}

function ContentResults({ activeTab, labels, lang, visible }: {
    activeTab: ContentTab
    labels: Record<string, string>
    lang: boolean
    visible: ReturnType<typeof useVisibleContent>
}) {
    if (activeTab === 'rules') {
        return visible.rules.length ? visible.rules.map(rule => <ContentCard key={rule.id} title={lang ? rule.name_no : rule.name_en} subtitle={`#${rule.id} · ${labels.updated} ${formatContentDate(rule.updated_at)}`} body={lang ? rule.description_no : rule.description_en} />) : <EmptyContent label={labels.empty} />
    }
    if (activeTab === 'locations') {
        return visible.locations.length ? visible.locations.map(location => <ContentCard key={location.id} title={lang ? location.name_no : location.name_en} subtitle={`#${location.id} · ${location.type} · ${labels.updated} ${formatContentDate(location.updated_at)}`} body={formatLocationDetails(location, labels.locationFallback)} />) : <EmptyContent label={labels.empty} />
    }
    return visible.organizations.length
        ? visible.organizations.map(organization => <OrganizationCard key={organization.id} organization={organization} lang={lang} updatedLabel={labels.updated} />)
        : <EmptyContent label={labels.empty} />
}

function ErrorBlock({ error }: { error: string }) {
    return <><Space height={10} /><Cluster><View style={{ padding: 12 }}><Text style={{ ...T.text15, color: '#ff8b8b' }}>{error}</Text></View></Cluster></>
}
