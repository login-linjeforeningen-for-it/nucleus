import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import GS from '@styles/globalStyles'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import Swipe from '@components/nav/swipe'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import { ScrollView } from 'react-native-gesture-handler'
import CourseError from '@components/course/courseError'
import { getCourses } from '@utils/course'
import { JSX, useCallback, useEffect, useState } from 'react'
import { View, Image, TouchableOpacity, Dimensions, RefreshControl, Text } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'

type CourseListProps = {
    course: CourseAsList
    navigation: StackNavigationProp<MenuStackParamList, 'CourseScreen'>
}

export default function CourseScreen({ navigation }: MenuProps<'CourseScreen'>): JSX.Element {
    const [courses, setCourses] = useState<string | CourseAsList[]>([])
    const { theme } = useSelector((state: ReduxState) => state.theme )
    const [refresh, setRefresh] = useState(false)

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        try {
            const courses = await getCourses()
            if (courses) {
                setCourses(courses)
            }
        } finally {
            setRefresh(false)
        }
    }, [])

    useEffect(() => {
        (async () => {
            const courses = await getCourses()

            if (courses) {
                setCourses(courses)
            }
        })()
    }, [])

    return (
        <Swipe left='MenuScreen'>
            <View style={{...GS.content, backgroundColor: theme.darker}}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={100}
                    style={{ paddingTop: 100 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={onRefresh}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                >
                    {typeof courses === 'string' && <CourseError text={courses} />}
                    {typeof courses !== 'string' && courses.map((course: CourseAsList) =>
                        <CourseList
                            key={course.id}
                            course={course}
                            navigation={navigation}
                        />
                    )}
                    <Space height={Dimensions.get('window').height / 8.5} />
                </ScrollView>
                <TopRefreshIndicator refreshing={refresh} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function CourseList({ course, navigation }: CourseListProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    function handlePress() {
        navigation.navigate('SpecificCourseScreen', { code: course.code, id: course.id })
    }

    return (
        <TouchableOpacity style={{ marginBottom: 8 }} onPress={handlePress}>
            <Cluster marginHorizontal={0}>
                <View style={{
                    ...GS.notificationBack,
                    paddingVertical: 4,
                }}>
                    <View style={{
                        width: 3,
                        alignSelf: 'stretch',
                        borderRadius: 99,
                        backgroundColor: theme.orange,
                        marginRight: 10,
                        opacity: 0.45,
                    }} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ ...T.text18, color: theme.textColor }}>
                            {course.code}
                        </Text>
                        <Text style={{
                            ...T.text12,
                            color: theme.oppositeTextColor,
                            marginTop: 2,
                        }}>
                            {`${course.count} ${lang ? 'spørsmål' : 'questions'}`}
                        </Text>
                    </View>
                    <View style={{
                        minWidth: 28,
                        marginLeft: 12,
                        alignSelf: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Image
                            style={{
                                height: 14,
                                width: 14,
                                resizeMode: 'contain',
                                tintColor: theme.orange,
                            }}
                            source={require('@assets/icons/dropdownBase.png')}
                        />
                    </View>
                </View>
            </Cluster>
        </TouchableOpacity>
    )
}
