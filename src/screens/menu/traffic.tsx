import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import {
    getTrafficDomains,
    getTrafficMetrics,
    getTrafficRecords,
} from '@utils/queenbee/api'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'
import { MetricList, SummaryCard, TrafficRecordCard } from './traffic/cards'
import { DomainPicker, TrafficTabs } from './traffic/nav'
import config from '@/constants'

export default function TrafficScreen({ navigation }: MenuProps<'TrafficScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [metrics, setMetrics] = useState<TrafficMetricsProps | null>(null)
    const [records, setRecords] = useState<TrafficRecordsProps | null>(null)
    const [domains, setDomains] = useState<string[]>([])
    const [selectedDomain, setSelectedDomain] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')

    async function load(domain = selectedDomain) {
        setRefreshing(true)
        try {
            const [domainPayload, metricPayload, recordPayload] = await Promise.all([
                getTrafficDomains(),
                getTrafficMetrics(domain ? { domain } : {}),
                getTrafficRecords({ limit: 12, page: 1, domain: domain || undefined }),
            ])
            setDomains(domainPayload)
            setMetrics(metricPayload)
            setRecords(recordPayload)
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load traffic metrics')
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const totalRequests = Number(metrics?.total_requests || 0)
    const avgRequestTime = Number.isFinite(Number(metrics?.avg_request_time))
        ? Math.round(Number(metrics?.avg_request_time))
        : 0
    const errorRate = Number.isFinite(Number(metrics?.error_rate))
        ? `${(Number(metrics?.error_rate) * 100).toFixed(1)}%`
        : '—'

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
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    <TrafficTabs active='metrics' navigation={navigation} />
                    <Space height={12} />
                    <DomainPicker
                        domains={domains}
                        selectedDomain={selectedDomain}
                        onSelect={(domain) => {
                            setSelectedDomain(domain)
                            load(domain)
                        }}
                    />
                    <Space height={12} />
                    {!!error && <Text style={{ ...T.centered15, color: 'red' }}>{error}</Text>}
                    {metrics && (
                        <>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                <SummaryCard label='Total requests' value={totalRequests.toLocaleString()} />
                                <SummaryCard label='Avg response' value={avgRequestTime ? `${avgRequestTime}ms` : '—'} />
                                <SummaryCard label='Error rate' value={errorRate} />
                            </View>
                            <Space height={10} />
                            <MetricList title='Methods' entries={metrics.top_methods} total={totalRequests} />
                            <Space height={10} />
                            <MetricList title='Status Codes' entries={metrics.top_status_codes} total={totalRequests} />
                            <Space height={10} />
                            <MetricList title={selectedDomain ? 'Requests Over Time' : 'Domains'} entries={selectedDomain
                                ? metrics.requests_over_time
                                : metrics.top_domains} total={totalRequests} />
                            <Space height={10} />
                            <MetricList
                                title='Top Slow Paths (ms)'
                                entries={metrics.top_slow_paths}
                                total={totalRequests}
                                timeValue
                            />
                            <Space height={10} />
                            <MetricList title='Operating Systems' entries={metrics.top_os} total={totalRequests} />
                            <Space height={10} />
                            <MetricList title='Browsers' entries={metrics.top_browsers} total={totalRequests} />
                            <Space height={10} />
                            <MetricList title='Top Paths' entries={metrics.top_paths} total={totalRequests} />
                            <Space height={10} />
                            <MetricList title='Top Error Paths' entries={metrics.top_error_paths} total={totalRequests} />
                        </>
                    )}
                    {!!records?.result.length && (
                        <>
                            <Space height={14} />
                            <Text style={{ ...T.text20, color: theme.textColor }}>Recent traffic</Text>
                            <Space height={10} />
                            {records.result.map(record => (
                                <View key={record.id}>
                                    <TrafficRecordCard record={record} />
                                    <Space height={10} />
                                </View>
                            ))}
                        </>
                    )}
                </ScrollView>
            </View>
        </Swipe>
    )
}
