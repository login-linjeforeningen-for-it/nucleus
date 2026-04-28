import { View, TouchableOpacity, Platform } from 'react-native'
import { useSelector } from 'react-redux'
import MS from '@styles/menuStyles'
import { BlurView } from 'expo-blur'
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { NavigationHelpers, ParamListBase, PartialState, Route, TabNavigationState } from '@react-navigation/native'
import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { JSX } from 'react'
import { CrownMenuIcon, NotificationIcon } from '@components/nav/footerIcons'

type FooterProps = {
    state: TabNavigationState<ParamListBase>
    descriptors: Record<string, {
        options: BottomTabNavigationOptions
    } & Record<string, unknown>>
    navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>
}

export default function Footer({ state, descriptors, navigation }: FooterProps): JSX.Element {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const { login, groups } = useSelector((state: ReduxState) => state.login)
    const navBar = useSafeAreaInsets().bottom
    const offset = navBar > 35 ? 0.1 : 0
    const bottom = offset ? offset : MS.bMenu.bottom
    const hasQueenbeeAccess = login && groups.map((group) => group.toLowerCase()).includes('queenbee')

    return (
        <>
            <BlurView
                style={{ ...MS.bMenu, bottom }}
                blurMethod='dimezisBlurView'
                intensity={Platform.OS === 'ios' ? 30 : 20}
            />
            <View style={{ ...MS.bMenu, bottom, backgroundColor: theme.transparentAndroid }} />
            {/* Transparent container for the icons */}
            <View style={{ ...MS.bMenu, bottom }}>
                {/* Create the icons based on options passed from stack.js */}
                {state.routes.map((route,
                    index: number) => {
                    const { options } = descriptors[route.key]

                    const isFocused = state.index === index
                    const focusedRouteName = route.name === 'MenuNav' ? getFocusedRouteName(route) : null
                    const showQueenbeeTarget = hasQueenbeeAccess && isFocused && focusedRouteName === 'MenuScreen'

                    // Emitt the normal tab events
                    function onPress() {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        })

                        if (event.defaultPrevented) {
                            return
                        }

                        if (route.name === 'MenuNav') {
                            event.preventDefault()
                            navigation.navigate('MenuNav', {
                                screen: hasQueenbeeAccess && isFocused ? resolveMenuTarget(route) : 'MenuScreen',
                            })
                            return
                        }

                        if (!isFocused) {
                            navigation.navigate(route.name, { merge: true })
                        }
                    }

                    function onLongPress() {
                        navigation.emit({ type: 'tabLongPress', target: route.key })
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole='button'
                            accessibilityState={isFocused
                                ? { selected: true }
                                : {}}
                            style={MS.bMenuIconTouchableOpacity}
                            onPress={onPress}
                            onLongPress={onLongPress}
                        >
                            {!isFocused && route.name === 'MenuScreenRoot' && <NotificationIcon position='bottom' />}
                            {showQueenbeeTarget
                                ? <CrownMenuIcon color={theme.orange} />
                                : options.tabBarIcon
                                    ? options.tabBarIcon({ focused: isFocused, color: isDark ? '#777' : '#000', size: 0 })
                                    : null}
                        </TouchableOpacity>
                    )
                })}
            </View>
        </>
    )
}

function resolveMenuTarget(route: Route<string>) {
    const currentRoute = getFocusedRouteName(route)

    if (!currentRoute || currentRoute === 'MenuScreen') {
        return 'QueenbeeScreen'
    }

    if (currentRoute === 'QueenbeeScreen') {
        return 'MenuScreen'
    }

    return 'MenuScreen'
}

function getFocusedRouteName(route: Route<string>): string | null {
    const nestedState = (route as Route<string> & {
        state?: PartialState<TabNavigationState<ParamListBase>>
    }).state

    if (!nestedState?.routes?.length) {
        return null
    }

    const index = nestedState.index ?? 0
    const focusedRoute = nestedState.routes[index] as Route<string> | undefined

    if (!focusedRoute) {
        return null
    }

    return getFocusedRouteName(focusedRoute) || focusedRoute.name
}
