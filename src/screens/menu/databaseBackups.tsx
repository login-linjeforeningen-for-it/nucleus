import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { filterByContentQuery, formatContentDate } from '@utils/content'
import {
    listDatabaseBackupFiles,
    listDatabaseBackups,
    restoreDatabaseBackup,
    triggerDatabaseBackup,
} from '@utils/queenbee/api'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Alert, RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

type BackupTab = 'containers' | 'files'

export default function DatabaseBackupsScreen({ navigation }: MenuProps<'DatabaseBackupsScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [activeTab, setActiveTab] = useState<BackupTab>('containers')
    const [backups, setBackups] = useState<NativeDatabaseBackup[]>([])
    const [files, setFiles] = useState<NativeDatabaseBackupFile[]>([])
    const [query, setQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const visibleBackups = useMemo(() => filterByContentQuery(backups, query, (backup) => [
        backup.id,
        backup.name,
        backup.status,
        backup.lastBackup,
        backup.nextBackup,
        backup.error,
    ]), [backups, query])
    const visibleFiles = useMemo(() => filterByContentQuery(files, query, (file) => [
        file.service,
        file.file,
        file.size,
        file.mtime,
        file.location,
    ]), [files, query])

    async function load() {
        setRefreshing(true)
        try {
            const [nextBackups, nextFiles] = await Promise.all([
                listDatabaseBackups(),
                listDatabaseBackupFiles(),
            ])
            setBackups(nextBackups)
            setFiles(nextFiles)
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load backups')
        } finally {
            setRefreshing(false)
        }
    }

    async function triggerBackup() {
        setSaving(true)
        try {
            const result = await triggerDatabaseBackup()
            setNotice(result.message || 'Backup triggered')
            await load()
        } catch (backupError) {
            setError(backupError instanceof Error ? backupError.message : 'Failed to trigger backup')
        } finally {
            setSaving(false)
        }
    }

    function confirmRestore(file: NativeDatabaseBackupFile) {
        Alert.alert(
            'Restore backup',
            `Restore ${file.service} from ${file.file}? This can overwrite the active database.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: () => void restoreBackup(file),
                },
            ],
        )
    }

    async function restoreBackup(file: NativeDatabaseBackupFile) {
        setSaving(true)
        try {
            const result = await restoreDatabaseBackup({ service: file.service, file: file.file })
            setNotice(result.message || 'Restore started')
            await load()
        } catch (restoreError) {
            setError(restoreError instanceof Error ? restoreError.message : 'Failed to restore backup')
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    return (
        <Swipe left='DatabaseScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='DatabaseBackupsScreen' navigation={navigation} />
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
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 90 }}
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <Cluster>
                        <View style={{ padding: 14 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>Database Backups</Text>
                            <Space height={8} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                Review backup health, trigger a fresh backup, and restore from available backup files.
                            </Text>
                            <Space height={12} />
                            <TouchableOpacity onPress={() => void triggerBackup()} disabled={saving} activeOpacity={0.88}>
                                <View style={{
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: theme.orangeTransparentBorderHighlighted,
                                    backgroundColor: theme.orangeTransparent,
                                    padding: 12,
                                    alignItems: 'center',
                                }}>
                                    <Text style={{ ...T.text15, color: theme.textColor }}>
                                        {saving ? 'Working...' : 'Backup all databases'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Cluster>

                    {!!notice && <MessageCard message={notice} tone='success' />}
                    {!!error && <MessageCard message={error} tone='error' />}

                    <Space height={10} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                <TabPill
                                    label={`Containers · ${backups.length}`}
                                    active={activeTab === 'containers'}
                                    onPress={() => setActiveTab('containers')}
                                />
                                <TabPill
                                    label={`Restore files · ${files.length}`}
                                    active={activeTab === 'files'}
                                    onPress={() => setActiveTab('files')}
                                />
                            </View>
                            <Space height={12} />
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder='Search backups...'
                                placeholderTextColor={theme.oppositeTextColor}
                                autoCapitalize='none'
                                autoCorrect={false}
                                style={{
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: '#ffffff18',
                                    backgroundColor: theme.contrast,
                                    color: theme.textColor,
                                    padding: 10,
                                    fontSize: T.text15.fontSize,
                                }}
                            />
                        </View>
                    </Cluster>

                    <Space height={10} />
                    {activeTab === 'containers' && (visibleBackups.length
                        ? visibleBackups.map((backup) => <BackupCard key={backup.id} backup={backup} />)
                        : <EmptyCard label='No backup containers found.' />)}
                    {activeTab === 'files' && (visibleFiles.length
                        ? visibleFiles.map((file) => (
                            <BackupFileCard
                                key={`${file.service}-${file.file}-${file.location || 'unknown'}`}
                                file={file}
                                disabled={saving}
                                onRestore={() => confirmRestore(file)}
                            />
                        ))
                        : <EmptyCard label='No backup files found.' />)}
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function BackupCard({ backup }: { backup: NativeDatabaseBackup }) {
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
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                {`ID: ${backup.id.slice(0, 12)}`}
                            </Text>
                        </View>
                        <StatusPill label={backup.status} active={healthy} />
                    </View>
                    <Space height={10} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`Last: ${backup.lastBackup ? formatContentDate(backup.lastBackup) : 'Never'} · Next: ${
                            backup.nextBackup || '-'
                        }`}
                    </Text>
                    <Space height={4} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`DB: ${backup.dbSize || '-'} · Storage: ${backup.totalStorage || '-'}`}
                    </Text>
                    {!!backup.error && (
                        <>
                            <Space height={8} />
                            <Text style={{ ...T.text12, color: '#ff8b8b' }}>{backup.error}</Text>
                        </>
                    )}
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function BackupFileCard({
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
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {file.file}
                    </Text>
                    <Space height={8} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`${file.location || 'unknown'} · ${file.size || '-'} · ${
                            file.mtime ? formatContentDate(file.mtime) : '-'
                        }`}
                    </Text>
                    <Space height={10} />
                    <TouchableOpacity onPress={onRestore} disabled={disabled} activeOpacity={0.88}>
                        <View style={{
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: '#ff8b8b55',
                            backgroundColor: '#ff8b8b18',
                            padding: 10,
                            alignItems: 'center',
                        }}>
                            <Text style={{ ...T.text15, color: theme.textColor }}>Restore</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Cluster>
            <Space height={10} />
        </>
    )
}

function TabPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
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
                <Text style={{ ...T.text12, color: active ? theme.textColor : theme.oppositeTextColor }}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    )
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

function MessageCard({ message, tone }: { message: string; tone: 'success' | 'error' }) {
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

function EmptyCard({ label }: { label: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster>
            <View style={{ padding: 18, alignItems: 'center' }}>
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
            </View>
        </Cluster>
    )
}
