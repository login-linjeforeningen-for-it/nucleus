import { nativeApplicationVersion } from 'expo-application'
import Feedback from '@/components/menu/feedback'
import { MenuItem, ProfileMenuCard } from '@/components/menu/root/menuCards'
import LogoNavigation from '@/components/shared/logoNavigation'
import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import { fetchAds, fetchEvents } from '@utils/fetch'
import LastFetch from '@utils/fetch'
import { JSX, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { setAds, setLastFetch as setAdLastFetch } from '@redux/ad'
import { setEvents, setLastFetch as setEventLastFetch } from '@redux/event'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import en from '@text/menu/en.json'
import no from '@text/menu/no.json'
import { getMenuDescriptions } from '@utils/menu/descriptions'
import { defaultPublicPinnedRoutes, usePinnedRoutes } from '@utils/menu/pinnedRoutes'

export default function MenuScreen({ navigation }: MenuProps<'MenuScreen'>): JSX.Element {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { login } = useSelector((state: ReduxState) => state.login)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const events = useSelector((state: ReduxState) => state.event.events)
    const ads = useSelector((state: ReduxState) => state.ad.ads)
    const { name, picture, email } = useSelector((state: ReduxState) => state.profile)
    const text: Setting = lang ? no as Setting : en as Setting
    const versionLabel = `${(text as any).version}${nativeApplicationVersion}`
    const dispatch = useDispatch()
    const [feedback, setFeedback] = useState(false)
    const { pinnedRoutes, togglePinnedRoute } = usePinnedRoutes('menu:pinned-routes', defaultPublicPinnedRoutes)

    const descriptions = useMemo(() => getMenuDescriptions(lang), [lang])
    const menuItems = useMemo(() => text.setting
        .filter((item) => item.nav !== 'ProfileScreen' && item.nav !== 'QueenbeeScreen')
        .sort((a, b) => {
            const aPinnedIndex = pinnedRoutes.indexOf(a.nav)
            const bPinnedIndex = pinnedRoutes.indexOf(b.nav)
            const aPinned = aPinnedIndex !== -1
            const bPinned = bPinnedIndex !== -1

            if (aPinned || bPinned) {
                return (aPinned ? aPinnedIndex : pinnedRoutes.length)
                    - (bPinned ? bPinnedIndex : pinnedRoutes.length)
            }

            return a.title.localeCompare(b.title, lang ? 'nb' : 'en')
        })
    , [lang, pinnedRoutes, text.setting])

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

        (async () => {
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
                    <ProfileMenuCard
                        navigation={navigation}
                        login={login}
                        name={name}
                        picture={picture}
                        email={email}
                        lang={lang}
                    />

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

                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            navigation={navigation}
                            subtitle={descriptions[item.nav] || ''}
                            pinned={pinnedRoutes.includes(item.nav)}
                            onTogglePinned={() => togglePinnedRoute(item.nav)}
                        />
                    ))}

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
