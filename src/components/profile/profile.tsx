import { Image, TouchableOpacity, View, Text } from 'react-native'
import PS from '@styles/profileStyles'
import T from '@styles/text'
import { useSelector } from 'react-redux'
import { formatProfileDate } from '@utils/auth/profile'
import { Check, Copy } from 'lucide-react-native'
import { copyToClipboard } from '@utils/general/clipboard'
import { useEffect, useRef, useState } from 'react'

type ProfileElementprops = {
    profile: Profile | null
}

type MainProfileInfoProps = {
    profile: Profile | null
}

function formatBoolean(value: boolean | null | undefined, lang: boolean) {
    if (typeof value !== 'boolean') {
        return lang ? 'Ukjent' : 'Unknown'
    }

    return value ? (lang ? 'Ja' : 'Yes') : 'No'
}

/**
 * Function for drawing a very small square of the category of the event
 *
 * @param {string} category    Category of the event, Format: "CATEGORY"
 * @returns                     Small circle of the categories color
 */
export default function Profile({ profile }: ProfileElementprops) {
    return (
        <View style={PS.profileBackground}>
            <View style={PS.leftTwin}>
                <SmallProfileImage profile={profile} />
            </View>
            <View style={PS.rightTwin}>
                <MainProfileInfo profile={profile} />
            </View>
        </View>
    )
}

function SmallProfileImage({ profile }: ProfileElementprops) {
    if (profile?.picture) {
        return (
            <View style={PS.smallProfileImageView}>
                <Image
                    source={{ uri: profile.picture }}
                    style={PS.midProfileImage}
                />
            </View>
        )
    }

    return (
        <View style={PS.smallProfileImageView}>
            <View style={{
                ...PS.midProfileImage,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.04)',
            }}>
                <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.14)',
                    marginBottom: 6,
                }} />
                <View style={{
                    width: 40,
                    height: 24,
                    borderTopLeftRadius: 18,
                    borderTopRightRadius: 18,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.10)',
                }} />
            </View>
        </View>
    )
}

function MainProfileInfo({ profile }: MainProfileInfoProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const locale = lang ? 'nb-NO' : 'en-GB'
    const joined = formatProfileDate(getJoinedDate(profile), locale)
    const active = formatBoolean(profile?.authentik?.isActive, lang)
    const banned = formatBoolean(getBannedStatus(profile), lang)
    const summary = profile
        ? [
            joined ? `${lang ? 'Opprettet' : 'Joined'}: ${joined}` : null,
            `${lang ? 'Aktiv' : 'Active'}: ${active}`,
            `${lang ? 'Utestengt' : 'Banned'}: ${banned}`,
        ].filter(Boolean)
        : [lang ? 'Ikke innlogget' : 'Not signed in']

    return (
        <>
            <Text style={{ ...T.text20, color: theme.textColor }}>
                {profile?.name || 'Login'}
            </Text>
            {profile?.id ? (
                <CopyableIdentifier
                    label='ID'
                    value={profile.id}
                    theme={theme}
                />
            ) : null}
            {summary.map((line) => (
                <Text key={line} style={{ ...T.text15, color: theme.oppositeTextColor }}>
                    {line}
                </Text>
            ))}
        </>
    )
}

function CopyableIdentifier({ label, value, theme }: { label: string, value: string, theme: Theme }) {
    const [copied, setCopied] = useState(false)
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => () => {
        if (timeout.current) {
            clearTimeout(timeout.current)
        }
    }, [])

    function handleCopy() {
        copyToClipboard(value)
        setCopied(true)

        if (timeout.current) {
            clearTimeout(timeout.current)
        }

        timeout.current = setTimeout(() => setCopied(false), 600)
    }

    return (
        <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            paddingRight: 8
        }}>
            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                {`${label}: ${value.slice(0, 6)}`}
            </Text>
            <TouchableOpacity onPress={handleCopy} hitSlop={10}>
                {copied ? (
                    <Check color='#22c55e' size={18} strokeWidth={2.4} />
                ) : (
                    <Copy color={theme.oppositeTextColor} size={18} strokeWidth={2.1} />
                )}
            </TouchableOpacity>
        </View>
    )
}

function getBannedStatus(profile: Profile | null) {
    const attributes = profile?.authentik?.attributes || {}
    const directValue = attributes.banned ?? attributes.isBanned ?? attributes.ban

    if (typeof directValue === 'boolean') {
        return directValue
    }

    if (typeof directValue === 'string') {
        return ['1', 'true', 'yes', 'ja'].includes(directValue.toLowerCase())
    }

    return false
}

function getJoinedDate(profile: Profile | null) {
    const record = profile as Record<string, unknown> | null
    const attributes = profile?.authentik?.attributes || {}
    const value = profile?.authentik?.dateJoined
        || getString(record?.dateJoined)
        || getString(record?.date_joined)
        || getString(attributes.dateJoined)
        || getString(attributes.date_joined)
        || getString(attributes.created)
        || getString(attributes.created_at)

    return value || null
}

function getString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value : null
}
