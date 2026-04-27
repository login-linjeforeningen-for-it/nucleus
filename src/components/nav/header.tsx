/**
 * The header is a custom component created to integrate search and filtering.
 * It does this by defining a custom option for the screen that contains the search.
 *
 * In 7.X of react navigation search was added to the header,
 * so it might be worth rewriting this component/checking if the default header can be used
 */
import GS from '@styles/globalStyles'
import GM from '@styles/gameStyles'
import { getCategories, getHeight } from '@utils/general'
import { PropsWithChildren, ReactNode, useMemo, useState } from 'react'
import { InternalNavMenuButton, InternalNavMenuDropdown, InternalNavRoute } from '@components/menu/queenbee/internalNavMenu'
import { BlurView } from 'expo-blur'
import { Dimensions, Platform, View, Text, StatusBar, Pressable, StyleSheet } from 'react-native'
import { HeaderProps } from '@/interfaces'
import { useSelector } from 'react-redux'
import { useRoute } from '@react-navigation/native'
import { Image } from 'react-native'
import { useDispatch } from 'react-redux'
import { setTag } from '@redux/event'

const MAX_COMPACT_HEADER_TITLE_LENGTH = 37
const HEADER_ACTION_SLOT_SIZE = 24
const HEADER_ACTION_GAP = 24
const HEADER_MENU_ACTION_GAP = 24
const HEADER_RIGHT_INSET = 18
const HEADER_TITLE_GAP = 16

export default function Header({ options, route, navigation }: HeaderProps): ReactNode {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { login, groups } = useSelector((state: ReduxState) => state.login)
    const { localTitle } = useSelector((state: ReduxState) => state.misc)
    const { tag, eventName } = useSelector((state: ReduxState) => state.event)
    const { adName } = useSelector((state: ReduxState) => state.ad)
    const dispatch = useDispatch()
    const [internalMenuOpen, setInternalMenuOpen] = useState(false)
    const SES = route.name === 'SpecificEventScreen'
    const SAS = route.name === 'SpecificAdScreen'
    const exceptions = ['SpecificGameScreen']
    const aiPositionedRightRoutes = [
        'AiScreen',
        'QueenbeeScreen',
        'StatusScreen',
        'LoadBalancingScreen',
        'DatabaseScreen',
        'VulnerabilitiesScreen',
        'LogsScreen',
        'TrafficScreen',
        'TrafficRecordsScreen',
        'TrafficMapScreen',
        'ContentScreen',
        'AnnouncementsScreen',
        'AlertsScreen',
        'NucleusDocumentationScreen',
        'HoneyScreen',
        'DatabaseBackupsScreen',
    ]
    const internalDashboardRoutes = aiPositionedRightRoutes.filter(routeName => routeName !== 'AiScreen')
    const hasQueenbeeAccess = login && groups.map((g) => g.toLowerCase()).includes('queenbee')
    const rightComponents = useMemo(() => {
        const existing = options.headerComponents?.right?.filter(Boolean) || []
        if (!hasQueenbeeAccess) {
            return existing
        }

        const internalMenu = (
            <InternalNavMenuButton
                open={internalMenuOpen}
                onPress={() => setInternalMenuOpen((current) => !current)}
            />
        )

        return [internalMenu, ...existing]
    }, [hasQueenbeeAccess, internalMenuOpen, options.headerComponents?.right, route.name])
    const rightRailWidth = getRightRailWidth(rightComponents.length)
    const titleLeft = Number(GS.headerLeftRail.width) + HEADER_TITLE_GAP
    const titleRight = HEADER_RIGHT_INSET + rightRailWidth + HEADER_TITLE_GAP
    const titleWidth = Math.min(260, Math.max(120, Dimensions.get('window').width - titleLeft - titleRight))
    const headerOffset = Dimensions.get('window').height / 17 + (Platform.OS === 'ios' ? 8 : 0)

    function navigateInternalRoute(targetRoute: InternalNavRoute) {
        setInternalMenuOpen(false)
        const currentNavigation = navigation as any
        const parentNavigation = currentNavigation.getParent?.()

        if (parentNavigation && route.name !== targetRoute) {
            parentNavigation.navigate('MenuNav', { screen: targetRoute })
            return
        }

        currentNavigation.navigate(targetRoute)
    }

    const title = useMemo(() => {
        if (route.name === localTitle?.screen && localTitle.title) {
            return localTitle.title
        }

        if (SES) {
            return getCompactHeaderTitle({
                value: options.title || eventName,
                fallback: lang ? 'Arrangement' : 'Event'
            })
        }

        if (SAS) {
            return getCompactHeaderTitle({
                value: options.title || adName,
                fallback: lang ? 'Jobbannonse' : 'Job ad'
            })
        }

        return route.name && (lang
            ? require('@text/no.json').screens[route.name]
            : require('@text/en.json').screens[route.name])
    }, [SAS, SES, adName, eventName, lang, localTitle?.screen, localTitle?.title, options.title, route.name])

    function handlePress() {
        if (tag?.title) {
            dispatch(setTag({ title: '', body: '' }))
        }

        if (internalDashboardRoutes.includes(route.name) && route.name !== 'QueenbeeScreen') {
            navigation.navigate('QueenbeeScreen' as never)
            return
        }

        navigation.goBack()
    }

    return (
        <BlurWrapper>
            <View style={{ ...GS.headerFrame, top: headerOffset }}>
                <View style={GS.headerLeftRail}>
                    {options.headerComponents?.left ? options.headerComponents?.left.map((node, index) =>
                        <View style={GS.headerLeftSlot} key={index}>{node}</View>
                    ) :
                        <Pressable
                            onPress={handlePress}
                            style={({ pressed }) => ({
                                ...GS.headerLeftSlot,
                                borderRadius: 21,
                                overflow: 'hidden',
                                borderWidth: 1,
                                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                backgroundColor: pressed
                                    ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)')
                                    : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: '#000',
                                shadowOpacity: isDark ? 0.12 : 0.05,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 3 },
                                elevation: 3,
                            })}
                        >
                            <HeaderGlassBackground borderRadius={21} />
                            <Text style={{
                                color: theme.orange,
                                fontSize: 26,
                                lineHeight: 28,
                                fontWeight: '600',
                                marginLeft: -2,
                                marginTop: Platform.OS === 'ios' ? -1 : -3,
                            }}>
                                ‹
                            </Text>
                        </Pressable>
                    }
                </View>
                {!exceptions.includes(route.name) && (
                    <View style={{
                        ...GS.headerTitleFrame,
                        left: titleLeft,
                        width: titleWidth,
                    }}>
                        <HeaderGlassBackground borderRadius={16} />
                        <Text style={{
                            ...GS.headerTitle,
                            color: theme.textColor,
                            textAlign: 'center',
                            fontWeight: '700',
                            letterSpacing: 0.2,
                            textShadowColor: isDark ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.12)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 6,
                            paddingHorizontal: 14,
                        }}>
                            {title}
                        </Text>
                        <View
                            pointerEvents='none'
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.14)',
                            }}
                        />
                    </View>
                )}
                <View style={{
                    ...GS.headerRightRail,
                    right: HEADER_RIGHT_INSET,
                    width: rightRailWidth,
                }}>
                    {rightComponents.map((node, index) => (
                        <View
                            style={{
                                ...GS.headerRightActionSlot,
                                right: getRightActionOffset(index),
                            }}
                            key={index}
                        >
                            {node}
                        </View>
                    ))}
                </View>
            </View>
            {options.headerComponents?.bottom?.map((node, index) =>
                <View key={index}>{node}</View>
            )}
            {hasQueenbeeAccess ? (
                <InternalNavMenuDropdown
                    activeRoute={route.name}
                    open={internalMenuOpen}
                    onNavigate={navigateInternalRoute}
                />
            ) : null}
        </BlurWrapper>
    )
}

function getRightRailWidth(actionCount: number) {
    if (!actionCount) {
        return 0
    }

    const remainingGaps = Math.max(0, actionCount - 2)
    const gapWidth = actionCount > 1 ? HEADER_MENU_ACTION_GAP + remainingGaps * HEADER_ACTION_GAP : 0

    return actionCount * HEADER_ACTION_SLOT_SIZE + gapWidth
}

function getRightActionOffset(index: number) {
    if (index === 0) {
        return 0
    }

    return HEADER_ACTION_SLOT_SIZE + HEADER_MENU_ACTION_GAP
        + (index - 1) * (HEADER_ACTION_SLOT_SIZE + HEADER_ACTION_GAP)
}

// Wraps the content in blur
function BlurWrapper(props: PropsWithChildren) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const event = useSelector((state: ReduxState) => state.event)
    const ad = useSelector((state: ReduxState) => state.ad)
    const route = useRoute()
    const exceptions = ['SpecificGameScreen']

    const defaultHeight =
        Dimensions.get('window').height * 8 // Base decrementor for both platforms
        / (Platform.OS === 'ios' ? 85 // Base height of header on iOS
            : 100 // Base height of header on Android
        ) + (StatusBar.currentHeight ? StatusBar.currentHeight - 2 // Subtractor for Statusbar visible on Android
            : 0 // Defaults to 0 if no statusbar is visible on Android
        )
    const isSearchingEvents = event.search && route.name === 'EventScreen'
    const categories = getCategories({ lang, categories: event.categories })
    const item = isSearchingEvents ? categories : ad.skills
    const isSearchingAds = ad.search && route.name === 'AdScreen'
    const extraHeight = getHeight(item.length)
    const windowHeight = Dimensions.get('window').height
    const largeDeviceReduction = windowHeight > 915 ? -15 : 0
    const height = defaultHeight + (isSearchingEvents || isSearchingAds
        ? Platform.OS === 'ios'
            ? 50 + extraHeight // Extraheight on iOS
            : isSearchingEvents
                ? 35 + extraHeight + largeDeviceReduction // Extraheight during eventSearch on Android
                : 25 + extraHeight + largeDeviceReduction // Extraheight during adSearch on Android
        : Platform.OS === 'ios'
            ? 20 // Extra base height for header on iOS while not searching
            : defaultHeight <= 100
                ? 5 // Extra base height for header on Android while not searching
                : windowHeight > 915 // Except if its a very tall device
                    ? -defaultHeight / 3.8
                    : -defaultHeight / 5
    )

    const gameID = (route.params as any)?.gameID
    const gameImages = [
        { style: GM.terning, icon: require('@assets/games/terning.png') },
        { style: GM.questions, icon: require('@assets/games/100questions.png') },
        { style: GM.neverhaveiever, icon: require('@assets/games/neverhaveiever.png') },
        { style: GM.okredflagdealbreaker, icon: require('@assets/games/okredflagdealbreaker.png') }
    ]

    return (
        <>
            {!exceptions.includes(route.name) && <BlurView
                blurMethod='dimezisBlurView'
                intensity={Platform.OS === 'ios' ? 30 : 20}
            />}
            <View style={{
                ...GS.blurBackgroundView,
                height,
            }}>
                {Object.keys(route.params || {}).includes('gameID') && <Image
                    style={gameImages[gameID + 1].style}
                    source={gameImages[gameID + 1].icon}
                />}
                {route.name === 'DiceScreen' && <Image
                    style={GM.terning}
                    source={gameImages[0].icon}
                />}
                {props.children}
            </View>
        </>
    )
}

function HeaderGlassBackground({ borderRadius }: { borderRadius: number }) {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <BlurView
                style={StyleSheet.absoluteFill}
                blurMethod='dimezisBlurView'
                intensity={Platform.OS === 'ios' ? 35 : 24}
            />
            <View style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius,
                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : theme.transparentAndroid,
            }} />
        </>
    )
}

function getCompactHeaderTitle({
    value,
    fallback,
}: {
    value?: string
    fallback: string
}) {
    const normalized = value?.trim()

    if (!normalized) {
        return fallback
    }

    return normalized.length > MAX_COMPACT_HEADER_TITLE_LENGTH
        ? fallback
        : normalized
}
