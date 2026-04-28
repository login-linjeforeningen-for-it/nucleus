import { formatProfileDate } from '@utils/auth/profile'
import { formatValue, normalizeGroup, toField } from '@utils/format/profileFields'

export function buildDetailFields(profile: Profile | null, lang: boolean): ProfileField[] {
    if (!profile) {
        return []
    }

    const locale = lang ? 'nb-NO' : 'en-GB'
    const auth = profile?.authentik || {}
    const groups = Array.isArray(profile.groups) ? profile.groups : []
    const authentikGroups = Array.isArray(auth.groups) ? auth.groups : []
    const fields: Array<ProfileField | null> = [
        toCopyField(lang, 'ID', profile.id, { wrapEvery: 6 }),
        toCopyField(lang, 'Name', profile.name),
        toCopyField(lang, 'Email', profile.email || auth.email, { verified: profile.emailVerified === true }),
        toCopyField(lang, 'Email verified', profile.emailVerified),
        toCopyField(lang, 'Username', profile.username || auth.username),
        toCopyField(lang, 'Preferred username', profile.preferredUsername),
        toCopyField(lang, 'Nickname', profile.nickname),
        toCopyField(lang, 'Given name', profile.givenName),
        toCopyField(lang, 'Family name', profile.familyName),
        toCopyField(lang, 'Picture', profile.picture),
        toCopyField(lang, 'Groups', groups.join(', ')),
        toCopyField(lang, 'Authentik available', auth.available),
        toCopyField(lang, 'Authentik PK', auth.pk),
        toCopyField(lang, 'UID', auth.uid, { wrapEvery: 6 }),
        toCopyField(lang, 'Authentik username', auth.username),
        toCopyField(lang, 'Authentik name', auth.name),
        toCopyField(lang, 'Authentik email', auth.email),
        toCopyField(lang, 'Active', auth.isActive),
        toCopyField(lang, 'Last login', formatProfileDate(auth.lastLogin || null, locale)),
        toCopyField(lang, 'Date joined', formatProfileDate(auth.dateJoined || null, locale)),
        toCopyField(lang, 'Type', auth.type),
        toCopyField(lang, 'Path', auth.path),
        toCopyField(lang, 'Authentik groups', authentikGroups.map(normalizeGroup).filter(Boolean).join(', ')),
        ...getProfileAttributes(profile).map((attribute) => toCopyField(lang, attribute.key, attribute.value)),
    ]

    return fields.filter((field): field is ProfileField => Boolean(field))
}

function toCopyField(
    lang: boolean,
    title: string,
    value: unknown,
    options: Pick<ProfileField, 'verified' | 'wrapEvery'> = {}
): ProfileField | null {
    const field = toField(lang, title, value, options)

    if (!field) {
        return null
    }

    return { ...field, copyValue: formatValue(value, lang) || field.text }
}

function getProfileAttributes(profile: Profile | null) {
    const attributes = profile?.authentik?.attributes

    if (!attributes) {
        return []
    }

    return Object.entries(attributes)
        .filter(([, value]) => value !== null && value !== undefined && String(value).length > 0)
        .map(([key, value]) => ({
            key,
            value: Array.isArray(value) ? value.join(', ') : String(value),
        }))
}
