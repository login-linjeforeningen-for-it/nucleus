import { MenuProps } from "@type/screenTypes"
import { useDispatch, useSelector } from "react-redux"
import Parent from "@components/shared/parent"
import { setLocalTitle } from "@redux/misc"
import { getCourse } from "@utils/course"
import { JSX, useCallback, useEffect, useState } from "react"
import { Dimensions, Platform, RefreshControl, Text, View } from "react-native"
import Swipeable from "@components/course/swipeable"
import { ScrollView } from "react-native-gesture-handler"
import T from "@styles/text"
import Markdown from "@components/course/markdown"
import Space from "@components/shared/utils"

export default function SpecificCourseScreen({ route }: MenuProps<"SpecificCourseScreen">): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { localTitle } = useSelector((state: ReduxState) => state.misc)
    const [refresh, setRefresh] = useState(false)
    const [course, setCourse] = useState<Course | string>("")
    const [clicked, setClicked] = useState<number[]>([])
    const dispatch = useDispatch()
    const height = Dimensions.get("window").height

    if (route.params.code !== localTitle?.title) {
        dispatch(setLocalTitle({ title: route.params.code, screen: "SpecificCourseScreen" }))
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
                    /> : <Study course={course} />
                }
            </ScrollView>
        </Parent>
    )
}

function Study({ course }: { course: Course }) {
    const { lang } = useSelector((state: ReduxState) => state.lang)

    function formatText(text: string) {
        return text.replaceAll('<br></br>', '\n').replaceAll('<br>', '\n')
    }

    const initialText = formatText(course.notes)
    const text = initialText.length ? initialText : lang
        ? 'Dette emnet er ikke flervalg, men det finnes ingen notater enda. Dette emnet må studeres på egenhånd. Kanskje du kan hjelpe andre med å legge inn notatene dine på nettsiden så de blir tilgjengelige her?'
        : 'This course is not multiple choice, and no study notes exist yet. This course must be studied by reviewing the available course material. Maybe you can help others by adding your notes on the website so they become available here?'

    return (
        <View>
            <Markdown text={text} />
            <Space height={text.length / 100} />
        </View>
    )
}
