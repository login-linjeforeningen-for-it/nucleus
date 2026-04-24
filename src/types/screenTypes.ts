import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
declare global {
    namespace ReactNavigation {
        interface RootParamList extends TabBarParamList { }
    }
}

export type TabBarProps<T extends keyof TabBarParamList> =
    BottomTabScreenProps<TabBarParamList, T>

export type EventStackParamList = {
    EventScreen: undefined
    SpecificEventScreen: { eventID: number }
}

export type EventScreenProps<T extends keyof EventStackParamList> =
    CompositeScreenProps<
        StackScreenProps<EventStackParamList, T>,
        BottomTabScreenProps<TabBarParamList>
    >

export type AdStackParamList = {
    AdScreen: undefined
    SpecificAdScreen: { adID: number }
}

export type AdScreenProps<T extends keyof AdStackParamList> =
    CompositeScreenProps<
        StackScreenProps<AdStackParamList, T>,
        BottomTabScreenProps<TabBarParamList>
    >

export type MenuRoutes =
    "ProfileScreen"
    | "SettingScreen"
    | "NotificationScreen"
    | "AboutScreen"
    | "BusinessScreen"
    | "CourseScreen"
    | "SpecificCourseScreen"
    | "LoginScreen"
    | "AiScreen"
    | "AdminScreen"
    | "InternalScreen"
    | "GameScreen"
    | "SpecificGameScreen"
    | "SearchScreen"
    | "StatusScreen"
    | "MusicScreen"
    | "DashboardScreen"

export type ItemProps = {
    id: number
    nav: MenuRoutes
    title: string
}

export type MenuProps<T extends keyof MenuStackParamList> =
    StackScreenProps<MenuStackParamList, T>

export type MenuStackParamList = {
    ProfileScreen: undefined
    SettingScreen: undefined
    NotificationScreen: undefined
    AboutScreen: undefined
    BusinessScreen: undefined
    LoginScreen: undefined
    AiScreen: undefined
    AdminScreen: undefined
    InternalScreen: undefined
    SearchScreen: undefined
    StatusScreen: undefined
    MusicScreen: undefined
    DashboardScreen: undefined
    MenuScreen: undefined
    CourseScreen: undefined
    SpecificCourseScreen: { code: string, id: number }
    GameScreen: undefined
    SpecificGameScreen: { gameID: number, gameName: string }
    DiceScreen: undefined
}

export type TabBarParamList = {
    EventNav: NavigatorScreenParams<EventStackParamList>
    AdNav: NavigatorScreenParams<AdStackParamList>
    MenuNav: NavigatorScreenParams<MenuStackParamList>
}

export type RootStackParamList = {
    Tabs: NavigatorScreenParams<TabBarParamList>
    InfoModal: undefined
    NotificationModal: { title: string, body: string, data: any }
}

export type RootStackProps<T extends keyof RootStackParamList> =
    CompositeScreenProps<StackScreenProps<RootStackParamList, T>,
        BottomTabScreenProps<TabBarParamList>>
