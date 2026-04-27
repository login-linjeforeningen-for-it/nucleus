import Text from '@components/shared/text'
import { Field } from '@components/profile/field'
import { TouchableOpacity, View } from 'react-native'
import T from '@styles/text'

type ProfileDetailsToggleProps = {
    fields: ProfileField[]
    lang: boolean
    showDetails: boolean
    theme: Theme
    onToggle: () => void
}

export default function ProfileDetailsToggle({
    fields,
    lang,
    showDetails,
    theme,
    onToggle
}: ProfileDetailsToggleProps) {
    return (
        <>
            <TouchableOpacity
                onPress={onToggle}
                style={{ paddingLeft: 24, paddingVertical: 16 }}
            >
                <Text style={{ ...T.text15, color: theme.oppositeTextColor, opacity: 0.55 }}>
                    {showDetails
                        ? (lang ? 'Skjul detaljer' : 'Hide details')
                        : (lang ? 'Detaljer' : 'Details')}
                </Text>
            </TouchableOpacity>
            {showDetails ? (
                <View style={{
                    borderTopColor: '#ffffff12',
                    borderTopWidth: 1,
                    gap: 12,
                    paddingTop: 12,
                    paddingHorizontal: 24,
                    width: '100%'
                }}>
                    {fields.map((field) => (
                        <Field
                            key={field.title}
                            title={field.title}
                            theme={theme}
                            text={field.text}
                            copyValue={field.copyValue}
                            verified={field.verified}
                            wrapEvery={field.wrapEvery}
                        />
                    ))}
                </View>
            ) : null}
        </>
    )
}
