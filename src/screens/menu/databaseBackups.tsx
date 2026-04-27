import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { BackupCard, BackupFileCard, EmptyCard, MessageCard, TabPill } from '@components/menu/databaseBackups/backupCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { filterByContentQuery } from '@utils/content/content'
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

export default function DatabaseBackupsScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [activeTab, setActiveTab] = useState<BackupTab>('containers')
    const [backups, setBackups] = useState<NativeDatabaseBackup[]>([])
    const [files, setFiles] = useState<NativeDatabaseBackupFile[]>([])
    const [query, setQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const visibleBackups = useVisibleBackups(backups, query)
    const visibleFiles = useVisibleFiles(files, query)

    async function load() {
        setRefreshing(true)
        try {
            const [nextBackups, nextFiles] = await Promise.all([listDatabaseBackups(), listDatabaseBackupFiles()])
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
        load()
    }, [])

    return (
        <Swipe left='DatabaseScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load()} tintColor={theme.orange} colors={[theme.orange]} progressViewOffset={0} />}
                    style={GS.content}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 90 }}
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={90} />
                    <BackupHero saving={saving} onBackup={() => triggerBackup()} />
                    {!!notice && <MessageCard message={notice} tone='success' />}
                    {!!error && <MessageCard message={error} tone='error' />}
                    <BackupFilters
                        activeTab={activeTab}
                        backupsCount={backups.length}
                        filesCount={files.length}
                        query={query}
                        setActiveTab={setActiveTab}
                        setQuery={setQuery}
                    />
                    <Space height={10} />
                    <BackupResults
                        activeTab={activeTab}
                        backups={visibleBackups}
                        files={visibleFiles}
                        saving={saving}
                        onRestore={(file) => confirmRestore(file, () => restoreBackup(file))}
                    />
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function useVisibleBackups(backups: NativeDatabaseBackup[], query: string) {
    return useMemo(() => filterByContentQuery(backups, query, backup => [
        backup.id, backup.name, backup.status, backup.lastBackup, backup.nextBackup, backup.error,
    ]), [backups, query])
}

function useVisibleFiles(files: NativeDatabaseBackupFile[], query: string) {
    return useMemo(() => filterByContentQuery(files, query, file => [
        file.service, file.file, file.size, file.mtime, file.location,
    ]), [files, query])
}

function BackupHero({ saving, onBackup }: { saving: boolean, onBackup: () => void }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return (
        <Cluster>
            <View style={{ padding: 14 }}>
                <Text style={{ ...T.text25, color: theme.textColor }}>Database Backups</Text>
                <Space height={8} />
                <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                    Review backup health, trigger a fresh backup, and restore from available backup files.
                </Text>
                <Space height={12} />
                <TouchableOpacity onPress={onBackup} disabled={saving} activeOpacity={0.88}>
                    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: theme.orangeTransparentBorderHighlighted, backgroundColor: theme.orangeTransparent, padding: 12, alignItems: 'center' }}>
                        <Text style={{ ...T.text15, color: theme.textColor }}>{saving ? 'Working...' : 'Backup all databases'}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Cluster>
    )
}

function BackupFilters({ activeTab, backupsCount, filesCount, query, setActiveTab, setQuery }: {
    activeTab: BackupTab
    backupsCount: number
    filesCount: number
    query: string
    setActiveTab: (tab: BackupTab) => void
    setQuery: (query: string) => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    return (
        <>
            <Space height={10} />
            <Cluster>
                <View style={{ padding: 12 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <TabPill label={`Containers · ${backupsCount}`} active={activeTab === 'containers'} onPress={() => setActiveTab('containers')} />
                        <TabPill label={`Restore files · ${filesCount}`} active={activeTab === 'files'} onPress={() => setActiveTab('files')} />
                    </View>
                    <Space height={12} />
                    <TextInput value={query} onChangeText={setQuery} placeholder='Search backups...' placeholderTextColor={theme.oppositeTextColor} autoCapitalize='none' autoCorrect={false} style={{
                        borderRadius: 16, borderWidth: 1, borderColor: '#ffffff18', backgroundColor: theme.contrast, color: theme.textColor, padding: 10, fontSize: T.text15.fontSize,
                    }} />
                </View>
            </Cluster>
        </>
    )
}

function BackupResults({ activeTab, backups, files, saving, onRestore }: {
    activeTab: BackupTab
    backups: NativeDatabaseBackup[]
    files: NativeDatabaseBackupFile[]
    saving: boolean
    onRestore: (file: NativeDatabaseBackupFile) => void
}) {
    if (activeTab === 'containers') {
        return backups.length ? backups.map(backup => <BackupCard key={backup.id} backup={backup} />) : <EmptyCard label='No backup containers found.' />
    }

    return files.length
        ? files.map(file => <BackupFileCard key={`${file.service}-${file.file}-${file.location || 'unknown'}`} file={file} disabled={saving} onRestore={() => onRestore(file)} />)
        : <EmptyCard label='No backup files found.' />
}

function confirmRestore(file: NativeDatabaseBackupFile, onConfirm: () => void) {
    Alert.alert('Restore backup', `Restore ${file.service} from ${file.file}? This can overwrite the active database.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive', onPress: onConfirm },
    ])
}
