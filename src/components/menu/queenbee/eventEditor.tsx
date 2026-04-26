import Space from '@/components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { JSX } from 'react'
import { Switch, TextInput, TouchableOpacity, View } from 'react-native'

type EditableEventState = {
    id: number
    name_no: string
    name_en: string
    description_no: string
    description_en: string
    time_start: string
    time_end: string
    link_signup: string
    visible: boolean
    highlight: boolean
    canceled: boolean
}

type Props = {
    form: EditableEventState
    theme: Theme
    saving: boolean
    onChange: (next: EditableEventState) => void
    onSave: () => void
}

export default function EventEditor({ form, theme, saving, onChange, onSave }: Props): JSX.Element {
    function update<K extends keyof EditableEventState>(key: K, value: EditableEventState[K]) {
        onChange({ ...form, [key]: value })
    }

    return (
        <View style={{ borderRadius: 18, backgroundColor: theme.contrast, padding: 14 }}>
            <Text style={{ ...T.text20, color: theme.textColor }}>Edit event</Text>
            <Space height={12} />
            {[
                ['Norwegian title', 'name_no'],
                ['English title', 'name_en'],
                ['Start', 'time_start'],
                ['End', 'time_end'],
                ['Signup link', 'link_signup'],
            ].map(([label, key]) => (
                <View key={key} style={{ marginBottom: 10 }}>
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
                    <TextInput
                        value={String(form[key as keyof EditableEventState] ?? '')}
                        onChangeText={(value) => update(key as keyof EditableEventState, value as never)}
                        placeholderTextColor={theme.oppositeTextColor}
                        style={{
                            marginTop: 6,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: theme.background,
                            backgroundColor: theme.background,
                            color: theme.textColor,
                            paddingHorizontal: 12,
                            paddingVertical: 10
                        }}
                    />
                </View>
            ))}
            {[
                ['Norwegian description', 'description_no'],
                ['English description', 'description_en'],
            ].map(([label, key]) => (
                <View key={key} style={{ marginBottom: 10 }}>
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{label}</Text>
                    <TextInput
                        multiline
                        value={String(form[key as keyof EditableEventState] ?? '')}
                        onChangeText={(value) => update(key as keyof EditableEventState, value as never)}
                        placeholderTextColor={theme.oppositeTextColor}
                        style={{
                            marginTop: 6,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: theme.background,
                            backgroundColor: theme.background,
                            color: theme.textColor,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            minHeight: 120,
                            textAlignVertical: 'top'
                        }}
                    />
                </View>
            ))}
            {[
                ['Visible', 'visible'],
                ['Highlighted', 'highlight'],
                ['Canceled', 'canceled'],
            ].map(([label, key]) => (
                <View key={key} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10
                }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>{label}</Text>
                    <Switch
                        value={Boolean(form[key as keyof EditableEventState])}
                        onValueChange={(value) => update(key as keyof EditableEventState, value as never)}
                        trackColor={{ false: theme.background, true: theme.orange }}
                    />
                </View>
            ))}
            <TouchableOpacity onPress={onSave}>
                <View style={{
                    borderRadius: 16,
                    backgroundColor: theme.orange,
                    paddingHorizontal: 16,
                    paddingVertical: 12
                }}>
                    <Text style={{ ...T.centered20, color: theme.darker }}>
                        {saving ? 'Saving...' : 'Save event'}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}
