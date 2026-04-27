import Space from '@/components/shared/utils'
import InternalNavMenu from '@components/menu/queenbee/internalNavMenu'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { JSX, useEffect, useState } from 'react'
import { Alert, Dimensions, RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'
import {
    NotificationForm,
    ServiceForm,
    ServiceRow,
} from './status/statusComponents'
import useStatusServices from './status/useStatusServices'

export default function StatusScreen({ navigation }: MenuProps<'StatusScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').status : require('@text/en.json').status
    const status = useStatusServices(text.failedToLoad)
    const [newServiceOpen, setNewServiceOpen] = useState(false)

    function confirmDelete() {
        if (!status.editing) {
            return
        }

        Alert.alert('Delete service', `Delete ${status.editing.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => void status.removeService(status.editing!.id),
            },
        ])
    }

    useEffect(() => {
        void status.load()
    }, [])

    return (
        <Swipe left='QueenbeeScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <InternalNavMenu activeRoute='StatusScreen' navigation={navigation} />
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={status.refreshing}
                            onRefresh={() => void status.load()}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyboardShouldPersistTaps='handled'
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    {status.error && <Text style={{ ...T.text15, color: '#ff8b8b' }}>{status.error}</Text>}
                    <Space height={10} />
                    {status.editing && (
                        <>
                            {status.addingNotification && (
                                <>
                                    <NotificationForm
                                        form={status.notificationForm}
                                        onChange={status.setNotificationForm}
                                        onSave={() => void status.saveNotification()}
                                        onCancel={status.cancelNotification}
                                        saving={status.saving}
                                    />
                                    <Space height={10} />
                                </>
                            )}
                            <ServiceForm
                                form={status.form}
                                notifications={status.notifications}
                                onChange={status.setForm}
                                onSave={() => void status.saveService()}
                                onCancel={status.cancelEdit}
                                onDelete={status.editing ? confirmDelete : undefined}
                                onAddNotification={() => status.setAddingNotification(true)}
                                saving={status.saving}
                                editing
                            />
                            <Space height={10} />
                        </>
                    )}
                    {!status.editing && !status.selectedService && (
                        <>
                            {newServiceOpen && (
                                <>
                                    {status.addingNotification && (
                                        <>
                                            <NotificationForm
                                                form={status.notificationForm}
                                                onChange={status.setNotificationForm}
                                                onSave={() => void status.saveNotification()}
                                                onCancel={status.cancelNotification}
                                                saving={status.saving}
                                            />
                                            <Space height={10} />
                                        </>
                                    )}
                                </>
                            )}
                            <ServiceForm
                                form={status.form}
                                notifications={status.notifications}
                                onChange={status.setForm}
                                onSave={() => void status.saveService()}
                                onCancel={() => {
                                    status.cancelEdit()
                                    setNewServiceOpen(false)
                                }}
                                onAddNotification={() => status.setAddingNotification(true)}
                                saving={status.saving}
                                editing={false}
                                open={newServiceOpen}
                                onToggle={() => setNewServiceOpen(current => !current)}
                            />
                            <Space height={10} />
                        </>
                    )}
                    {status.services.map((service) => (
                        <View key={service.id}>
                            <ServiceRow
                                service={service}
                                selected={status.selectedService?.id === service.id}
                                showDetails={!status.editing && status.selectedService?.id === service.id}
                                onClose={status.closeServiceDetails}
                                onPress={() => status.selectService(service)}
                                onEdit={() => void status.beginEdit(service)}
                            />
                            <Space height={10} />
                        </View>
                    ))}
                </ScrollView>
                <TopRefreshIndicator refreshing={status.refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}
