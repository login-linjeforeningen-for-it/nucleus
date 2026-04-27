import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function LogSourceCard({
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
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                <SourceTitle source={source} />
                                <Text style={{ ...T.text20, color: theme.orange }}>{expanded ? '−' : '+'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {expanded ? <LogEntryList source={source} /> : null}
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function SourceTitle({ source }: { source: LogContainer }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
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
    )
}

function LogEntryList({ source }: { source: LogContainer }) {
    return (
        <View style={{ borderTopWidth: 1, borderTopColor: '#ffffff12', paddingHorizontal: 12, paddingVertical: 10 }}>
            <View style={{ borderRadius: 14, borderWidth: 1, borderColor: '#ffffff12', backgroundColor: '#00000028', overflow: 'hidden' }}>
                {source.entries.slice(0, 12).map((entry, index) => (
                    <LogEntryRow
                        key={`${source.id}-${entry.fingerprint}-${index}`}
                        entry={entry}
                        isLast={index === Math.min(source.entries.length, 12) - 1}
                    />
                ))}
            </View>
        </View>
    )
}

function LogEntryRow({ entry, isLast }: { entry: LogEntry; isLast: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const levelColor = entry.isError ? '#ff8b8b' : theme.orange

    return (
        <View style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#ffffff10', paddingHorizontal: 10, paddingVertical: 9 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <Text style={{ ...T.text12, color: levelColor, fontWeight: '700' }}>{entry.level.toUpperCase()}</Text>
                <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{entry.timestamp ? formatLogTimestamp(entry.timestamp) : 'No timestamp'}</Text>
                {entry.structured ? <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>structured</Text> : null}
            </View>
            <Space height={5} />
            <Text style={{ ...T.text12, color: entry.isError ? '#ffd0d0' : theme.textColor, lineHeight: 18 }}>
                {entry.message || entry.raw}
            </Text>
        </View>
    )
}

function SourcePill({ sourceType }: { sourceType: LogContainer['sourceType'] }) {
    const color = getSourceColor(sourceType)

    return (
        <View style={{ borderRadius: 999, borderWidth: 1, borderColor: `${color}66`, backgroundColor: `${color}22`, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ ...T.text12, color, fontWeight: '700' }}>{formatSourceType(sourceType)}</Text>
        </View>
    )
}

function formatSourceType(sourceType: LogContainer['sourceType']) {
    switch (sourceType) {
        case 'journal': return 'Journal'
        case 'file': return 'File'
        case 'history': return 'History'
        case 'deployment': return 'Deploy'
        default: return 'Container'
    }
}

function getSourceColor(sourceType: LogContainer['sourceType']) {
    switch (sourceType) {
        case 'journal': return '#60a5fa'
        case 'file': return '#a78bfa'
        case 'history': return '#facc15'
        case 'deployment': return '#4ade80'
        default: return '#fd8738'
    }
}

function formatLogTimestamp(timestamp: string) {
    const parsed = new Date(timestamp)
    if (Number.isNaN(parsed.getTime())) return timestamp
    return parsed.toLocaleString('nb-NO', { day: '2-digit', hour: '2-digit', minute: '2-digit', month: 'short' })
}
