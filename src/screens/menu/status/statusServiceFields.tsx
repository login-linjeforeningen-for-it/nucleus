import Text from '@components/shared/text'
import T from '@styles/text'
import { Pressable, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'
import { ChoicePill, Field, ToggleRow } from './statusPrimitives'

type ServiceFieldsProps = {
    form: NativeMonitoringServiceForm
    notifications: NativeServiceNotification[]
    onChange: (form: NativeMonitoringServiceForm) => void
    onAddNotification: () => void
}

export default function ServiceFormFields({
    form,
    notifications,
    onChange,
    onAddNotification,
}: ServiceFieldsProps) {
    const update = <K extends keyof NativeMonitoringServiceForm>(key: K, value: NativeMonitoringServiceForm[K]) =>
        onChange({ ...form, [key]: value })

    return (
        <>
            <Field label='Name' value={form.name} onChangeText={(value) => update('name', value)} />
            <Segmented
                label='Type'
                value={form.type}
                options={['fetch', 'post', 'tcp']}
                onChange={(value) => update('type', value as NativeMonitoringServiceForm['type'])}
            />
            <Field label={form.type === 'tcp' ? 'Host' : 'URL'} value={form.url} onChangeText={(value) => update('url', value)} />
            {form.type === 'tcp' ? (
                <Field label='Port' value={String(form.port)} keyboardType='number-pad' onChangeText={(value) => update('port', Number(value) || 0)} />
            ) : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                    <Field label='Interval seconds' value={String(form.interval)} keyboardType='number-pad' onChangeText={(value) => update('interval', Number(value) || 0)} />
                </View>
                <View style={{ flex: 1 }}>
                    <Field
                        label='Max failures'
                        value={String(form.maxConsecutiveFailures)}
                        keyboardType='number-pad'
                        onChangeText={(value) => update('maxConsecutiveFailures', Number(value) || 0)}
                    />
                </View>
            </View>
            <Field label='User agent' value={form.userAgent || ''} onChangeText={(value) => update('userAgent', value || null)} />
            <Field label='Note' value={form.note || ''} onChangeText={(value) => update('note', value)} multiline />
            <NotificationPicker
                value={form.notification}
                notifications={notifications}
                onChange={(value) => update('notification', value)}
                onAdd={onAddNotification}
            />
            <ToggleRow label='Expected down' value={form.expectedDown} onValueChange={(value) => update('expectedDown', value)} />
            <ToggleRow label='Upside down' value={form.upsideDown} onValueChange={(value) => update('upsideDown', value)} />
            <ToggleRow label='Enabled' value={form.enabled} onValueChange={(value) => update('enabled', value)} />
        </>
    )
}

function Segmented({
    label,
    value,
    options,
    onChange,
}: {
    label: string
    value: string
    options: string[]
    onChange: (value: string) => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ gap: 6 }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {options.map(option => (
                    <Pressable
                        key={option}
                        onPress={() => onChange(option)}
                        style={{
                            flex: 1,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: value === option ? theme.orangeTransparentBorder : theme.greyTransparentBorder,
                            backgroundColor: value === option ? theme.orangeTransparent : '#ffffff08',
                            paddingVertical: 10,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ ...T.text12, color: theme.textColor }}>{option.toUpperCase()}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    )
}

function NotificationPicker({
    value,
    notifications,
    onChange,
    onAdd,
}: {
    value: string | null
    notifications: NativeServiceNotification[]
    onChange: (value: string | null) => void
    onAdd: () => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ gap: 6 }}>
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>Notification</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <ChoicePill label='None' active={!value} onPress={() => onChange(null)} />
                    <ChoicePill label='+ New' active={false} onPress={onAdd} />
                    {notifications.map(notification => (
                        <ChoicePill
                            key={notification.id}
                            label={notification.name}
                            active={value === String(notification.id)}
                            onPress={() => onChange(String(notification.id))}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}
