import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import LogSourceCard from '@components/menu/logs/logSourceCard'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getInternalLogs } from '@utils/queenbee/api'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, TextInput, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function LogsScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<LogsPayload | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})
    const visibleSources = useVisibleSources(data, search)

    async function load() {
        setRefreshing(true)
        try {
            setData(await getInternalLogs({ tail: 200 }))
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load logs')
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
                <ScrollView
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => void load()}
                        tintColor={theme.orange}
                        colors={[theme.orange]}
                        progressViewOffset={0}
                    />}
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    <LogSearch search={search} setSearch={setSearch} />
                    <LogError message={error} />
                    <Space height={10} />
                    {visibleSources.map((source, index) => (
                        <LogSourceCard
                            key={`${source.id}-${source.service}-${index}`}
                            source={source}
                            expanded={expandedSources[source.id] ?? false}
                            onToggle={() => setExpandedSources(current => ({
                                ...current,
                                [source.id]: !(current[source.id] ?? false),
                            }))}
                        />
                    ))}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function useVisibleSources(data: LogsPayload | null, search: string) {
    return useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return data?.containers || []
        return data?.containers.filter(container =>
            container.service.toLowerCase().includes(query)
            || container.entries.some(entry => entry.message.toLowerCase().includes(query))
        ) || []
    }, [data, search])
}

function LogSearch({ search, setSearch }: { search: string, setSearch: (value: string) => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster>
            <View style={{ padding: 12 }}>
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder='Filter by service or message...'
                    placeholderTextColor={theme.oppositeTextColor}
                    style={{
                        color: theme.textColor,
                        borderWidth: 1,
                        borderColor: '#ffffff18',
                        borderRadius: 14,
                        backgroundColor: '#ffffff08',
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                    }}
                />
            </View>
        </Cluster>
    )
}

function LogError({ message }: { message: string }) {
    if (!message) return null

    return (
        <>
            <Space height={10} />
            <Cluster>
                <View style={{ padding: 12 }}>
                    <Text style={{ ...T.text15, color: '#ff8b8b' }}>{message}</Text>
                </View>
            </Cluster>
        </>
    )
}
