import { StyleSheet, Dimensions, Platform } from "react-native"
import T from "./text"

export const GS = StyleSheet.create({
    // Main view of every screen
    content: {
        height: Dimensions.get("window").height + 60,
        paddingHorizontal: 12
    },
    // Horizontal card views on setting notifications
    notificationBack: {
        flexDirection: "row",
        alignItems: "center",
    },
    // Notification card text
    notificationText: {
        ...T.text20,
    },
    // Notification card text
    notificationTip: {
        ...T.text15,
    },
    // ReportScreen name and notifier text
    inputText: {
        alignSelf: "center",
        alignItems: "center",
        width: "80%",
        height: 50,
        borderRadius: 20,
    },
    // Left view of notificationScreen
    view: {
        alignSelf: "center",
        width: "84%",
    },
    // Right view of notificationScreen
    view2: {
        justifyContent: "center",
        marginVertical: 2,
    },
    // Used anywhere there is a small image
    smallImage: {
        alignSelf: "center",
        height: 150,
        width: 150,
    },
    parentCommitteeView: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 8,
        maxWidth: "93%"
    },
    committee: {
        borderRadius: 10,
    },
    image80: {
        alignSelf: "center",
        height: 80,
        width: 80,
    },
    dropdown: {
        flexDirection: "row",
        paddingLeft: 5,
        alignItems: "center",
        height: 40,
    },
    reminderDropdown: {
        flexDirection: "row",
        alignItems: "center",
        height: 40,
        justifyContent: "space-between",
    },
    dropdownContent: {
        flexDirection: "row",
        paddingLeft: 10,
        alignItems: "center",
        height: 36,
    },
    dropImage: {
        alignSelf: "center",
        height: 60,
        width: 40,
    },
    reminderDropdownArrow: {
        alignSelf: "center",
        height: 20,
        width: 20,
        resizeMode: "contain",
    },
    smallDropImage: {
        alignSelf: "center",
        height: 40,
        width: 25
    },
    row: {
        flexDirection: "row",
    },
    aboutImage: {
        width: "100%",
        height: undefined,
        aspectRatio: 1.5,
    },
    tiny: {
        height: 15,
        width: 25,
    },
    medium: {
        alignSelf: "center",
        height: 50,
        width: 50,
    },
    small: {
        height: 25,
        width: 35,
    },
    personImage: {
        alignSelf: "center",
        width: 220,
        height: 220,
        marginBottom: 10
    },
    socialView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    socialPartView: {
        width: "15%",
        alignItems: "center",
    },
    notificationDropdownTouchable: {
        top: 50,
        marginHorizontal: 12,
        zIndex: 3,
        borderRadius: 20,
        height: 70,
        alignItems: "flex-start",
        paddingHorizontal: 14
    },
    notificationDropdownBlur: {
        top: 50,
        position: "absolute",
        marginHorizontal: 12,
        width: "94%",
        zIndex: 1,
        borderRadius: 10,
        height: 70,
        overflow: "hidden"
    },
    notificationDropdownTitle: {
        fontWeight: "500",
        ...T.text20,
    },
    notificationDropdownBody: {
        ...T.text18,
    },
    headerView: {
        position: "absolute",
        zIndex: 1,
        display: 'flex',
        flexDirection: 'row',
    },
    innerHeaderViewOne: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    innerHeaderViewTwo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    headerTitle: {
        alignSelf: 'center',
        ...T.text18,
    },
    blurBackgroundView: {
        position: "absolute",
        width: "100%",
        justifyContent: "center",
    },
    customMenuIcon: {
        right: Platform.OS === "ios"
            ? Dimensions.get("window").width / 50
            : Dimensions.get("window").width / 30
    },
    logo: {
        left: Platform.OS === "ios"
            ? Dimensions.get("window").width / 21.5
            : Dimensions.get("window").width / 20
    },
    tag: {
        width: 15,
        height: 15,
        top: 1,
        resizeMode: "contain",
    },
    animatedCard: {
        position: "absolute",
        zIndex: 2,
        bottom: 0,
        height: Platform.OS == "ios" ? Dimensions.get("window").height / 1.48 : Dimensions.get("window").height / 1.40,
        width: "100%",
        borderRadius: 20,
    },
    trashCan: {
        height: 50,
        width: 50
    },
    errorImage: {
        alignSelf: "center",
        width: Dimensions.get("window").width - 30,
        resizeMode: "stretch",
        height: 300,
        marginTop: 8
    },
})

export default GS
