import GS from "@styles/globalStyles"
import Cluster from "@/components/shared/cluster"
import { useState } from "react"
import T from "@styles/text"
import Link from "@components/shared/link"
import { useSelector } from "react-redux"
import { View, Text, TouchableOpacity, Image } from "react-native"

type DropdownItemProps = {
    title: string
    course: number
    selectedDegree: (val: number) => void
    courses: Course[]
    degree: number
}

type Course = {
    id: number
    title: string
    link: string
}

/**
 * Creates a full dropdownmenu for bachelor, master and phd
 * @returns View
 */
export default function Dropdown() {
    const { lang } = useSelector((state: ReduxState) => state.lang)

    const titleNO = {
        data: "Dataingeniør",
        digsec: "Digital infrastruktur og cybersikkerhet",
        prog: "Programmering",
        infosec: "Informasjonsikkerhet og kommunikasjonsteknologi",
        cs: "Datateknologi og informatikk",
        phet: "Elektronikk og telekommunikasjon"
    }

    const titleEN = {
        data: "Computer Science",
        digsec: "Digital Infrastructure and Cyber Security",
        prog: "Programming",
        infosec: "Information Security and Communication Technology",
        cs: "Computer Science",
        phet: "Electronics and Telecommunication"
    }

    const title = lang ? titleNO : titleEN

    const bcourses = [
        { id: 0, title: title.data, link: "https://www.ntnu.no/studier/bidata" },
        { id: 1, title: title.digsec, link: "https://www.ntnu.no/studier/bdigsec" },
        { id: 2, title: title.prog, link: "https://www.ntnu.no/studier/bprog" }
    ]

    const mcourses = [
        { id: 0, title: "Information Security", link: "https://www.ntnu.no/studier/mis" },
        { id: 1, title: "Applied Computer Science", link: "https://www.ntnu.edu/studies/macs" },
        { id: 2, title: "Computational colour and spectral imaging", link: "https://www.ntnu.no/studier/mscosi" }
    ]

    const pcourses = [
        { id: 0, title: title.infosec, link: "https://www.ntnu.no/studier/phisct" },
        { id: 1, title: title.cs, link: "https://www.ntnu.no/studier/phcos" },
        { id: 2, title: title.phet, link: "https://www.ntnu.no/studier/phet" }
    ]

    const [course, selectCourse] = useState(0)

    function selectedDegree(val: number) {
        if (course === val) {
            selectCourse(-1)
        } else {
            selectCourse(val)
        }
    }

    return (
        <View style={{ marginTop: 2, marginBottom: 4 }}>
            <DropdownItem title="Bachelor" course={course} selectedDegree={selectedDegree} courses={bcourses} degree={1} />
            <DropdownItem title="Master" course={course} selectedDegree={selectedDegree} courses={mcourses} degree={2} />
            <DropdownItem title="Ph.d" course={course} selectedDegree={selectedDegree} courses={pcourses} degree={3} />
        </View>
    )
}

function DropdownItem({ title, course, selectedDegree, courses, degree }: DropdownItemProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const arrow = course === degree
        ? require("@assets/icons/linkselected.png")
        : require("@assets/icons/dropdown-orange.png")

    return (
        <>
            <TouchableOpacity onPress={() => selectedDegree(degree)}>
                <Cluster marginHorizontal={0}>
                    <View style={{
                        ...GS.dropdown,
                        backgroundColor: theme.contrast,
                        marginBottom: course === degree ? 2 : 6,
                        borderRadius: 12,
                        paddingRight: 10,
                        paddingLeft: 0,
                        height: 46,
                    }}>
                        <View style={{
                            width: 3,
                            alignSelf: "stretch",
                            borderRadius: 99,
                            backgroundColor: theme.orange,
                            marginRight: 10,
                            opacity: course === degree ? 0.75 : 0.45,
                        }} />
                        <Image style={{ ...GS.dropImage, height: 44, width: 28 }} source={arrow} />
                        <Text style={{
                            ...T.text18,
                            color: theme.textColor,
                            flex: 1,
                            textAlign: "left",
                        }}>
                            {title}
                        </Text>
                    </View>
                </Cluster>
            </TouchableOpacity>

            <View>
                {course === degree &&
                    courses.map((selectedCourse, index) => {
                        return (
                            <Link key={index} url={selectedCourse.link}>
                                <Cluster marginHorizontal={0}>
                                    <View style={{
                                        ...GS.dropdownContent,
                                        backgroundColor: theme.contrast,
                                        marginBottom: index === courses.length - 1 ? 8 : 4,
                                        paddingRight: 10,
                                        paddingLeft: 0,
                                        minHeight: 40,
                                    }}>
                                        <View style={{
                                            width: 3,
                                            alignSelf: "stretch",
                                            borderRadius: 99,
                                            backgroundColor: theme.orange,
                                            marginRight: 10,
                                            opacity: 0.22,
                                        }} />
                                        <Text style={{
                                            ...T.text15,
                                            flex: 1,
                                            color: theme.textColor
                                        }}>
                                            {selectedCourse.title}
                                        </Text>
                                        <Image
                                            style={{ ...GS.smallDropImage, height: 22, width: 18 }}
                                            source={require("@assets/icons/linkicon-white.png")}
                                        />
                                    </View>
                                </Cluster>
                            </Link>
                        )
                    })
                }
            </View>
        </>
    )
}
