import { formatProfileDate } from '@utils/auth/profile'
import toField from '@utils/toField'

export default function buildSummaryFields(profile: Profile | null, lang: boolean): ProfileField[] {
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
