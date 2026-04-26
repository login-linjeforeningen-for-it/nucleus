import { StyleSheet, Dimensions, Platform } from 'react-native'
import T from './text'

export const ES = StyleSheet.create({
    // Middle card view
    view2: {
        justifyContent: 'center',
        marginLeft: 5,
        top: 2,
        width: '80%',
        maxHeight: 55
    },
    // Right side card view
    view3: {
        justifyContent: 'center',
    },
    // Card height and direction on eventscreen
    eventBack: {
        flexDirection: 'row',
    },
    // Eventmonth text on specificEventScreen
    monthText: {
        ...T.text16,
    },
    // Eventday text on eventScreen
    eventClusterDayText: {
        ...T.text20,
    },
    // Event name text on eventScreen
    title: {
        maxHeight: 48,
        ...T.text18,
        lineHeight: 24
    },
    // Eventlocation text on eventScreen
    loc: {
        top: 3,
        ...T.text15,
        maxHeight: 19
    },
    //======================== SpecificEventScreen ===================
    // Layout for specificEventScreen
    specificEventInfoView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    // The header image on specificEventScreen
    specificEventImage: {
        alignSelf: 'center',
        width: Dimensions.get('window').width - 24,
        resizeMode: 'stretch',
        height: 150,
        marginTop: 8
    },
    //======================== EventComponentStyles ===================
    // Middle sized icons
    size: {
        height: 40,
        width: 40,
    },
    // Middle sized icons
    bellSize: {
        height: 30,
        width: 30,
    },
    bellPosition: {
        top: 15,
    },
    // View to change the flex direction to horizontally align items
    absoluteView: {
        flexDirection: 'row',
        display: 'flex'
    },
    // Position of specific event color circle
    eventLight: {
        top: Platform.OS === 'ios' ? -9 : -8,
        height: 0,
        alignSelf: 'center',
        left: 2,
    },
    // Position of specific event color circle
    specificEventLight: {
        height: 20,
        width: 20,
    },
    // Card styling
    card: {
        borderRadius: 20,
        marginHorizontal: 10,
        marginTop: 10,
    },
    // Card content styling
    cardContent: {
        marginHorizontal: 18,
        marginVertical: 18,
    },
    // Smaller card
    cardSmaller: {
        marginHorizontal: 10,
        borderRadius: 20,
    },
    clusterWraper: {
        borderRadius: 5,
    },
    // Card content styling
    clusterContent: {
    },
    // Smaller card
    clusterSmaller: {
        marginHorizontal: 10,
        borderRadius: 20,
    },
    // Filter view
    clusterFilterView: {
        flexDirection: 'row',
        maxHeight: 100
    },
    // EventScreen filter text
    clusterFilterText: {
        alignSelf: 'center',
        alignItems: 'center',
        height: 40,
        color: 'white', // White text color (should be moved to depend on theme)
        display: 'flex',
        flexGrow: 1
    },
    // Position of eventfilter check icon
    checkBox: {
        top: '-45%',
    },
    // Eventfilter checked icon
    checkedBox: {
        top: '-80%',
        right: 20,
    },
    // Checkmark on check icon
    checkedIconCheckMark: {
        top: 2,
        left: 1
    },
    // View for categories inside the filter
    clusterCategoryView: {
        flexDirection: 'row',
        left: 6,
        width: Dimensions.get('window').width / 3.1,
        alignItems: 'center',
    },
    // Filter reset icon
    clusterFilterResetIcon: {
        height: 40,
        width: 40,
    },
    eventButton: {
        height: 40,
        width: Dimensions.get('window').width * 0.95,
        alignSelf: 'center',
        borderRadius: 10,
    },
    // Mazemap icon used on SES
    mazemapIcon: {
        left: 4,
        height: 20,
        width: 10,
    },
    // When all u need is a row
    row: {
        top: 4,
        flexDirection: 'row',
    },
    sesContent: {
        height: Dimensions.get('window').height + 200,
    },
    id: {
        alignSelf: 'center',
        ...T.text15,
        marginVertical: 10
    }
})

export default ES
