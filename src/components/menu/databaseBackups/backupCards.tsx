import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { formatContentDate } from '@utils/content/content'
import { TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export function BackupCard({ backup }: { backup: NativeDatabaseBackup }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const healthy = backup.status.toLowerCase().includes('up')

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>{backup.name}</Text>
                            <Space height={4} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{`ID: ${backup.id.slice(0, 12)}`}</Text>
                        </View>
                        <StatusPill label={backup.status} active={healthy} />
                    </View>
                    <Space height={10} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`Last: ${backup.lastBackup ? formatContentDate(backup.lastBackup) : 'Never'} · Next: ${backup.nextBackup || '-'}`}
                    </Text>
                    <Space height={4} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{`DB: ${backup.dbSize || '-'} · Storage: ${backup.totalStorage || '-'}`}</Text>
                    {!!backup.error && <><Space height={8} /><Text style={{ ...T.text12, color: '#ff8b8b' }}>{backup.error}</Text></>}
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

export function BackupFileCard({
    file,
    disabled,
    onRestore,
}: {
    file: NativeDatabaseBackupFile
    disabled: boolean
    onRestore: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <Cluster>
                <View style={{ padding: 14 }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>{file.service}</Text>
                    <Space height={6} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{file.file}</Text>
                    <Space height={8} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`${file.location || 'unknown'} · ${file.size || '-'} · ${file.mtime ? formatContentDate(file.mtime) : '-'}`}
                    </Text>
                    <Space height={10} />
                    <TouchableOpacity onPress={onRestore} disabled={disabled} activeOpacity={0.88}>
                        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: '#ff8b8b55', backgroundColor: '#ff8b8b18', padding: 10, alignItems: 'center' }}>
                            <Text style={{ ...T.text15, color: theme.textColor }}>Restore</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

export function TabPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
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
                <Text style={{ ...T.text12, color: active ? theme.textColor : theme.oppositeTextColor }}>{label}</Text>
            </View>
        </TouchableOpacity>
    )
}

export function MessageCard({ message, tone }: { message: string; tone: 'success' | 'error' }) {
    const color = tone === 'success' ? '#6ee7b7' : '#ff8b8b'

    return (
        <>
            <Space height={10} />
            <Cluster>
                <View style={{ padding: 12, borderWidth: 1, borderColor: `${color}55`, backgroundColor: `${color}18` }}>
                    <Text style={{ ...T.text15, color }}>{message}</Text>
                </View>
            </Cluster>
        </>
    )
}

export function EmptyCard({ label }: { label: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return <Cluster><View style={{ padding: 18, alignItems: 'center' }}><Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text></View></Cluster>
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: active ? '#6ee7b755' : '#ff8b8b55',
            backgroundColor: active ? '#6ee7b718' : '#ff8b8b18',
            paddingHorizontal: 10,
            paddingVertical: 5,
            alignSelf: 'flex-start',
        }}>
            <Text style={{ ...T.text12, color: theme.textColor }}>{label}</Text>
        </View>
    )
}
