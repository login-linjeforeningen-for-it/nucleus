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
import { Dimensions, Platform, View } from 'react-native'
import { HeaderProps } from '@/interfaces'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { setTag } from '@redux/event'
import { BlurWrapper } from './headerBackground'
import { HeaderBackButton, HeaderTitlePill } from './headerParts'
import {
    HEADER_RIGHT_INSET,
    HEADER_TITLE_GAP,
    getCompactHeaderTitle,
    getInternalDashboardRoutes,
    getRightActionOffset,
    getRightRailWidth,
} from './headerLayout'

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
    const internalDashboardRoutes = getInternalDashboardRoutes()
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
                        <HeaderBackButton
                            onPress={handlePress}
                            isDark={isDark}
                            theme={theme}
                        />
                    }
                </View>
                {!exceptions.includes(route.name) && (
                    <HeaderTitlePill
                        theme={theme}
                        title={title}
                        left={titleLeft}
                        width={titleWidth}
                    />
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
