import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getTrafficDomains, getTrafficRecords } from '@utils/queenbee/api'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'
import { SummaryCard, TrafficRecordCard } from './traffic/cards'
import { DomainPicker, TrafficTabs } from './traffic/nav'
import config from '@/constants'

const PAGE_SIZE = 25

export default function TrafficRecordsScreen({ navigation }: MenuProps<'TrafficRecordsScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [records, setRecords] = useState<TrafficRecordsProps | null>(null)
    const [domains, setDomains] = useState<string[]>([])
    const [selectedDomain, setSelectedDomain] = useState('')
    const [page, setPage] = useState(1)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')

    async function load(nextPage = page, domain = selectedDomain) {
        setRefreshing(true)
        try {
            const [domainPayload, recordPayload] = await Promise.all([
                getTrafficDomains(),
                getTrafficRecords({ limit: PAGE_SIZE, page: nextPage, domain: domain || undefined }),
            ])
            setDomains(domainPayload)
            setRecords(recordPayload)
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load traffic records')
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const totalPages = Math.max(1, Math.ceil((records?.total || 0) / PAGE_SIZE))

    return (
        <Swipe left='TrafficScreen'>
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
                    <TrafficTabs active='records' navigation={navigation} />
                    <Space height={12} />
                    <DomainPicker
                        domains={domains}
                        selectedDomain={selectedDomain}
                        onSelect={(domain) => {
                            setSelectedDomain(domain)
                            setPage(1)
                            load(1, domain)
                        }}
                    />
                    <Space height={12} />
                    {!!error && <Text style={{ ...T.centered15, color: 'red' }}>{error}</Text>}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        <SummaryCard label='Records' value={String(records?.total || 0)} detail={`Page ${page}/${totalPages}`} />
                        <SummaryCard label='Domain' value={selectedDomain || 'All'} />
                    </View>
                    <Space height={10} />
                    {records?.result.map(record => (
                        <View key={record.id}>
                            <TrafficRecordCard record={record} />
                            <Space height={10} />
                        </View>
                    ))}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                        <PagerButton
                            label='Previous'
                            disabled={page <= 1 || refreshing}
                            onPress={() => {
                                const nextPage = Math.max(1, page - 1)
                                setPage(nextPage)
                                load(nextPage)
                            }}
                        />
                        <PagerButton
                            label='Next'
                            disabled={page >= totalPages || refreshing}
                            onPress={() => {
                                const nextPage = page + 1
                                setPage(nextPage)
                                load(nextPage)
                            }}
                        />
                    </View>
                </ScrollView>
            </View>
        </Swipe>
    )
}

function PagerButton({ label, disabled, onPress }: { label: string, disabled: boolean, onPress: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={{
                flex: 1,
                opacity: disabled ? 0.45 : 1,
                borderRadius: 999,
                backgroundColor: theme.orangeTransparent,
                borderWidth: 1,
                borderColor: theme.orangeTransparentBorder,
                paddingVertical: 12,
            }}
        >
            <Text style={{ ...T.centered15, color: theme.textColor }}>{label}</Text>
        </Pressable>
    )
}
