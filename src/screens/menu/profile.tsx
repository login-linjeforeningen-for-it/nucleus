import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import ProfileInfo from '@/components/profile/profileInfo'
import Profile from '@/components/profile/profile'
import { clearSession } from '@redux/loginStatus'
import { setID, setMail, setName } from '@redux/profile'
import { startLogin } from '@utils/auth'
import { fetchAuthentikProfile, formatProfileDate } from '@utils/authProfile'
import { JSX, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import Svg, { LinearGradient, Rect, Stop } from 'react-native-svg'
import { Dimensions, TouchableOpacity, View } from 'react-native'
import PS from '@styles/profileStyles'
import T from '@styles/text'

type ScrollProps = {
    nativeEvent: {
        contentOffset: {
            y: number
        }
    }
}

export default function ProfileScreen({ navigation }: MenuProps<'ProfileScreen'>): JSX.Element {
    const { theme, value } = useSelector((state: ReduxState) => state.theme)
    const { login, groups, token } = useSelector((state: ReduxState) => state.login)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { ban, name, allergies, preferences, mail, schoolyear, degree, image }
        = useSelector((state: ReduxState) => state.profile)
    const dispatch = useDispatch()

    const profile = {
        allergies,
        ban,
        degree,
        id: null,
        image,
        joinedevents: null,
        mail,
        name: name || (lang ? 'Profil' : 'Profile'),
        preferences,
        schoolyear
    }

    const profileInfo = { degree, schoolyear, mail, preferences, allergies }
    const [scrollPosition, setScrollPosition] = useState(0)
    const [authentikProfile, setAuthentikProfile] = useState<AuthentikProfile | null>(null)
    const [authentikError, setAuthentikError] = useState<string | null>(null)
    const [authentikLoading, setAuthentikLoading] = useState(false)

    useEffect(() => {
        let active = true

        if (!login || !token) {
            setAuthentikProfile(null)
            setAuthentikError(null)
            setAuthentikLoading(false)
            return
        }

        setAuthentikLoading(true)
        fetchAuthentikProfile(token)
            .then((nextProfile) => {
                if (active) {
                    setAuthentikProfile(nextProfile)
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
    }, [login, token])

    function handleScroll(event: ScrollProps) {
        setScrollPosition(-event.nativeEvent.contentOffset.y)
    }

    function handleLogout() {
        dispatch(clearSession())
        dispatch(setID(null))
        dispatch(setName(null))
        dispatch(setMail(null))
    }

    return (
        <Swipe left='MenuScreen'>
            <View>
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
                            ...PS.profileGradientBackground,
                            transform: [{ translateY: Math.min(scrollPosition * 0.12, 16) }]
                        }}>
                            <LinearGradient
                                id='gradient'
                                x1='0%'
                                y1='0%'
                                x2='0%'
                                y2={0.72}
                            >
                                <Stop offset='28%' stopColor={theme.orange} />
                                <Stop
                                    offset={value === 1 ? '96%' : '100%'}
                                    stopColor={theme.darker}
                                />
                            </LinearGradient>
                            <Rect
                                x='0'
                                y={value === 1 ? 65 : 0}
                                width='100%'
                                height='100%'
                                fill='url(#gradient)'
                            />
                        </Svg>
                        <Space height={Dimensions.get('window').height / 8} />
                        <Profile profile={profile} />
                        <Space height={40} />
                        {login && <ProfileInfo profile={profileInfo} />}
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
                            <TouchableOpacity
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
                                        {login
                                            ? (lang ? 'Åpne Queenbee' : 'Open Queenbee')
                                            : (lang ? 'Logg inn for Queenbee' : 'Sign in for Queenbee')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
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
                                    profile={authentikProfile}
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
                                                {lang ? 'Tøm lokal økt' : 'Clear local session'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                        <Space height={Dimensions.get('window').height / 3} />
                    </ScrollView>
                </View>
            </View>
        </Swipe>
    )
}

type AuthentikDetailsCardProps = {
    profile: AuthentikProfile | null
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
    const locale = lang ? 'nb-NO' : 'en-GB'
    const groups = profile?.groups?.length ? profile.groups : fallbackGroups
    const joined = formatProfileDate(profile?.authentik.dateJoined || null, locale)
    const lastLogin = formatProfileDate(profile?.authentik.lastLogin || null, locale)
    const fields = [
        profile?.username ? [lang ? 'Brukernavn' : 'Username', profile.username] : null,
        profile?.email ? [lang ? 'E-post' : 'Email', profile.email] : null,
        typeof profile?.emailVerified === 'boolean'
            ? [lang ? 'E-post verifisert' : 'Email verified', profile.emailVerified ? (lang ? 'Ja' : 'Yes') : 'No']
            : null,
        joined ? [lang ? 'Opprettet' : 'Created', joined] : null,
        lastLogin ? [lang ? 'Sist innlogget' : 'Last login', lastLogin] : null,
        typeof profile?.authentik.isActive === 'boolean'
            ? [lang ? 'Status' : 'Status', profile.authentik.isActive ? 'Active' : 'Inactive']
            : null,
        profile?.authentik.uid ? ['UID', profile.authentik.uid] : null,
        profile?.authentik.type ? [lang ? 'Type' : 'Type', profile.authentik.type] : null,
    ].filter((field): field is string[] => Boolean(field))

    return (
        <Cluster>
            <View style={{ padding: 16, gap: 12 }}>
                <View>
                    <Text style={{ ...T.text20, color: theme.textColor }}>
                        {lang ? 'Authentik-identitet' : 'Authentik identity'}
                    </Text>
                    <Space height={4} />
                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                        {loading
                            ? (lang ? 'Henter profilinformasjon ...' : 'Loading profile details ...')
                            : (lang ? 'Innloggingsdetaljer fra Login-kontoen din.' : 'Login account details from your identity profile.')}
                    </Text>
                </View>
                {error ? (
                    <Text style={{ ...T.text15, color: theme.orange }}>
                        {error}
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
                {fields.map(([label, fieldValue]) => (
                    <View
                        key={label}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: 14
                        }}
                    >
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {label}
                        </Text>
                        <Text style={{
                            ...T.text15,
                            color: theme.textColor,
                            flex: 1,
                            textAlign: 'right'
                        }}>
                            {fieldValue}
                        </Text>
                    </View>
                ))}
            </View>
        </Cluster>
    )
}
