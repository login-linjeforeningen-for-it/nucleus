import AdScreen from '@screens/ads'
import EventScreen from '@screens/event'
import SpecificAdScreen from '@screens/ads/specificAd'
import SpecificEventScreen from '@screens/event/specificEvent'
import AboutScreen from '@screens/menu/about'
import AiScreen from '@screens/menu/ai'
import AlbumsScreen from '@screens/menu/albums'
import AlertsScreen from '@screens/menu/alerts'
import AnnouncementsScreen from '@screens/menu/announcements'
import BusinessScreen from '@screens/menu/business'
import ContentScreen from '@screens/menu/content'
import CourseScreen from '@screens/menu/course/index'
import DatabaseBackupsScreen from '@screens/menu/databaseBackups'
import DatabaseScreen from '@screens/menu/database'
import DashboardScreen from '@screens/menu/dashboard'
import DiceScreen from '@screens/menu/games/dice'
import FundScreen from '@screens/menu/fund'
import GameScreen from '@screens/menu/games/index'
import HoneyScreen from '@screens/menu/honey'
import InternalScreen from '@screens/menu/internal'
import LoadBalancingScreen from '@screens/menu/loadBalancing'
import LoginScreen from '@screens/menu/login'
import LogsScreen from '@screens/menu/logs'
import MenuScreen from '@screens/menu'
import MusicScreen from '@screens/menu/music'
import NotificationScreen from '@screens/menu/notifications'
import NucleusDocumentationScreen from '@screens/menu/nucleusDocumentation'
import PolicyScreen from '@screens/menu/policy'
import ProfileScreen from '@screens/menu/profile'
import PwnedScreen from '@screens/menu/pwned'
import QueenbeeScreen from '@screens/menu/queenbee'
import SearchScreen from '@screens/menu/search'
import SettingScreen from '@screens/menu/settings'
import SpecificAlbumScreen from '@screens/menu/specificAlbum'
import SpecificCourseScreen from '@screens/menu/course/specificCourse'
import SpecificGameScreen from '@screens/menu/games/specificGame'
import StatusScreen from '@screens/menu/status'
import TrafficMapScreen from '@screens/menu/trafficMap'
import TrafficRecordsScreen from '@screens/menu/trafficRecords'
import TrafficScreen from '@screens/menu/traffic'
import VervScreen from '@screens/menu/verv'
import VulnerabilitiesScreen from '@screens/menu/vulnerabilities'
import { createStackNavigator } from '@react-navigation/stack'
import Header from './header'
import { useSelector } from 'react-redux'

const EventStack = createStackNavigator<EventStackParamList>()
const AdStack = createStackNavigator<AdStackParamList>()
const MenuStack = createStackNavigator<MenuStackParamList>()

function useScreenOptions() {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return {
        animation: 'none' as const,
        headerTransparent: true,
        header: (props: any) => <Header {...props} />,
        cardStyle: { backgroundColor: theme.darker },
    }
}

export function Events() {
    const screenOptions = useScreenOptions()

    return (
        <EventStack.Navigator screenOptions={screenOptions}>
            <EventStack.Screen name='EventScreen' component={EventScreen} />
            <EventStack.Screen name='SpecificEventScreen' component={SpecificEventScreen} />
        </EventStack.Navigator>
    )
}

export function Ads() {
    const screenOptions = useScreenOptions()

    return (
        <AdStack.Navigator screenOptions={screenOptions}>
            <AdStack.Screen name='AdScreen' component={AdScreen} />
            <AdStack.Screen name='SpecificAdScreen' component={SpecificAdScreen} />
        </AdStack.Navigator>
    )
}

export function Menu() {
    const screenOptions = useScreenOptions()

    return (
        <MenuStack.Navigator screenOptions={screenOptions}>
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
            <MenuStack.Screen name='SpecificAdScreen' component={MenuSpecificAdScreen} />
            <MenuStack.Screen name='DashboardScreen' component={DashboardScreen} />
            <MenuStack.Screen name='LoadBalancingScreen' component={LoadBalancingScreen} />
            <MenuStack.Screen name='TrafficScreen' component={TrafficScreen} />
            <MenuStack.Screen name='TrafficRecordsScreen' component={TrafficRecordsScreen} />
            <MenuStack.Screen name='TrafficMapScreen' component={TrafficMapScreen} />
            <MenuStack.Screen name='ContentScreen' component={ContentScreen} />
            <MenuStack.Screen name='AnnouncementsScreen' component={AnnouncementsScreen} />
            <MenuStack.Screen name='AlertsScreen' component={AlertsScreen} />
            <MenuStack.Screen name='NucleusDocumentationScreen' component={NucleusDocumentationScreen} />
            <MenuStack.Screen name='HoneyScreen' component={HoneyScreen} />
            <MenuStack.Screen name='DatabaseScreen' component={DatabaseScreen} />
            <MenuStack.Screen name='DatabaseBackupsScreen' component={DatabaseBackupsScreen} />
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

function MenuSpecificAdScreen(props: MenuProps<'SpecificAdScreen'>) {
    return <SpecificAdScreen {...props as unknown as AdScreenProps<'SpecificAdScreen'>} />
}
