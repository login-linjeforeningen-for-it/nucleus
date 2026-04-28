import { View } from 'react-native'
import Cluster from '@/components/shared/cluster'
import { useSelector } from 'react-redux'
import { Field } from './field'
import { formatProfileDate } from '@utils/auth/profile'
import toField from '@utils/format/toField'

type ProfileInfoProps = {
    profile: Profile | null
}

function buildSummaryFields(profile: Profile | null, lang: boolean): ProfileField[] {
    if (!profile) {
        return []
    }

    const locale = lang ? 'nb-NO' : 'en-GB'
    const auth = profile?.authentik || {}
    const authName = auth.name && auth.name !== profile?.name ? auth.name : null
    const authEmail = auth.email && auth.email !== profile?.email ? auth.email : null
    const fields: Array<ProfileField | null> = [
        toField(lang, lang ? 'Brukernavn' : 'Username', profile?.username || auth.username),
        toField(lang, 'Authentik name', authName),
        toField(lang, 'Authentik email', authEmail),
        toField(lang, 'E-post', profile?.email || auth.email, { verified: profile?.emailVerified === true }),
        toField(lang, lang ? 'Fornavn' : 'Given name', profile?.givenName),
        toField(lang, lang ? 'Etternavn' : 'Family name', profile?.familyName),
        toField(lang, lang ? 'Sist innlogget' : 'Last login', formatProfileDate(auth.lastLogin || null, locale)),
    ]

    return fields.filter((field): field is ProfileField => Boolean(field))
}

/**
 * Function for drawing a very small square of the category of the event
 *
 * @param {string} category    Category of the event, Format: "CATEGORY"
 * @returns                     Small circle of the categories color
 */
export default function ProfileInfo({ profile }: ProfileInfoProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const fields = buildSummaryFields(profile, lang)

    return (
        <Cluster noColor={true} marginHorizontal={12}>
            <View style={{ gap: 12, width: '100%' }}>
                {fields.map((field) => (
                    <Field
                        key={field.title}
                        theme={theme}
                        title={field.title}
                        text={field.text}
                        copyValue={field.copyValue}
                        verified={field.verified}
                        wrapEvery={field.wrapEvery}
                    />
                ))}
            </View>
        </Cluster>
    )
}
