import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getInternalLogs } from '@utils/queenbeeApi'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, TextInput, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function LogsScreen({ navigation }: MenuProps<'LogsScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<LogsPayload | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')

    const visibleSources = useMemo(() =>
        data?.containers.filter(container =>
            !search.trim()
            || container.service.toLowerCase().includes(search.trim().toLowerCase())
            || container.entries.some(entry => entry.message.toLowerCase().includes(search.trim().toLowerCase()))
        ) || []
    , [data, search])

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
                <InternalNavMenu activeRoute='LogsScreen' navigation={navigation} />
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    <Space height={Dimensions.get('window').height / 8} />
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
                                    paddingVertical: 12
                                }}
                            />
                        </View>
                    </Cluster>
                    {!!error && (
                        <>
                            <Space height={10} />
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text15, color: '#ff8b8b' }}>
                                        {error}
                                    </Text>
                                </View>
                            </Cluster>
                        </>
                    )}
                    <Space height={10} />
                    {visibleSources.map(source => (
                        <View key={source.id}>
                            <Cluster>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ ...T.text20, color: theme.textColor }}>{source.service}</Text>
                                    <Space height={4} />
                                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                        {source.name} · {source.matchedLines} matched lines
                                    </Text>
                                    <Space height={8} />
                                    {source.entries.slice(0, 6).map(entry => (
                                        <View key={`${source.id}-${entry.fingerprint}`} style={{
                                            borderRadius: 12,
                                            backgroundColor: '#00000022',
                                            padding: 10,
                                            marginBottom: 8
                                        }}>
                                            <Text style={{
                                                ...T.text12,
                                                color: entry.isError ? '#ff8b8b' : theme.oppositeTextColor,
                                            }}>
                                                {entry.level.toUpperCase()} {entry.timestamp ? `· ${entry.timestamp}` : ''}
                                            </Text>
                                            <Space height={4} />
                                            <Text style={{ ...T.text15, color: theme.textColor }}>{entry.message}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Cluster>
                            <Space height={10} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        </Swipe>
    )
}
