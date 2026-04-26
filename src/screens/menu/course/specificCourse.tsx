import { useDispatch, useSelector } from 'react-redux'
import Parent from '@components/shared/parent'
import ReadOnly from '@components/course/readonly'
import { setLocalTitle } from '@redux/misc'
import { getCourse } from '@utils/course'
import { JSX, useCallback, useEffect, useState } from 'react'
import { Dimensions, Platform, RefreshControl, Text, View } from 'react-native'
import Swipeable from '@components/course/swipeable'
import { ScrollView } from 'react-native-gesture-handler'
import T from '@styles/text'

export default function SpecificCourseScreen({ route }: MenuProps<'SpecificCourseScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { localTitle } = useSelector((state: ReduxState) => state.misc)
    const [refresh, setRefresh] = useState(false)
    const [course, setCourse] = useState<Course | string>('')
    const [clicked, setClicked] = useState<number[]>([])
    const dispatch = useDispatch()
    const height = Dimensions.get('window').height

    if (route.params.code !== localTitle?.title) {
        dispatch(setLocalTitle({ title: route.params.code, screen: 'SpecificCourseScreen' }))
    }

    async function fetchCourse() {
        const course = await getCourse(route.params.id)

        if (course) {
            setCourse(course)
            return true
        }
    }

    useEffect(() => {
        (async () => {
            await fetchCourse()
        })()
    }, [])

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        const course = await fetchCourse()

        if (course) {
            setClicked([])
            setRefresh(false)
        }
    }, [refresh])

    function paddingtop() {
        if (height <= 592) {
            return 20
        }

        if (height > 592 && height < 700) {
            return 20
        }

        if (height > 700 && height < 800) {
            return 17.5
        }

        if (height > 800 && height < 900) {
            return 40
        }

        return undefined
    }

    return (
        <Parent paddingHorizontal={-1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={100}
                style={{ paddingVertical: 10, bottom: 10, paddingTop: Platform.OS === 'ios' ? undefined : paddingtop() }}
            >
                <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                {typeof course === 'string'
                    ? <Text style={{ ...T.text18, color: theme.textColor }}>{course}</Text>
                    : course.cards.length ? <Swipeable
                        course={course}
                        clicked={clicked}
                        setClicked={setClicked}
                    /> : <Study
                        course={course}
                        onSaved={(notes) => setCourse({ ...course, notes })}
                    />
                }
            </ScrollView>
        </Parent>
    )
}

function Study({ course, onSaved }: { course: Course, onSaved: (notes: string) => void }) {
    return (
        <View>
            <ReadOnly courseId={Number(course.id)} text={course.notes} onSaved={onSaved} />
        </View>
    )
}
