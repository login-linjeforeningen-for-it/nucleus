import Cluster from "@/components/shared/cluster"
import Space from "@/components/shared/utils"
import CS from "@styles/clusterStyles"
import GS from "@styles/globalStyles"
import { useSelector } from "react-redux"
import T from "@styles/text"
import Swipe from "@components/nav/swipe"
import { RefreshControl, ScrollView } from "react-native-gesture-handler"
import CourseError from "@components/course/courseError"
import { getCourses } from "@utils/course"
import { JSX, useCallback, useEffect, useState } from "react"
import { View, Image, TouchableOpacity, Dimensions, Text, Platform } from "react-native"
import { MenuProps, MenuStackParamList } from "@type/screenTypes"
import { StackNavigationProp } from "@react-navigation/stack"

type CourseListProps = {
    course: CourseAsList
    navigation: StackNavigationProp<MenuStackParamList, "CourseScreen">
}

export default function CourseScreen({ navigation }: MenuProps<'CourseScreen'>): JSX.Element {
    const [courses, setCourses] = useState<string | CourseAsList[]>([])
    const { theme } = useSelector((state: ReduxState) => state.theme )
    const [refresh, setRefresh] = useState(false)
    const height = Dimensions.get("window").height

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        const courses = await getCourses()
        if (courses) {
            setCourses(courses)
            setRefresh(false)
        }
    }, [refresh])

    useEffect(() => {
        (async () => {
            const courses = await getCourses()
            
            if (courses) {
                setCourses(courses)
            }
        })()
    }, [])

    const extraHeight = Platform.OS === "ios" ? 0 : height > 800 && height < 900 ? 20 : 10

    return (
        <Swipe left="MenuScreen">
            <View style={{...GS.content, backgroundColor: theme.darker}}>
                <Space height={Dimensions.get("window").height / 8.1 + extraHeight} /> 
                <ScrollView
                    showsVerticalScrollIndicator={false} 
                    scrollEventThrottle={100}
                >
                    {typeof courses === 'string' && <CourseError text={courses} />}
                    <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                    {typeof courses !== 'string' && courses.map((course: CourseAsList) => 
                        <CourseList 
                            key={course.id} 
                            course={course} 
                            navigation={navigation} 
                        />
                    )}
                </ScrollView>
            </View>
        </Swipe>
    )
}

function CourseList({ course, navigation }: CourseListProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    function handlePress() {
        navigation.navigate("SpecificCourseScreen", { code: course.code, id: course.id })
    }

    return (
        <TouchableOpacity style={{ marginBottom: 6 }} onPress={handlePress}>
            <Cluster>
                <View style={{...CS.clusterBack}}>
                    <View style={CS.twinLeft}>
                        <Text style={{...T.text20, color: theme.textColor}}>
                            {course.code}
                        </Text>
                    </View>
                    <View style={CS.twinRight}>
                        <Image
                            style={CS.arrowImage}
                            source={require("@assets/icons/dropdownBase.png")}
                        />
                    </View>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}
