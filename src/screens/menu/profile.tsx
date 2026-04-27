import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import ProfileInfo from '@/components/profile/profileInfo'
import ProfileCard from '@/components/profile/profile'
import ProfileActions from '@/components/profile/details/profileActions'
import ProfileBackground from '@/components/profile/details/profileBackground'
import ProfileDetailsToggle from '@/components/profile/details/profileDetailsToggle'
import { clearSession } from '@redux/loginStatus'
import { clearProfile, setProfile } from '@redux/profile'
import { fetchProfile } from '@utils/auth/profile'
import { buildDetailFields } from '@utils/profile/detailFields'
import { JSX, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import { Dimensions, View } from 'react-native'
import PS from '@styles/profileStyles'

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
                <ScrollView
                    scrollEventThrottle={100}
                    onScroll={handleScroll}
                    showsVerticalScrollIndicator={false}
                >
                    <ProfileBackground
                        theme={theme}
                        screenHeight={screenHeight}
                        scrollPosition={scrollPosition}
                    />
                    <Space height={screenHeight / 8} />
                    <ProfileCard profile={login ? profile : null} />
                    <Space height={40} />
                    {login && <ProfileInfo profile={profile} />}
                    <Space height={20} />
                    <ProfileActions
                        navigation={navigation}
                        login={login}
                        groups={groups}
                        profile={profile}
                        loading={authentikLoading}
                        error={authentikError}
                        lang={lang}
                        theme={theme}
                        onLogout={handleLogout}
                    />
                    <ProfileDetailsToggle
                        fields={detailFields}
                        lang={lang}
                        showDetails={showDetails}
                        theme={theme}
                        onToggle={() => setShowDetails((current) => !current)}
                    />
                    <Space height={screenHeight / 3} />
                </ScrollView>
            </View>
        </Swipe>
    )
}
