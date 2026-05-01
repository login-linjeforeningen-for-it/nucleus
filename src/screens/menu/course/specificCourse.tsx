import { useDispatch, useSelector } from 'react-redux'
import Parent from '@components/shared/parent'
import ReadOnly from '@components/course/readonly'
import { setLocalTitle } from '@redux/misc'
import { getCourseByCode } from '@utils/course/course'
import { JSX, useCallback, useEffect, useState } from 'react'
import { RefreshControl, Text, View } from 'react-native'
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

    async function fetchCourse() {
        const course = await getCourseByCode(route.params.code)

        if (course) {
            setCourse(course)
            return true
        }
    }

    useEffect(() => {
        if (route.params.code !== localTitle?.title) {
            dispatch(setLocalTitle({ title: route.params.code, screen: 'SpecificCourseScreen' }))
        }
    }, [dispatch, localTitle?.title, route.params.code])

    useEffect(() => {
        (async () => {
            await fetchCourse()
        })()
    }, [])

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        try {
            const course = await fetchCourse()
            if (course) {
                setClicked([])
            }
        } finally {
            setRefresh(false)
        }
    }, [])

    return (
        <Parent paddingHorizontal={-1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={100}
                style={{ paddingVertical: 10, bottom: 10, paddingTop: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refresh}
                        onRefresh={onRefresh}
                        tintColor={theme.refresh}
                        progressViewOffset={100}
                    />
                }
            >
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
