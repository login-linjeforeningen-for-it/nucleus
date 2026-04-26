export const emptyStatusForm: NativeMonitoringServiceForm = {
    name: '',
    type: 'fetch',
    url: '',
    port: 22,
    interval: 60,
    userAgent: null,
    notification: null,
    expectedDown: false,
    upsideDown: false,
    maxConsecutiveFailures: 0,
    note: '',
    enabled: true,
}

export const emptyNotificationForm: NativeServiceNotificationForm = {
    name: '',
    message: '',
    webhook: '',
}

export function statusServiceToForm(service: NativeDetailedMonitoringService): NativeMonitoringServiceForm {
    return {
        name: service.name,
        type: service.type,
        url: service.url || '',
        port: service.port || 22,
        interval: service.interval || 60,
        userAgent: service.userAgent || null,
        notification: service.notification ? String(service.notification) : null,
        expectedDown: service.expectedDown,
        upsideDown: service.upsideDown,
        maxConsecutiveFailures: Number(service.maxConsecutiveFailures) || 0,
        note: service.note || '',
        enabled: service.enabled,
    }
}

export function getStatusFormError(form: NativeMonitoringServiceForm) {
    if (!form.name.trim() || !form.type || !form.interval || !form.maxConsecutiveFailures && form.maxConsecutiveFailures !== 0) {
        return 'Name, type, interval and max consecutive failures are required.'
    }

    if (form.type !== 'post' && !form.url.trim()) {
        return 'URL is required for fetch and TCP checks.'
    }

    return ''
}
