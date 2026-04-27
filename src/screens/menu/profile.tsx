import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import ProfileInfo from '@/components/profile/profileInfo'
import ProfileCard from '@/components/profile/profile'
import { clearSession } from '@redux/loginStatus'
import { clearProfile, setProfile } from '@redux/profile'
import { startLogin } from '@utils/auth/auth'
import { fetchProfile, formatProfileDate } from '@utils/auth/profile'
import { JSX, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import Svg, { LinearGradient, Rect, Stop } from 'react-native-svg'
import { Dimensions, TouchableOpacity, View } from 'react-native'
import PS from '@styles/profileStyles'
import T from '@styles/text'
import normalizeGroup from '@utils/normalizeGroup'
import toField from '@utils/toField'
import formatValue from '@utils/formatValue'
import { Field } from '@components/profile/field'

type ScrollProps = {
    nativeEvent: {
        contentOffset: {
            y: number
        }
    }
}

export default function ProfileScreen({ navigation }: MenuProps<'ProfileScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login, groups, token } = useSelector((state: ReduxState) => state.login)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const profile = useSelector((state: ReduxState) => state.profile)
    const dispatch = useDispatch()
    const [showDetails, setShowDetails] = useState(false)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [authentikError, setAuthentikError] = useState<string | null>(null)
    const [authentikLoading, setAuthentikLoading] = useState(false)
    const detailFields = buildDetailFields(profile, lang)
    const screenHeight = Dimensions.get('window').height

    useEffect(() => {
        let active = true

        if (!login || !token) {
            setAuthentikError(null)
            setAuthentikLoading(false)
            return
        }

        setAuthentikLoading(true)
        fetchProfile(token)
            .then((nextProfile) => {
                if (active) {
                    dispatch(setProfile(nextProfile))
                    setAuthentikError(null)
                }
            })
            .catch((error) => {
                if (active) {
                    setAuthentikError(error instanceof Error ? error.message : 'Could not load Authentik profile.')
                }
            })
            .finally(() => {
                if (active) {
                    setAuthentikLoading(false)
                }
            })

        return () => {
            active = false
        }
    }, [dispatch, login, token])

    function handleScroll(event: ScrollProps) {
        setScrollPosition(-event.nativeEvent.contentOffset.y)
    }

    function handleLogout() {
        dispatch(clearSession())
        dispatch(clearProfile())
    }


    return (
        <Swipe left='MenuScreen'>
            <View style={{ ...PS.content, backgroundColor: theme.darker }}>
                <View style={{
                    ...PS.profileView,
                    backgroundColor: theme.orange,
                    opacity: Math.max(0, Math.min(scrollPosition / 220, 0.14)),
                    transform: [{ translateY: Math.min(scrollPosition * 0.18, 18) }]
                }} />
                <ScrollView
                    scrollEventThrottle={100}
                    onScroll={handleScroll}
                    showsVerticalScrollIndicator={false}
                >
                    <Svg style={{
                        height: screenHeight / 2,
                        left: 0,
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: '100%'
                    }}>
                        <LinearGradient
                            id='profileGradient'
                            x1='0%'
                            y1='0%'
                            x2='0%'
                            y2='100%'
                        >
                            <Stop offset='0%' stopColor={theme.orange} />
                            <Stop
                                offset='100%'
                                stopColor={theme.darker}
                            />
                        </LinearGradient>
                        <Rect
                            x='0'
                            y='0'
                            width='100%'
                            height='100%'
                            fill='url(#profileGradient)'
                        />
                    </Svg>
                    <Space height={screenHeight / 8} />
                    <ProfileCard profile={login ? profile : null} />
                    <Space height={40} />
                    {login && <ProfileInfo profile={profile} />}
                    <Space height={20} />
                    <View style={{ paddingHorizontal: 12 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('AiScreen')}>
                            <View style={{
                                borderRadius: 18,
                                borderWidth: 1,
                                borderColor: theme.orangeTransparent,
                                backgroundColor: theme.orangeTransparentBorder,
                                padding: 14
                            }}>
                                <Text style={{ ...T.centered20, color: theme.textColor }}>
                                    {lang ? 'Åpne Login AI' : 'Open Login AI'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <Space height={12} />
                        {login && <TouchableOpacity
                            onPress={() => login ? navigation.navigate('QueenbeeScreen') : startLogin('queenbee')}
                        >
                            <View style={{
                                borderRadius: 18,
                                borderWidth: 1,
                                borderColor: '#ffffff12',
                                backgroundColor: theme.contrast,
                                padding: 14
                            }}>
                                <Text style={{ ...T.centered20, color: theme.textColor }}>
                                    {lang ? 'Åpne Queenbee' : 'Open Queenbee'}
                                </Text>
                            </View>
                        </TouchableOpacity>}
                    </View>
                    {!login ? (
                        <>
                            <Space height={12} />
                            <View style={{ paddingHorizontal: 12 }}>
                                <TouchableOpacity onPress={() => startLogin('queenbee')}>
                                    <View style={{
                                        borderRadius: 18,
                                        borderWidth: 1,
                                        borderColor: '#ffffff12',
                                        backgroundColor: theme.contrast,
                                        padding: 14
                                    }}>
                                        <Text style={{ ...T.centered20, color: theme.textColor }}>
                                            {lang ? 'Logg inn' : 'Sign in'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <Space height={20} />
                            <AuthentikDetailsCard
                                profile={profile}
                                fallbackGroups={groups}
                                loading={authentikLoading}
                                error={authentikError}
                                lang={lang}
                            />
                            <Space height={12} />
                            <View style={{ paddingHorizontal: 12 }}>
                                <TouchableOpacity onPress={handleLogout}>
                                    <View style={{
                                        borderRadius: 18,
                                        borderWidth: 1,
                                        borderColor: '#ffffff12',
                                        backgroundColor: theme.contrast,
                                        padding: 14
                                    }}>
                                        <Text style={{ ...T.centered20, color: theme.textColor }}>
                                            {lang ? 'Logg ut' : 'Log out'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                    <TouchableOpacity
                        onPress={() => setShowDetails((current) => !current)}
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
                            {detailFields.map((field) => (
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
                    <Space height={screenHeight / 3} />
                </ScrollView>
            </View>
        </Swipe>
    )
}

type AuthentikDetailsCardProps = {
    profile: Profile | null
    fallbackGroups: string[]
    loading: boolean
    error: string | null
    lang: boolean
}

function AuthentikDetailsCard({
    profile,
    fallbackGroups,
    loading,
    error,
    lang
}: AuthentikDetailsCardProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const groups = collectGroups(profile, fallbackGroups)
    const isUnauthorized = error?.toLowerCase() === 'unauthorized'
    const visibleError = isUnauthorized ? null : error

    return (
        <Cluster>
            <View style={{ padding: 16, gap: 12 }}>
                <View>
                    <Text style={{ ...T.text20, color: theme.textColor }}>
                        {lang ? 'Roller' : 'Roles'}
                    </Text>
                </View>
                {loading ? (
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                        {lang ? 'Henter roller ...' : 'Loading roles ...'}
                    </Text>
                ) : null}
                {visibleError ? (
                    <Text style={{ ...T.text15, color: theme.orange }}>
                        {visibleError}
                    </Text>
                ) : null}
                {groups.length ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {groups.map((group) => (
                            <View
                                key={group}
                                style={{
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: theme.orangeTransparent,
                                    backgroundColor: theme.orangeTransparentBorder,
                                    paddingHorizontal: 10,
                                    paddingVertical: 5
                                }}
                            >
                                <Text style={{ ...T.text15, color: theme.textColor }}>
                                    {group}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                        {lang ? 'Ingen grupper rapportert' : 'No groups reported'}
                    </Text>
                )}
            </View>
        </Cluster>
    )
}

function collectGroups(profile: Profile | null, fallbackGroups: string[]) {
    const groups = [
        ...(profile?.groups || []),
        ...fallbackGroups,
    ]

    return [...new Set(groups.filter(Boolean))]
}

function buildDetailFields(profile: Profile | null, lang: boolean): ProfileField[] {
    if (!profile) {
        return []
    }

    const locale = lang ? 'nb-NO' : 'en-GB'
    const auth = profile?.authentik || {}
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
        toCopyField(lang, 'Groups', profile.groups.join(', ')),
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
        toCopyField(lang, 'Authentik groups', auth.groups?.map(normalizeGroup).filter(Boolean).join(', ')),
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
