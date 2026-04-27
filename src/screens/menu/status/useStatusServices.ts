import {
    createMonitoringService,
    createServiceNotification,
    deleteMonitoringService,
    getMonitoringService,
    listMonitoringServices,
    listServiceNotifications,
    updateMonitoringService,
} from '@utils/queenbee/api'
import { useMemo, useState } from 'react'
import { emptyNotificationForm, emptyStatusForm, getStatusFormError, statusServiceToForm } from './statusUtils'

export default function useStatusServices(failedToLoadText: string) {
    const [services, setServices] = useState<NativeMonitoringService[]>([])
    const [notifications, setNotifications] = useState<NativeServiceNotification[]>([])
    const [selected, setSelected] = useState<NativeMonitoringService | null>(null)
    const [editing, setEditing] = useState<NativeDetailedMonitoringService | null>(null)
    const [form, setForm] = useState<NativeMonitoringServiceForm>(emptyStatusForm)
    const [addingNotification, setAddingNotification] = useState(false)
    const [notificationForm, setNotificationForm] = useState<NativeServiceNotificationForm>(emptyNotificationForm)
    const [refreshing, setRefreshing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const selectedService = useMemo(() =>
        services.find(service => service.id === selected?.id) || selected,
    [selected, services])

    async function load() {
        setRefreshing(true)
        try {
            const [servicePayload, notificationPayload] = await Promise.all([
                listMonitoringServices(),
                listServiceNotifications(),
            ])
            setServices(servicePayload)
            setNotifications(notificationPayload)
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : failedToLoadText)
        } finally {
            setRefreshing(false)
        }
    }

    async function beginEdit(service: NativeMonitoringService) {
        try {
            const detailed = await getMonitoringService(service.id)
            setEditing(detailed)
            setSelected(service)
            setForm(statusServiceToForm(detailed))
            setError('')
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load service details')
        }
    }

    function beginCreate() {
        setSelected(null)
        setEditing(null)
        setForm(emptyStatusForm)
        setError('')
    }

    function selectService(service: NativeMonitoringService) {
        setSelected((current) => current?.id === service.id ? null : service)
        setEditing(null)
        setForm(emptyStatusForm)
    }

    function closeServiceDetails() {
        setSelected(null)
        setEditing(null)
        setForm(emptyStatusForm)
    }

    function cancelEdit() {
        setEditing(null)
        setForm(emptyStatusForm)
    }

    async function saveService() {
        const formError = getStatusFormError(form)
        if (formError) {
            setError(formError)
            return
        }

        setSaving(true)
        try {
            if (editing) {
                await updateMonitoringService(editing.id, form)
            } else {
                await createMonitoringService(form)
            }
            await load()
            setEditing(null)
            setSelected(null)
            setForm(emptyStatusForm)
            setError('')
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Failed to save service')
        } finally {
            setSaving(false)
        }
    }

    async function saveNotification() {
        if (!notificationForm.name.trim() || !notificationForm.webhook.trim()) {
            setError('Notification name and webhook are required.')
            return
        }

        setSaving(true)
        try {
            await createServiceNotification(notificationForm)
            setNotificationForm(emptyNotificationForm)
            setAddingNotification(false)
            setNotifications(await listServiceNotifications())
            setError('')
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Failed to create notification')
        } finally {
            setSaving(false)
        }
    }

    function cancelNotification() {
        setAddingNotification(false)
        setNotificationForm(emptyNotificationForm)
    }

    async function removeService(id: number) {
        setSaving(true)
        try {
            await deleteMonitoringService(id)
            await load()
            setEditing(null)
            setSelected(null)
            setForm(emptyStatusForm)
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete service')
        } finally {
            setSaving(false)
        }
    }

    return {
        addingNotification,
        beginCreate,
        beginEdit,
        cancelNotification,
        closeServiceDetails,
        cancelEdit,
        editing,
        error,
        form,
        load,
        notifications,
        notificationForm,
        refreshing,
        removeService,
        saveNotification,
        saveService,
        saving,
        selectService,
        selectedService,
        services,
        setAddingNotification,
        setForm,
        setNotificationForm,
    }
}
