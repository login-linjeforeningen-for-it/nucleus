import { nativeApplicationVersion } from 'expo-application'
import Feedback from '@/components/menu/feedback'
import Cluster from '@/components/shared/cluster'
import LogoNavigation from '@/components/shared/logoNavigation'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import { NavigationProp } from '@react-navigation/native'
import { fetchAds, fetchEvents } from '@utils/fetch'
import LastFetch from '@utils/fetch'
import { JSX, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import { setAds, setLastFetch as setAdLastFetch } from '@redux/ad'
import { setEvents, setLastFetch as setEventLastFetch } from '@redux/event'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import en from '@text/menu/en.json'
import no from '@text/menu/no.json'

type MenuItemProps = {
    item: ItemProps
    navigation: NavigationProp<MenuStackParamList, 'MenuScreen'>
    subtitle: string
}

type MenuDescriptionMap = Record<string, string>

export default function MenuScreen({ navigation }: MenuProps<'MenuScreen'>): JSX.Element {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { login } = useSelector((state: ReduxState) => state.login)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const events = useSelector((state: ReduxState) => state.event.events)
    const ads = useSelector((state: ReduxState) => state.ad.ads)
    const { name, image, degree, schoolyear } = useSelector((state: ReduxState) => state.profile)
    const text: Setting = lang ? no as Setting : en as Setting
    const versionLabel = `${(text as any).version}${nativeApplicationVersion}`
    const dispatch = useDispatch()
    const [feedback, setFeedback] = useState(false)

    const descriptions = useMemo<MenuDescriptionMap>(() => ({
        SettingScreen: lang ? 'App, språk og varsler' : 'App, language, and notification settings',
        NotificationScreen: lang ? 'Se siste varsler og oppdateringer' : 'See your latest alerts and updates',
        AboutScreen: lang ? 'Les om Login, komiteene og folkene' : 'Read about Login, the committees, and the people',
        BusinessScreen: lang ? 'Informasjon for bedrifter og samarbeid' : 'Information for companies and partnerships',
        CourseScreen: lang ? 'Emner, eksamener og studentverktøy' : 'Courses, exams, and student tools',
        GameScreen: lang ? 'Festspill og raske icebreakers' : 'Party games and quick icebreakers',
        AiScreen: lang ? 'Chat med Login AI direkte i appen' : 'Chat with Login AI directly in the app',
        QueenbeeScreen: lang ? 'Intern oversikt og administrative verktøy' : 'Internal overview and administrative tools',
        DashboardScreen: lang ? 'Siste aktivitet og oppdateringer' : 'Latest activity and updates',
        StatusScreen: lang ? 'Driftsstatus for Login sine tjenester' : 'Operational status for Login\'s services',
        SearchScreen: lang ? 'Søk og åpne direkte fra appen' : 'Search and open directly from the app',
        MusicScreen: lang ? 'Live musikkstatistikk fra Login' : 'Live music statistics from Login',
        AlbumsScreen: lang ? 'Bilder fra arrangementer og Login-liv' : 'Photos from events and Login life',
        FundScreen: lang ? 'Fondet, søknader og beholdning' : 'The fund, applications, and holdings',
        VervScreen: lang ? 'Komiteer, verv og søknad' : 'Committees, roles, and applications',
        PolicyScreen: lang ? 'Personvern og app-policy' : 'Privacy and app policy',
        PwnedScreen: lang ? 'Lås skjermen, ellers...' : 'Lock your screen, or else...',
    }), [lang])

    function toggleFeedback() {
        setFeedback((current) => !current)
    }

    useEffect(() => {
        navigation.setOptions({
            headerComponents: {
                left: [<LogoNavigation />],
            }
        } as any)
    }, [navigation])

    useEffect(() => {
        if (events.length && ads.length) {
            return
        }

        void (async () => {
            const [nextEvents, nextAds] = await Promise.all([fetchEvents(), fetchAds()])

            if (nextEvents.length) {
                dispatch(setEvents(nextEvents))
                dispatch(setEventLastFetch(LastFetch()))
            }

            if (nextAds.length) {
                dispatch(setAds(nextAds))
                dispatch(setAdLastFetch(LastFetch()))
            }
        })()
    }, [ads.length, dispatch, events.length])

    return (
        <Swipe left='AdNav'>
            <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 96,
                        paddingBottom: 120,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ProfileScreen')}
                        activeOpacity={0.9}
                    >
                        <Cluster style={{ paddingHorizontal: 0 }}>
                            <View style={{
                                paddingHorizontal: 14,
                                paddingVertical: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 14,
                            }}>
                                <View style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    overflow: 'hidden',
                                    backgroundColor: 'rgba(253,135,56,0.12)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {image ? (
                                        <Image
                                            source={{ uri: image }}
                                            style={{ width: 64, height: 64, resizeMode: 'cover' }}
                                        />
                                    ) : (
                                        <ProfilePlaceholder />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ ...T.text20, color: theme.textColor, marginBottom: 6 }}>
                                        {login ? (name || (lang ? 'Profil' : 'Profile')) : (lang ? 'Profil' : 'Profile')}
                                    </Text>
                                    <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                                        {login
                                            ? [schoolyear, degree].filter(Boolean).join(' · ')
                                                || (lang ? 'Konto og personlige verktøy' : 'Account, and personal tools')
                                            : (lang ? 'Innlogging og kontoverktøy' : 'Sign-in and account tools')}
                                    </Text>
                                </View>
                                <Text style={{
                                    ...T.text20,
                                    color: theme.orange,
                                    fontWeight: '700',
                                }}>
                                    ›
                                </Text>
                            </View>
                        </Cluster>
                    </TouchableOpacity>

                    <Space height={14} />
                    <Text style={{
                        ...T.text15,
                        color: theme.oppositeTextColor,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        marginLeft: 4,
                        marginBottom: 8,
                    }}>
                        {lang ? 'Utforsk' : 'Explore'}
                    </Text>

                    {text.setting.map((item) => {
                        if (item.nav === 'ProfileScreen') {
                            return null
                        }

                        return (
                            <MenuItem
                                key={item.id}
                                item={item}
                                navigation={navigation}
                                subtitle={descriptions[item.nav] || ''}
                            />
                        )
                    })}

                    <Space height={12} />
                    <View style={{ alignItems: 'center' }}>
                        <Feedback
                            index={text.setting.length - 1}
                            setting={text.setting}
                            feedback={feedback}
                            toggleFeedback={toggleFeedback}
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('InternalScreen')}>
                            <Text style={{ ...T.contact, color: theme.oppositeTextColor }}>
                                {versionLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Swipe>
    )
}

function ProfilePlaceholder(): JSX.Element {
    return (
        <View style={{
            width: 64,
            height: 64,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.14)',
                marginBottom: 4,
            }} />
            <View style={{
                width: 30,
                height: 18,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.10)',
            }} />
        </View>
    )
}

function MenuItem({ item, navigation, subtitle }: MenuItemProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate(item.nav as any)}
            activeOpacity={0.88}
        >
            <Cluster style={{ paddingHorizontal: 0 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    gap: 12,
                }}>
                    <View style={{
                        width: 3,
                        alignSelf: 'stretch',
                        borderRadius: 99,
                        backgroundColor: theme.orange,
                        opacity: 0.55,
                        marginTop: 2,
                    }}>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...T.text20, color: theme.textColor, marginBottom: 4 }}>
                            {item.title}
                        </Text>
                        <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                            {subtitle}
                        </Text>
                    </View>
                    <Text style={{
                        ...T.text20,
                        color: theme.orange,
                        fontWeight: '700',
                    }}>
                        ›
                    </Text>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}
