import Space from '@/components/shared/utils'
import DashboardSummary from '@components/menu/queenbee/dashboardSummary'
import QueenbeeGate from '@components/menu/queenbee/gate'
import OperationsSnapshot from '@components/menu/queenbee/operationsSnapshot'
import { FailoverState, getFailoverTone } from '@components/menu/queenbee/snapshotPill'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { startLogin } from '@utils/auth/auth'
import { getDashboardSummary } from '@utils/discovery/discoveryApi'
import {
    getDatabaseOverview,
    getInternalOverview,
    getLoadBalancingSites,
    getScoutOverview,
    getVulnerabilitiesOverview,
    setPrimaryLoadBalancingSite,
} from '@utils/queenbee/api'
import {
    getClusterDatabaseCount,
    getDatabaseCount,
    getDatabaseSize,
    getVulnerabilitySummary,
    loadDashboardPart,
} from '@utils/queenbee/snapshotData'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, Text as RNText, View } from 'react-native'
import { useSelector } from 'react-redux'

type SummaryListItem = {
    title: string
    body: string
}

export default function QueenbeeScreen({ navigation }: MenuProps<'QueenbeeScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { login, groups } = useSelector((state: ReduxState) => state.login)
    const [dashboard, setDashboard] = useState<NativeDashboardSummary | null>(null)
    const [internalOverview, setInternalOverview] = useState<NativeInternalOverview | null>(null)
    const [sites, setSites] = useState<NativeLoadBalancingSite[]>([])
    const [databaseOverview, setDatabaseOverview] = useState<GetDatabaseOverview | null>(null)
    const [vulnerabilities, setVulnerabilities] = useState<GetVulnerabilities | null>(null)
    const [scoutOverview, setScoutOverview] = useState<ScoutOverview | null>(null)
    const [loading, setLoading] = useState(false)
    const [failoverLoading, setFailoverLoading] = useState(false)
    const [failoverState, setFailoverState] = useState<FailoverState>('idle')
    const [error, setError] = useState<string | null>(null)
    const hasQueenbee = useMemo(() => groups.map(group => group.toLowerCase()).includes('queenbee'), [groups])
    const unauthorizedError = !!error?.toLowerCase().includes('unauthorized')
    const errorText = unauthorizedError ? null : error

    useEffect(() => {
        if (login && hasQueenbee) {
            refresh()
        }
    }, [login, hasQueenbee])

    const primarySite = useMemo(() => sites.find(site => site.primary) || null, [sites])
    const healthySites = useMemo(() => sites.filter(site => site.operational && !site.maintenance).length, [sites])
    const failoverTarget = useMemo(() => sites.find(site => !site.primary && site.operational && !site.maintenance) || null, [sites])
    const failoverTone = failoverState === 'failed' ? 'failed' : getFailoverTone(failoverTarget)
    const databaseCount = useMemo(() => getDatabaseCount(
        databaseOverview,
        internalOverview?.databaseOverview,
        internalOverview?.databaseCount,
    ), [databaseOverview, internalOverview])
    const databaseSize = useMemo(() => getDatabaseSize(databaseOverview), [databaseOverview])
    const vulnerabilitySummary = useMemo(
        () => getVulnerabilitySummary(vulnerabilities, scoutOverview),
        [scoutOverview, vulnerabilities],
    )

    async function refresh() {
        setLoading(true)
        setError(null)

        const errors: string[] = []
        let pending = 6
        const finishRequest = () => {
            pending -= 1
            if (pending === 0) {
                setError(errors.length ? errors.join(' ') : null)
                setLoading(false)
            }
        }

        loadDashboardPart(getDashboardSummary, setDashboard, errors, finishRequest)
        loadDashboardPart(getInternalOverview, setInternalOverview, errors, finishRequest)
        loadDashboardPart(getLoadBalancingSites, updateSites, errors, finishRequest)
        loadDashboardPart(getDatabaseOverview, setDatabaseOverview, errors, finishRequest)
        loadDashboardPart(getVulnerabilitiesOverview, setVulnerabilities, errors, finishRequest)
        loadDashboardPart(getScoutOverview, setScoutOverview, errors, finishRequest)
    }

    function updateSites(nextSites: NativeLoadBalancingSite[]) {
        setSites(nextSites)
        setFailoverState('idle')
    }

    async function failoverPrimarySite() {
        if (!failoverTarget || failoverLoading) {
            setFailoverState('failed')
            return
        }

        setFailoverLoading(true)
        setFailoverState(getFailoverTone(failoverTarget))

        try {
            await setPrimaryLoadBalancingSite(failoverTarget.id)
            updateSites(await getLoadBalancingSites())
        } catch (failoverError) {
            setFailoverState('failed')
            setError(failoverError instanceof Error ? failoverError.message : 'Failed to switch primary site.')
        } finally {
            setFailoverLoading(false)
        }
    }

    if (!login || !hasQueenbee) {
        return <QueenbeeAccessGate login={login} hasQueenbee={hasQueenbee} theme={theme} />
    }

    const siteItems = sites.map(site => ({
        title: `${site.name}${site.primary ? ' · primary' : ''}`,
        body: `${site.operational ? 'Operational' : 'Down'}${site.maintenance ? ' · maintenance' : ''}`,
    }))
    const clusterItems = (databaseOverview?.clusters || []).map(cluster => ({
        title: cluster.name,
        body: `${getClusterDatabaseCount(cluster)} databases · ${cluster.activeQueries} active queries`,
    }))

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    style={GS.content}
                    refreshControl={<RefreshControl
                        refreshing={loading}
                        onRefresh={() => refresh()}
                        tintColor={theme.orange}
                        colors={[theme.orange]}
                        progressViewOffset={0}
                    />}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    {error && (
                        unauthorizedError
                            ? <UnauthorizedRetryText lang={lang} theme={theme} />
                            : <Text style={{ ...T.centered15, color: 'red', textAlign: 'center' }}>{errorText}</Text>
                    )}
                    <OperationsSnapshot
                        system={internalOverview?.system || null}
                        requestsToday={internalOverview?.requestsToday ?? 0}
                        primarySite={primarySite}
                        failoverTarget={failoverTarget}
                        failoverTone={failoverTone}
                        failoverLoading={failoverLoading}
                        healthySites={healthySites}
                        sitesLength={sites.length}
                        databaseCount={databaseCount}
                        databaseSize={databaseSize}
                        vulnerabilityValue={vulnerabilitySummary}
                        onOpenStatus={() => navigation.navigate('StatusScreen')}
                        onOpenTraffic={() => navigation.navigate('TrafficScreen')}
                        onOpenDatabases={() => navigation.navigate('DatabaseScreen')}
                        onOpenVulnerabilities={() => navigation.navigate('VulnerabilitiesScreen')}
                        onFailover={() => failoverPrimarySite()}
                    />
                    <DashboardSummary data={dashboard} />
                    <SummaryListCard title='Traffic targets' items={siteItems} theme={theme} />
                    <SummaryListCard title='Database clusters' items={clusterItems} theme={theme} />
                    <Space height={30} />
                </ScrollView>
                <TopRefreshIndicator refreshing={loading} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function UnauthorizedRetryText({ lang, theme }: { lang: boolean, theme: Theme }) {
    return (
        <RNText style={{
            ...T.centered15,
            color: theme.oppositeTextColor,
            textAlign: 'center',
        }}>
            {lang ? 'Noe data er ikke tilgjengelig før du ' : 'Some data is not available until you '}
            <RNText
                onPress={() => startLogin('queenbee')}
                style={{
                    color: theme.orange,
                    fontWeight: '500',
                    textDecorationLine: 'underline',
                }}
            >
                {lang ? 'logger inn på ny' : 'log in again'}
            </RNText>
            .
        </RNText>
    )
}

function SummaryListCard({ title, items, theme }: { title: string, items: SummaryListItem[], theme: Theme }): JSX.Element | null {
    if (!items.length) {
        return null
    }

    return (
        <>
            <Space height={16} />
            <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                <Space height={10} />
                {items.map((item, index) => (
                    <View
                        key={`${item.title}-${index}`}
                        style={{
                            paddingVertical: 8,
                            borderBottomWidth: index === items.length - 1 ? 0 : 1,
                            borderBottomColor: theme.darker,
                        }}
                    >
                        <Text style={{ ...T.text15, color: theme.textColor }}>
                            {item.title}
                        </Text>
                        <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                            {item.body}
                        </Text>
                    </View>
                ))}
            </View>
        </>
    )
}

function QueenbeeAccessGate({ login, hasQueenbee, theme }: { login: boolean, hasQueenbee: boolean, theme: Theme }) {
    return (
        <QueenbeeGate
            backgroundColor={theme.darker}
            textColor={theme.textColor}
            mutedTextColor={theme.oppositeTextColor}
            title='Queenbee'
            body={login && !hasQueenbee
                ? 'Your account is signed in, but it does not currently have Queenbee access.'
                : 'Sign in to use Queenbee.'}
            actionLabel={login ? undefined : 'Sign in'}
            actionColor={theme.orange}
            actionTextColor={theme.darker}
            onPress={login ? undefined : () => startLogin('queenbee')}
        />
    )
}
