import GS from "@styles/globalStyles"
import { BlurView } from "expo-blur"
import { Navigation } from "@/interfaces"
import { View, Text, Platform, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { RootStackProps } from "@type/screenTypes"
import { JSX } from 'react'
import { resolveNotificationTarget } from "@utils/notification/list"

export default function NotificationModal({ route: { params } }: RootStackProps<'NotificationModal'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const navigation: Navigation = useNavigation()
    const isIOS = Platform.OS === "ios"
    const item = {
        title: typeof params.title === 'string' ? params.title : '',
        body: typeof params.body === 'string' ? params.body : '',
        data: params.data || {},
    }

    const title = item.title.length > 35 ? `${item.title.slice(0, 35)}...` : item.title
    const body = item.body.length > 70 ? `${item.body.slice(0, 70)}...` : item.body
    const target = resolveNotificationTarget(item.data)

    function handleOpen() {
        if (target?.kind === 'menu') {
            navigation.navigate(target.screen as never)
            return
        }

        if (target?.kind === 'event') {
            navigation.navigate("SpecificEventScreen", { eventID: target.eventID })
            return
        }

        if (target?.kind === 'ad') {
            navigation.navigate("SpecificAdScreen", { adID: target.adID })
            return
        }

        navigation.navigate("NotificationScreen")
    }

    return (
        <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => navigation.goBack()}
            activeOpacity={1}
        >
            {isIOS
                ? <BlurView style={GS.notificationDropdownBlur} intensity={50} />
                : <View style={{ backgroundColor: theme.transparentAndroid }}
                />}
            <TouchableOpacity
                style={{
                    ...GS.notificationDropdownTouchable,
                    backgroundColor: isIOS ? undefined : theme.transparent
                }}
                onPress={handleOpen}
            >
                <View testID="NotificationModal">
                    <Text style={{
                        ...GS.notificationDropdownTitle,
                        color: theme.textColor
                    }}>
                        {title}
                    </Text>
                    <Text style={{
                        ...GS.notificationDropdownBody,
                        color: theme.textColor,
                    }}>
                        {body}
                    </Text>
                </View>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}
