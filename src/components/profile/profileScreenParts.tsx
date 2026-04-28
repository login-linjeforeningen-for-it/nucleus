import Text from '@components/shared/text'
import { Field } from '@components/profile/field'
import PS from '@styles/profileStyles'
import T from '@styles/text'
import { TouchableOpacity, View } from 'react-native'
import Svg, { LinearGradient, Rect, Stop } from 'react-native-svg'

export function ProfileBackground({
    theme,
    screenHeight,
    scrollPosition,
}: {
    theme: Theme
    screenHeight: number
    scrollPosition: number
}) {
    return (
        <>
            <View style={{
                ...PS.profileView,
                backgroundColor: theme.orange,
                opacity: Math.max(0, Math.min(scrollPosition / 220, 0.14)),
                transform: [{ translateY: Math.min(scrollPosition * 0.18, 18) }],
            }} />
            <Svg style={{
                height: screenHeight / 2,
                left: 0,
                position: 'absolute',
                right: 0,
                top: 0,
                width: '100%',
            }}>
                <LinearGradient id='profileGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                    <Stop offset='0%' stopColor={theme.orange} />
                    <Stop offset='100%' stopColor={theme.darker} />
                </LinearGradient>
                <Rect x='0' y='0' width='100%' height='100%' fill='url(#profileGradient)' />
            </Svg>
        </>
    )
}

export function ProfileDetailsToggle({
    fields,
    lang,
    showDetails,
    theme,
    onToggle,
}: {
    fields: ProfileField[]
    lang: boolean
    showDetails: boolean
    theme: Theme
    onToggle: () => void
}) {
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
                <View style={{ borderTopColor: '#ffffff12', borderTopWidth: 1, gap: 12, paddingTop: 12, paddingHorizontal: 24, width: '100%' }}>
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
