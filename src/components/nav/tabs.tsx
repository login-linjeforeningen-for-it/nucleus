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
import AdScreen from '@screens/ads'
import EventScreen from '@screens/event'
import MenuScreen from '@screens/menu'
import MS from '@styles/menuStyles'
import TagInfo from '@components/shared/tagInfo'
import NotificationModal from '@components/shared/notificationModal'
import NotificationScreen from '@screens/menu/notifications'
import ProfileScreen from '@screens/menu/profile'
import SettingScreen from '@screens/menu/settings'
import AboutScreen from '@screens/menu/about'
import BusinessScreen from '@screens/menu/business'
import InternalScreen from '@screens/menu/internal'
import LoginScreen from '@screens/menu/login'
import AiScreen from '@screens/menu/ai'
import QueenbeeScreen from '@screens/menu/queenbee'
import GameScreen from '@screens/menu/games/index'
import CourseScreen from '@screens/menu/course/index'
import SearchScreen from '@screens/menu/search'
import StatusScreen from '@screens/menu/status'
import MusicScreen from '@screens/menu/music'
import AlbumsScreen from '@screens/menu/albums'
import FundScreen from '@screens/menu/fund'
import VervScreen from '@screens/menu/verv'
import PolicyScreen from '@screens/menu/policy'
import PwnedScreen from '@screens/menu/pwned'
import DashboardScreen from '@screens/menu/dashboard'
import LoadBalancingScreen from '@screens/menu/loadBalancing'
import DatabaseScreen from '@screens/menu/database'
import VulnerabilitiesScreen from '@screens/menu/vulnerabilities'
import LogsScreen from '@screens/menu/logs'
import TrafficScreen from '@screens/menu/traffic'
import TrafficRecordsScreen from '@screens/menu/trafficRecords'
import TrafficMapScreen from '@screens/menu/trafficMap'
import ContentScreen from '@screens/menu/content'
import SpecificEventScreen from '@screens/event/specificEvent'
import SpecificAdScreen from '@screens/ads/specificAd'
import SpecificAlbumScreen from '@screens/menu/specificAlbum'
import SpecificCourseScreen from '@screens/menu/course/specificCourse'
import SpecificGameScreen from '@screens/menu/games/specificGame'
import DiceScreen from '@screens/menu/games/dice'
import Header from './header'
import * as SystemUI from 'expo-system-ui'
import * as NavigationBar from 'expo-navigation-bar'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import linking from '@utils/linking'
import NotificationRuntime from '@utils/notification/navigateFromPushNotification'
import { navigationRef } from '@utils/navigationRef'
import { useSelector } from 'react-redux'
import { Image, Platform } from 'react-native'
import {
    StackCardInterpolatedStyle,
    StackCardInterpolationProps,
    createStackNavigator
} from '@react-navigation/stack'
import { JSX, useEffect } from 'react'

// Defines the navigators
const Root = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabBarParamList>()
const EventStack = createStackNavigator<EventStackParamList>()
const AdStack = createStackNavigator<AdStackParamList>()
const MenuStack = createStackNavigator<MenuStackParamList>()

// Defines the components in the eventStck
function Events() {
    return (
        <EventStack.Navigator screenOptions={{
            animation: 'none',
            headerTransparent: true,
            header: props => <Header {...props} />
        }}>
            <EventStack.Screen name='EventScreen' component={EventScreen} />
            <EventStack.Screen name='SpecificEventScreen' component={SpecificEventScreen} />
        </EventStack.Navigator>
    )
}

// Defines the components in the adStack
function Ads() {
    return (
        <AdStack.Navigator screenOptions={{
            animation: 'none',
            headerTransparent: true,
            header: props => <Header {...props} />
        }}>
            <AdStack.Screen name='AdScreen' component={AdScreen} />
            <AdStack.Screen name='SpecificAdScreen' component={SpecificAdScreen} />
        </AdStack.Navigator>
    )
}

// Defines the components in the menuStack
function Menu() {
    return (
        <MenuStack.Navigator screenOptions={{
            animation: 'none',
            headerTransparent: true,
            header: props => <Header {...props} />
        }}>
            <MenuStack.Screen name='MenuScreen' component={MenuScreen} />
            <MenuStack.Screen name='ProfileScreen' component={ProfileScreen} />
            <MenuStack.Screen name='SettingScreen' component={SettingScreen} />
            <MenuStack.Screen name='NotificationScreen' component={NotificationScreen} />
            <MenuStack.Screen name='AboutScreen' component={AboutScreen} />
            <MenuStack.Screen name='BusinessScreen' component={BusinessScreen} />
            <MenuStack.Screen name='LoginScreen' component={LoginScreen} />
            <MenuStack.Screen name='AiScreen' component={AiScreen} />
            <MenuStack.Screen name='QueenbeeScreen' component={QueenbeeScreen} />
            <MenuStack.Screen name='InternalScreen' component={InternalScreen} />
            <MenuStack.Screen name='SearchScreen' component={SearchScreen} />
            <MenuStack.Screen name='StatusScreen' component={StatusScreen} />
            <MenuStack.Screen name='MusicScreen' component={MusicScreen} />
            <MenuStack.Screen name='AlbumsScreen' component={AlbumsScreen} />
            <MenuStack.Screen name='SpecificAlbumScreen' component={SpecificAlbumScreen} />
            <MenuStack.Screen name='FundScreen' component={FundScreen} />
            <MenuStack.Screen name='VervScreen' component={VervScreen} />
            <MenuStack.Screen name='PolicyScreen' component={PolicyScreen} />
            <MenuStack.Screen name='PwnedScreen' component={PwnedScreen} />
            <MenuStack.Screen name='DashboardScreen' component={DashboardScreen} />
            <MenuStack.Screen name='LoadBalancingScreen' component={LoadBalancingScreen} />
            <MenuStack.Screen name='TrafficScreen' component={TrafficScreen} />
            <MenuStack.Screen name='TrafficRecordsScreen' component={TrafficRecordsScreen} />
            <MenuStack.Screen name='TrafficMapScreen' component={TrafficMapScreen} />
            <MenuStack.Screen name='ContentScreen' component={ContentScreen} />
            <MenuStack.Screen name='DatabaseScreen' component={DatabaseScreen} />
            <MenuStack.Screen name='VulnerabilitiesScreen' component={VulnerabilitiesScreen} />
            <MenuStack.Screen name='LogsScreen' component={LogsScreen} />
            <MenuStack.Screen name='CourseScreen' component={CourseScreen} />
            <MenuStack.Screen name='SpecificCourseScreen' component={SpecificCourseScreen} />
            <MenuStack.Screen name='GameScreen' component={GameScreen} />
            <MenuStack.Screen name='SpecificGameScreen' component={SpecificGameScreen} />
            <MenuStack.Screen name='DiceScreen' component={DiceScreen} />
        </MenuStack.Navigator>
    )
}

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
