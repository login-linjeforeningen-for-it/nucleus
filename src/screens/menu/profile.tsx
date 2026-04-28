import Space from '@/components/shared/utils'
import Swipe from '@components/nav/swipe'
import ProfileInfo from '@/components/profile/profileInfo'
import ProfileCard from '@/components/profile/profile'
import ProfileActions from '@/components/profile/details/profileActions'
import Text from '@components/shared/text'
import { Field } from '@components/profile/field'
import { clearSession } from '@redux/loginStatus'
import { clearProfile, setProfile } from '@redux/profile'
import { fetchProfile } from '@utils/auth/profile'
import { buildDetailFields } from '@utils/profile/detailFields'
import { JSX, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import { Dimensions, TouchableOpacity, View } from 'react-native'
import PS from '@styles/profileStyles'
import T from '@styles/text'
import Svg, { LinearGradient, Rect, Stop } from 'react-native-svg'

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

function ProfileBackground({
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
                transform: [{ translateY: Math.min(scrollPosition * 0.18, 18) }]
            }} />
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
        </>
    )
}

function ProfileDetailsToggle({
    fields,
    lang,
    showDetails,
    theme,
    onToggle
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
                <View style={{
                    borderTopColor: '#ffffff12',
                    borderTopWidth: 1,
                    gap: 12,
                    paddingTop: 12,
                    paddingHorizontal: 24,
                    width: '100%'
                }}>
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
