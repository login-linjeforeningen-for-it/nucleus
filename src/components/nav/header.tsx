/**
 * The header is a custom component created to integrate search and filtering.
 * It does this by defining a custom option for the screen that contains the search.
 *
 * In 7.X of react navigation search was added to the header,
 * so it might be worth rewriting this component/checking if the default header can be used
 */
import GS from '@styles/globalStyles'
import { ReactNode, useMemo, useState } from 'react'
import { NavButton, NavDropdown, InternalNavRoute } from '@components/menu/queenbee/internalNavMenu'
import { Dimensions, Platform, View, Text, Pressable, StyleSheet } from 'react-native'
import { HeaderProps } from '@/interfaces'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { setTag } from '@redux/event'
import { BlurWrapper, HeaderGlassBackground } from './headerBackground'

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
            <NavButton
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
                <NavDropdown
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
