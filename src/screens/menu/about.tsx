import Space, { Line } from "@/components/shared/utils"
import Dropdown from "@/components/about/dropdown"
import Cluster from "@/components/shared/cluster"
import GS from "@styles/globalStyles"
import { useSelector } from "react-redux"
import en from "@text/menu/about/en.json"
import no from "@text/menu/about/no.json"
import React, { JSX, useState } from "react"
import T from "@styles/text"
import Person, {
    AllComitees,
    Social,
    Styret,
    Copyright
} from "@/components/about/social"
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    StyleProp,
    ViewStyle,
    Platform,
} from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import Swipe from "@components/nav/swipe"
import { SvgXml } from "react-native-svg"
import prkomSVG from "@assets/committee/prkom/pr-icon.svg"
import ctfkomSVG from "@assets/committee/ctfkom/ctfkom-icon.svg"
import evntkomSVG from "@assets/committee/evntkom/evntkom-icon.svg"
import satkomSVG from "@assets/committee/satkom/satkom-icon.svg"
import bedkomSVG from "@assets/committee/bedkom/bedkom-icon.svg"
import barkomSVG from "@assets/committee/barkom/barkom-icon.svg"
import tekkomSVG from "@assets/committee/tekkom/tekkom-icon.svg"
import styretSVG from "@assets/committee/styret/styret-icon.svg"
import { TextLink } from "@components/shared/link"
import config from "@/constants"

type getCommitteeImageProps = {
    style?: StyleProp<ViewStyle>
    id: number
    theme: string
}

type CommitteePersonProps = {
    committee: number
}

type CommitteeViewProps = {
    setCommittee: React.Dispatch<React.SetStateAction<number>>
    committee: number
}

type CommitteeContentProps = {
    index: number
    relevantCommittee: CommitteeInfo
}

type CommitteeInfo = {
    id: number
    title: string
    quote: string
    description: string
}

const committeeImages = [
    styretSVG,
    evntkomSVG,
    tekkomSVG,
    prkomSVG,
    ctfkomSVG,
    satkomSVG,
    bedkomSVG,
    barkomSVG
]

export default function AboutScreen(): JSX.Element {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [committee, setCommittee] = useState(0)
    const text = lang ? no : en
    const info = text.committeeSection.info
    const height = Dimensions.get("window").height
    const extraHeight = Platform.OS === 'ios' ? 0 : height > 800 && height < 900 ? 10 : 0

    function getOffset() {
        if (Platform.OS === 'ios') {
            return 6
        }

        if (height <= 700) {
            return 5
        }

        if (height > 700 && height <= 800) {
            return 6
        }

        if (height > 800 && height < 900) {
            return 12
        }

        return 7
    }

    return (
        <Swipe left="MenuScreen">
            <View>
                <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Space height={Dimensions.get("window").height / 8.1 + extraHeight} />
                        <Cluster>
                            <Text style={{ ...T.bold40, color: theme.textColor }}>
                                {text.title}
                            </Text>
                            <Space height={5} />
                            <Line width={5}>
                                <Text style={{
                                    ...T.boldWithLine,
                                    color: theme.textColor
                                }}>
                                    {text.intro}
                                </Text>
                            </Line>
                            <Dropdown />
                            <Styret />
                            <Text style={{
                                ...T.bold25,
                                marginVertical: 15,
                                color: theme.textColor
                            }}>
                                {text.about.title}
                            </Text>
                            <Line width={5}>
                                <Text style={{
                                    ...T.boldWithLine,
                                    color: theme.textColor
                                }}>
                                    {text.about.intro}
                                </Text>
                            </Line>
                            <Text style={{
                                ...T.paragraph,
                                marginTop: 10,
                                color: theme.textColor
                            }}>
                                {text.about.body.p1}
                            </Text>
                            <Text style={{
                                ...T.paragraph,
                                marginTop: 10,
                                color: theme.textColor
                            }}>
                                {text.about.body.p2}
                            </Text>
                            <Text style={{
                                ...T.bold25,
                                marginTop: 15,
                                color: theme.textColor
                            }}>
                                {text.committeeSection.title}
                            </Text>
                            <Text style={{
                                ...T.boldParagraph,
                                marginVertical: 10,
                                color: theme.textColor
                            }}>
                                {text.committeeSection.intro}
                            </Text>
                            <CommitteeView
                                setCommittee={setCommittee}
                                committee={committee}
                            />
                            {
                                info.map((relevantCommittee, index) => {
                                    if (relevantCommittee.id === committee) {
                                        return <CommitteeContent
                                            key={index}
                                            index={index}
                                            relevantCommittee={relevantCommittee}
                                        />
                                    }
                                })
                            }

                            <CommitteePerson committee={committee} />
                            <Text style={{
                                ...T.text25,
                                marginTop: 10,
                                color: theme.textColor
                            }}>
                                {text.publicDocs.title}
                            </Text>
                            <View>
                                <Text style={{
                                    ...T.paragraph,
                                    color: theme.textColor
                                }}>
                                    {text.publicDocs.body}
                                    <TextLink
                                        url={config.wiki_url}
                                        text={text.publicDocs.wiki}
                                    />.
                                </Text>
                            </View>
                            <Social />
                            <Copyright />
                        </Cluster>
                        <Space height={Dimensions.get("window").height / getOffset()} />
                    </ScrollView>
                </View>
            </View>
        </Swipe>
    )
}

function CommitteeImage({ id, theme, style }: getCommitteeImageProps) {
    const colors: { [key: string]: string } = {
        dark: '#ffffff',
        gray: '#555555',
        light: '#000000'
    }

    return <SvgXml xml={committeeImages[id]} color={colors[theme] || '#fd8738'} style={style} />
}

function CommitteePerson({ committee }: CommitteePersonProps) {
    const committees = ["evntkom", "tekkom", "pr", "ctf", "eco", "bedkom", "barkom"]

    if (committees[committee - 1]) {
        return Person({ person: committees[committee - 1] })
    }

    return AllComitees()
}

function CommitteeView({ setCommittee, committee }: CommitteeViewProps) {
    const numRows = 1
    const numCols = Math.ceil(committeeImages.length / numRows)

    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)

    let rows: string[][] = []
    for (let i = 0; i < committeeImages.length; i += numCols) {
        rows.push(committeeImages.slice(i, i + numCols))
    }


    return (
        <View style={{ display: "flex", aspectRatio: numCols / numRows, justifyContent: 'space-between' }}>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    {row.map((_, index) => (
                        <TouchableOpacity key={index}
                            onPress={() => {
                                setCommittee(rowIndex * numCols + index)
                            }}
                            style={{
                                ...GS.committee,
                                backgroundColor: theme.contrast,
                                width: Dimensions.get('window').width / numCols - Dimensions.get('window').width / numCols * 15 / 100,
                                aspectRatio: 1,
                                justifyContent: 'space-between',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }}>
                            <CommitteeImage
                                id={rowIndex * numCols + index}
                                theme={committee == rowIndex * numCols + index ? "" : isDark ? "dark" : "gray"}
                                style={{ alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto', width: '80%', aspectRatio: 1 }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    )
}

function CommitteeContent({ index, relevantCommittee }:
    CommitteeContentProps) {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)

    return (
        <View key={index}>
            <Text style={{ ...T.text30, color: theme.textColor }}>
                <CommitteeImage id={relevantCommittee.id} style={GS.small} theme={isDark ? "dark" : "gray"} />
                {relevantCommittee.title}
            </Text>

            {relevantCommittee.quote.length > 0 &&
                <>
                    <Space height={10} />
                    <Line width={5}>
                        <Text style={{
                            ...T.boldWithLine,
                            color: theme.textColor
                        }}>
                            {relevantCommittee.quote}
                        </Text>
                    </Line>
                    <Space height={10} />
                </>
            }

            <Text style={{ ...T.paragraph, color: theme.textColor }}>
                {relevantCommittee.description}
            </Text>
            <Space height={15} />
        </View>
    )
}
