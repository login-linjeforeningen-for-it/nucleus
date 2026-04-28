/*
 * This file ddefines the navigation for the application.
 * The navigation is designed in a tree structure, where the leaf nodes are react nodes.
 * Root
 * ├── Tabs
 * |   ├── EventStack
 * |   |   ├── EventScreen
 * |   |   └── SpecificEventScreen
 * |   ├── AdStack
 * |   |   ├── AdScreen
 * |   |   └── SpecificAdScreen
 * |   └── MenuStack
 * |       ├── MenuScreen
 * |       ├── ProfileScreen
 * |       ├── SettingScreen
 * |       ├── NotificationScreen
 * |       ├── AboutScreen
 * |       ├── BusinessScreen
 * |       ├── InternalScreen
 * |       ├── CourseScreen
 * |       ├── SpecificCourseScreen
 * |       ├── GameScreen
 * |       ├── SpecificGameScreen
 * |       └── DiceScreen
 * ├── InfoModal
 * └── NotificationModal
 */

import Footer from '@nav/footer'
import MS from '@styles/menuStyles'
import T from '@styles/text'
import NotificationModal from '@components/shared/notificationModal'
import { Ads, Events, Menu } from './stacks'
import * as SystemUI from 'expo-system-ui'
import * as NavigationBar from 'expo-navigation-bar'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import linking from '@utils/app/linking'
import NotificationRuntime from '@utils/notification/navigateFromPushNotification'
import { navigationRef } from '@utils/app/navigationRef'
import { useSelector } from 'react-redux'
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native'
import {
    StackCardInterpolatedStyle,
    StackCardInterpolationProps,
    createStackNavigator
} from '@react-navigation/stack'
import { JSX, useEffect } from 'react'

// Defines the navigators
const Root = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabBarParamList>()

/**
 * Declares the tab navigator, and declares the eventstack, adstack and menustack.
 *
 * @returns Application with navigation
 */
function Tabs(): JSX.Element {
    const { isDark, value } = useSelector((state: ReduxState) => state.theme)

    useEffect(() => {
        if (Platform.OS !== 'ios') {
            NavigationBar.setStyle(isDark ? 'dark' : 'light')
        }
    }, [value])

    return (
        <Tab.Navigator
            // Set initialscreen at to not defaut to top of tab stack
            initialRouteName={'EventNav'}
            backBehavior='history'
            screenOptions={{ headerShown: false }}
            // Sets the tab bar component
            tabBar={props => <Footer
                state={props.state}
                descriptors={props.descriptors}
                navigation={props.navigation}
            />}
        >
            <Tab.Screen
                name='EventNav'
                component={Events}
                options={({
                    tabBarIcon: ({ focused }) => (
                        <Image
                            style={MS.bMenuIcon}
                            source={focused
                                ? require('@assets/menu/calendar-orange.png')
                                : isDark
                                    ? require('@assets/menu/calendar777.png')
                                    : require('@assets/menu/calendar-black.png')}
                        />
                    )
                })}
            />
            <Tab.Screen
                name='AdNav'
                component={Ads}
                options={({
                    tabBarIcon: ({ focused }) => (
                        <Image
                            style={MS.bMenuIcon}
                            source={focused
                                ? require('@assets/menu/business-orange.png')
                                : isDark
                                    ? require('@assets/menu/business.png')
                                    : require('@assets/menu/business-black.png')}
                        />
                    )
                })}
            />
            <Tab.Screen
                name='MenuNav'
                component={Menu}
                options={({
                    tabBarIcon: ({ focused }) => (
                        <Image
                            style={MS.bMenuIcon}
                            source={focused
                                ? require('@assets/menu/menu-orange.png')
                                : isDark
                                    ? require('@assets/menu/menu.png')
                                    : require('@assets/menu/menu-black.png')}
                        />
                    ),
                })}
            />
        </Tab.Navigator>
    )
}

function TagInfo() {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { tag } = useSelector((state: ReduxState) => state.event)
    const navigation = useNavigation()

    return (
        <TouchableOpacity
            style={{ flex: 1, justifyContent: 'flex-end' }}
            onPress={() => navigation.goBack()}
            activeOpacity={1}
        >
            <View
                style={{
                    backgroundColor: theme.dark,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                testID='TagInfo'
            >
                <Text style={{ ...T.text20, color: theme.textColor, marginTop: 5 }}>{tag.title}</Text>
                <Text style={{ ...T.text18, color: theme.textColor, margin: 5, marginHorizontal: 12 }}>{tag.body}</Text>
            </View>
            <View style={{ height: 20, backgroundColor: theme.dark }} />
        </TouchableOpacity>
    )
}

/**
 * Declares navigator of the app, wraps the navigator in the container, and
 * declares the InfoModal and the tab navigation.
 *
 * @returns Application with navigation
 */
export default function Navigator(): JSX.Element {
    SystemUI.setBackgroundColorAsync('black')

    const config = {
        animation: 'timing',
        config: {
            duration: 100,
        }
    } as any

    return (
        <NavigationContainer ref={navigationRef} linking={linking}>
            <NotificationRuntime />
            <Root.Navigator screenOptions={{ headerShown: false }}>
                <Root.Screen name='Tabs' component={Tabs} />
                {/* <Root.Screen name="NotificationScreen" component={NotificationScreen as any} /> */}
                <Root.Screen
                    name='InfoModal'
                    options={{
                        presentation: 'transparentModal',
                        cardOverlayEnabled: true,
                        cardStyleInterpolator: animateFromBottom,
                        transitionSpec: { open: config, close: config },
                    }}
                    component={TagInfo}
                />
                <Root.Screen
                    name='NotificationModal'
                    options={{
                        presentation: 'transparentModal',
                        cardStyleInterpolator: animateFromTop,
                        transitionSpec: { open: config, close: config },
                    }}
                    component={NotificationModal}
                />
            </Root.Navigator>
        </NavigationContainer>
    )
}

// Animation used for the InfoModal
function animateFromBottom({ current }: StackCardInterpolationProps): StackCardInterpolatedStyle {
    return ({
        cardStyle: {
            transform: [{
                translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0],
                    extrapolate: 'clamp',
                })
            }],
        },
        overlayStyle: {
            backgroundColor: 'black',
            opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
                extrapolate: 'clamp',
            })
        }
    })
}

// Animation used for the NotificationModal
function animateFromTop({ current }: StackCardInterpolationProps): StackCardInterpolatedStyle {
    return ({
        cardStyle: {
            transform: [{
                translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-200, 0],
                    extrapolate: 'clamp',
                })
            }],
        },
        overlayStyle: {
            backgroundColor: 'black',
            opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
                extrapolate: 'clamp',
            })
        }
    })
}
