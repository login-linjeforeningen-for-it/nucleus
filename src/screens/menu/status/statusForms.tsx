import Cluster from '@/components/shared/cluster'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'
import { ActionButton, Field } from './statusPrimitives'
import ServiceFormFields from './statusServiceFields'

export function ServiceForm({
    form,
    notifications,
    onChange,
    onSave,
    onCancel,
    onDelete,
    onAddNotification,
    saving,
    editing,
    open = true,
    onToggle,
}: {
    form: NativeMonitoringServiceForm
    notifications: NativeServiceNotification[]
    onChange: (form: NativeMonitoringServiceForm) => void
    onSave: () => void
    onCancel: () => void
    onDelete?: () => void
    onAddNotification: () => void
    saving: boolean
    editing: boolean
    open?: boolean
    onToggle?: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const isCollapsible = Boolean(onToggle)
    const showFields = !isCollapsible || open
    return (
        <Cluster style={{
            borderWidth: 1,
            borderRadius: 8,
            borderColor: theme.greyTransparentBorder,
            backgroundColor: theme.greyTransparent,
        }}>
            <View style={{ padding: 12, gap: showFields ? 12 : 0 }}>
                {isCollapsible ? (
                    <Pressable
                        onPress={onToggle}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <View>
                            <Text style={{ ...T.text20, color: theme.textColor }}>New service</Text>
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                Add a monitoring target
                            </Text>
                        </View>
                        <Text style={{
                            ...T.text25,
                            color: theme.orange,
                            lineHeight: 28,
                            transform: [{ rotate: open ? '90deg' : '0deg' }],
                        }}>
                            ›
                        </Text>
                    </Pressable>
                ) : (
                    <Text style={{ ...T.text20, color: theme.textColor }}>
                        {editing ? 'Edit service' : 'New service'}
                    </Text>
                )}
                {showFields && (
                    <>
                        <ServiceFormFields
                            form={form}
                            notifications={notifications}
                            onChange={onChange}
                            onAddNotification={onAddNotification}
                        />
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            <ActionButton
                                label={saving ? 'Saving...' : editing ? 'Update service' : 'Create service'}
                                onPress={onSave}
                                disabled={saving}
                            />
                            <ActionButton
                                label='Cancel'
                                onPress={onCancel}
                                secondary
                                disabled={saving}
                            />
                            {onDelete && (
                                <ActionButton
                                    label='Delete'
                                    onPress={onDelete}
                                    danger
                                    disabled={saving}
                                />
                            )}
                        </View>
                    </>
                )}
            </View>
        </Cluster>
    )
}

export function NotificationForm({
    form,
    onChange,
    onSave,
    onCancel,
    saving,
}: {
    form: NativeServiceNotificationForm
    onChange: (form: NativeServiceNotificationForm) => void
    onSave: () => void
    onCancel: () => void
    saving: boolean
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <Cluster style={{ borderWidth: 1, borderColor: theme.orangeTransparentBorder, backgroundColor: theme.greyTransparent }}>
            <View style={{ padding: 12, gap: 12 }}>
                <Text style={{ ...T.text20, color: theme.textColor }}>New notification</Text>
                <Field label='Name' value={form.name} onChangeText={(value) => onChange({ ...form, name: value })} />
                <Field label='Message' value={form.message} onChangeText={(value) => onChange({ ...form, message: value })} />
                <Field label='Webhook' value={form.webhook} onChangeText={(value) => onChange({ ...form, webhook: value })} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <ActionButton
                        label={saving ? 'Saving...' : 'Create notification'}
                        onPress={onSave}
                        disabled={saving}
                    />
                    <ActionButton
                        label='Cancel'
                        onPress={onCancel}
                        secondary
                        disabled={saving}
                    />
                </View>
            </View>
        </Cluster>
    )
}
