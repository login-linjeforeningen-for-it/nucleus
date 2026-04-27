import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { getInternalLogs } from '@utils/queenbee/api'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function LogsScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [data, setData] = useState<LogsPayload | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})

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
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => void load()}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
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

function LogSourceCard({
    source,
    expanded,
    onToggle,
}: {
    source: LogContainer
    expanded: boolean
    onToggle: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Cluster>
                <View style={{
                    borderWidth: 1,
                    borderLeftWidth: expanded ? 3 : 1,
                    borderColor: theme.greyTransparentBorder,
                    borderLeftColor: expanded ? theme.orange : theme.greyTransparentBorder,
                    backgroundColor: theme.greyTransparent,
                    borderRadius: 18,
                    overflow: 'hidden',
                }}>
                    <TouchableOpacity onPress={onToggle} activeOpacity={0.86}>
                        <View style={{ padding: 12 }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                            }}>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                        <Text style={{ ...T.text20, color: theme.textColor }}>{source.service}</Text>
                                        <SourcePill sourceType={source.sourceType} />
                                    </View>
                                    <Space height={4} />
                                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                        {`${source.name} · ${source.status} · ${source.matchedLines} matching lines`}
                                    </Text>
                                </View>
                                <Text style={{ ...T.text20, color: theme.orange }}>{expanded ? '−' : '+'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {expanded && (
                        <View style={{
                            borderTopWidth: 1,
                            borderTopColor: '#ffffff12',
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                        }}>
                            <View style={{
                                borderRadius: 14,
                                borderWidth: 1,
                                borderColor: '#ffffff12',
                                backgroundColor: '#00000028',
                                overflow: 'hidden',
                            }}>
                                {source.entries.slice(0, 12).map((entry, index) => (
                                    <LogEntryRow
                                        key={`${source.id}-${entry.fingerprint}-${index}`}
                                        entry={entry}
                                        isLast={index === Math.min(source.entries.length, 12) - 1}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function LogEntryRow({ entry, isLast }: { entry: LogEntry; isLast: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const levelColor = entry.isError ? '#ff8b8b' : theme.orange

    return (
        <View style={{
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: '#ffffff10',
            paddingHorizontal: 10,
            paddingVertical: 9,
        }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <Text style={{ ...T.text12, color: levelColor, fontWeight: '700' }}>
                    {entry.level.toUpperCase()}
                </Text>
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                    {entry.timestamp ? formatLogTimestamp(entry.timestamp) : 'No timestamp'}
                </Text>
                {entry.structured ? <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>structured</Text> : null}
            </View>
            <Space height={5} />
            <Text style={{
                ...T.text12,
                color: entry.isError ? '#ffd0d0' : theme.textColor,
                lineHeight: 18,
            }}>
                {entry.message || entry.raw}
            </Text>
        </View>
    )
}

function SourcePill({ sourceType }: { sourceType: LogContainer['sourceType'] }) {
    const color = getSourceColor(sourceType)

    return (
        <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: `${color}66`,
            backgroundColor: `${color}22`,
            paddingHorizontal: 8,
            paddingVertical: 4,
        }}>
            <Text style={{ ...T.text12, color, fontWeight: '700' }}>
                {formatSourceType(sourceType)}
            </Text>
        </View>
    )
}

function formatSourceType(sourceType: LogContainer['sourceType']) {
    switch (sourceType) {
        case 'journal':
            return 'Journal'
        case 'file':
            return 'File'
        case 'history':
            return 'History'
        case 'deployment':
            return 'Deploy'
        default:
            return 'Container'
    }
}

function getSourceColor(sourceType: LogContainer['sourceType']) {
    switch (sourceType) {
        case 'journal':
            return '#60a5fa'
        case 'file':
            return '#a78bfa'
        case 'history':
            return '#facc15'
        case 'deployment':
            return '#4ade80'
        default:
            return '#fd8738'
    }
}

function formatLogTimestamp(timestamp: string) {
    const parsed = new Date(timestamp)
    if (Number.isNaN(parsed.getTime())) {
        return timestamp
    }

    return parsed.toLocaleString('nb-NO', {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
    })
}
