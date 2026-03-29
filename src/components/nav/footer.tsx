import { View, TouchableOpacity, Platform } from "react-native"
import { useSelector } from "react-redux"
import MS from "@styles/menuStyles"
import { BlurView } from "expo-blur"
import NotificationIcon from "@components/notification/notificationIcon"
import {
    NavigationHelpers,
    ParamListBase,
    TabNavigationState
} from "@react-navigation/native"
import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { JSX } from 'react'

export type FooterProps = {
    state: TabNavigationState<ParamListBase>
    descriptors: any
    navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>
}

export default function Footer({ state, descriptors, navigation }: FooterProps): JSX.Element {
    return <Content state={state} descriptors={descriptors} navigation={navigation} />
}

function Content({ state, descriptors, navigation }: FooterProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const navBar = useSafeAreaInsets().bottom
    const offset = navBar > 35 ? 0.1 : 0
    const bottom = !!offset ? offset : MS.bMenu.bottom

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

                    // Emitt the normal tab events
                    function onPress() {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        })

                        if (!isFocused && !event.defaultPrevented) {
                            // The `merge: true` option makes sure that the
                            // params inside the tab screen are preserved
                            navigation.navigate(route.name, { merge: true })
                        }
                    }

                    function onLongPress() {
                        navigation.emit({ type: "tabLongPress", target: route.key })
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused
                                ? { selected: true }
                                : {}}
                            style={MS.bMenuIconTouchableOpacity}
                            onPress={onPress}
                            onLongPress={onLongPress}
                        >
                            {!isFocused && route.name === "MenuScreenRoot" && <NotificationIcon position="bottom" />}
                            {options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color: '', size: 0 }) : null}
                        </TouchableOpacity>
                    )
                })}
            </View>
        </>
    )
}
