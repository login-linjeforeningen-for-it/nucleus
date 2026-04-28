import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import Markdown from './markdown'
import T from '@styles/text'
import { Path, Svg } from 'react-native-svg'

type CourseContentProps = {
    course: Course,
    clicked: number[]
    setClicked: Dispatch<SetStateAction<number[]>>
    cardID: number
    displayCardID?: number
    setCardID: Dispatch<SetStateAction<number>>
    previous: number
    next: number
    showFooter?: boolean
}

type CardProps = {
    card: Card,
    shuffledAlternatives: string[],
    indexMapping: number[],
    handlePress: (index: number) => void,
    getBackground: (index: number) => string
    cardID: number
    length: number
}

type CardFooterProps = {
    votes: number,
    clicked: number[],
    setClicked: Dispatch<SetStateAction<number[]>>
    correct: number[]
}

type VoteIconProps = {
    style?: object
    color: string
}

export default function CourseContent({
    course,
    clicked,
    setClicked,
    cardID,
    displayCardID,
    showFooter = true,
}: CourseContentProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const height = Dimensions.get('window').height
    const [shuffledAlternatives, setShuffledAlternatives] = useState<string[]>([])
    const [indexMapping, setIndexMapping] = useState<number[]>([])
    const resolvedCardID = displayCardID ?? cardID
    const card = course.cards[resolvedCardID]
    const length = course.cards.length

    function handlePress(index: number) {
        if (!clicked.includes(index)) {
            setClicked([...clicked, index])
        }
    }

    function getBackground(index: number) {

        if (card?.correct.length > 1) {
            if (card?.correct.every((correct) => clicked.includes(correct))) {
                return card?.correct.includes(index) ? 'green' : clicked.includes(index) ? 'red' : theme.background
            } else {
                return clicked.includes(index) ? theme.darker : theme.background
            }
        }

        return clicked.includes(index)
            ? card?.correct.includes(index) ? 'green' : 'red'
            : theme.background
    }

    useEffect(() => {
        if (!card?.alternatives) {
            return
        }

        // Shuffles alternatives and creates map
        const shuffled = [...card.alternatives]
        const mapping = shuffled.map((_, index) => index)

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
            ;[mapping[i], mapping[j]] = [mapping[j], mapping[i]]
        }

        setShuffledAlternatives(shuffled)
        setIndexMapping(mapping)
    }, [card?.alternatives])

    return (
        <View style={{ padding: 12 }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={100}
                style={{ maxHeight: height * 0.7 }}
            >
                <Card
                    card={card}
                    cardID={resolvedCardID}
                    shuffledAlternatives={shuffledAlternatives}
                    indexMapping={indexMapping}
                    length={length}
                    handlePress={handlePress}
                    getBackground={getBackground}
                />
            </ScrollView>
            {showFooter ? (
                <CardFooter
                    votes={card?.votes.length}
                    clicked={clicked}
                    setClicked={setClicked}
                    correct={card?.correct}
                />
            ) : null}
        </View>
    )
}

function Card({ card, cardID, shuffledAlternatives, indexMapping, length, handlePress, getBackground }: CardProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const progressText = `${cardID + 1}${cardID >= (length - 5) ? ` / ${length}` : ''}`
    const modeText = card?.correct.length > 1
        ? (lang ? 'Flervalg' : 'Multiple choice')
        : card?.theme || (lang ? 'Kort' : 'Card')

    return (
        <>
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 10,
            }}>
                <View style={{ flexDirection: 'row', flex: 1, minWidth: 0 }}>
                    <View style={{
                        width: 3,
                        alignSelf: 'stretch',
                        borderRadius: 99,
                        backgroundColor: theme.orange,
                        marginRight: 10,
                        opacity: 0.55,
                    }} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{
                            ...T.text16,
                            color: theme.textColor,
                        }}>
                            {progressText}
                        </Text>
                        <Text style={{
                            ...T.text12,
                            color: theme.oppositeTextColor,
                            marginTop: 2,
                        }}>
                            {modeText}
                        </Text>
                    </View>
                </View>
                {card?.source ? (
                    <Text style={{
                        ...T.text12,
                        color: theme.oppositeTextColor,
                        marginLeft: 10,
                        maxWidth: '42%',
                        textAlign: 'right',
                    }}>
                        {card.source}
                    </Text>
                ) : null}
            </View>
            <Markdown text={card.question} />
            <View style={{ marginBottom: 30 }}>
                {shuffledAlternatives.map((answer, index) => {
                    const originalIndex = indexMapping[index]

                    return (
                        <TouchableOpacity
                            key={index}
                            style={{
                                flexDirection: 'row',
                                backgroundColor: getBackground(originalIndex),
                                marginTop: 8,
                                padding: 4,
                                borderRadius: 8,
                                paddingVertical: 8,
                                paddingRight: 30,
                            }}
                            onPress={() => handlePress(originalIndex)}
                        >
                            <Text style={{
                                color: theme.oppositeTextColor,
                                marginLeft: 2,
                                marginRight: 4,
                                ...T.text18,
                                width: 20
                            }}>
                                {index + 1}
                            </Text>
                            <Text style={{ color: theme.textColor, ...T.text18 }}>
                                {answer}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </>
    )
}

function CardFooter({ votes, clicked, setClicked, correct }: CardFooterProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const solved = correct?.every((current) => clicked.includes(current)) || 0
    const revealText = solved
        ? lang ? 'Skjul svar' : 'Hide answer'
        : lang ? 'Vis svar' : 'Show answer'

    function handleReveal() {
        if (solved) {
            setClicked([])
        } else {
            setClicked([...correct])
        }
    }

    return (
        <View style={{
            flexDirection: 'row',
            bottom: 0,
            position: 'absolute',
            justifyContent: 'space-between',
            alignSelf: 'center',
            height: 40,
            width: '100%',
            paddingTop: 10,
            paddingBottom: 5,
            backgroundColor: theme.contrast,
        }}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{
                    ...T.text18,
                    color: theme.oppositeTextColor,
                    top: 2,
                    marginRight: 2,
                    marginLeft: 5
                }}>
                    {votes}
                </Text>
                <ThumbsUp
                    style={{ width: 22, marginLeft: 4 }}
                    color={theme.oppositeTextColor}
                />
                <ThumbsDown
                    style={{ width: 22, marginLeft: 2 }}
                    color={theme.oppositeTextColor}
                />
            </View>
            <TouchableOpacity onPress={handleReveal}>
                <Text style={{
                    ...T.text18,
                    color: theme.oppositeTextColor,
                    top: 2,
                    marginRight: 5,
                }}>
                    {revealText}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

function ThumbsDown({ style, color }: VoteIconProps) {
    return (
        <View style={style}>
            <Svg viewBox='0 0 48 48'>
                <Path fill={color} d='M41,7h-4c-1.551,0-2.883,.896-3.546,2.188l-3.529-.785c-1.219-.268-2.458-.403-3.684-.403H12.281c-3.29,0-6.097,2.24-6.825,5.448l-2.281,10.001c-.473,2.088,.022,4.247,1.36,5.92,1.335,1.672,3.327,2.631,5.466,2.631h9.717l-1.287,9.012c-.307,2.195,.72,4.349,2.609,5.481,.544,.332,1.173,.507,1.82,.507,1.387,0,2.645-.818,3.204-2.084l4.291-9.643c.724-1.642,1.853-3.047,3.266-4.154,.708,1.125,1.953,1.88,3.379,1.88h4c2.206,0,4-1.794,4-4V11c0-2.206-1.794-4-4-4Zm-12.474,27.464l-4.291,9.642c-.354,.802-1.42,1.127-2.16,.677-1.206-.724-1.859-2.095-1.664-3.49l1.45-10.15c.041-.287-.045-.578-.234-.797-.19-.219-.466-.345-.756-.345H10.001c-1.526,0-2.949-.685-3.903-1.879-.956-1.196-1.31-2.738-.973-4.229l2.281-10c.521-2.292,2.524-3.892,4.875-3.892h13.96c1.081,0,2.177,.12,3.253,.356l3.506,.78V29c0,.024,.007,.046,.007,.07-1.972,1.362-3.518,3.213-4.481,5.394Zm14.474-5.464c0,1.103-.897,2-2,2h-4c-1.103,0-2-.897-2-2V11c0-1.103,.897-2,2-2h4c1.103,0,2,.897,2,2V29Z' />
            </Svg>
        </View>
    )
}

function ThumbsUp({ style, color }: VoteIconProps) {
    return (
        <View style={style}>
            <Svg viewBox='0 0 48 48'>
                <Path fill={color} d='M43.465,18.631c-1.335-1.672-3.328-2.631-5.466-2.631h-9.717l1.287-9.012c.307-2.195-.72-4.349-2.609-5.482-.543-.331-1.172-.506-1.821-.506-1.387,0-2.645,.819-3.204,2.083l-4.292,9.643c-.724,1.642-1.852,3.048-3.265,4.154-.709-1.125-1.953-1.881-3.379-1.881H7c-2.206,0-4,1.794-4,4v18c0,2.206,1.794,4,4,4h4c1.55,0,2.882-.895,3.546-2.188l3.529,.784c1.22,.268,2.459,.403,3.685,.403h13.96c3.29,0,6.096-2.24,6.825-5.447l2.28-10.001c.474-2.088-.022-4.246-1.359-5.92ZM13,37c0,1.103-.897,2-2,2H7c-1.103,0-2-.897-2-2V19c0-1.103,.897-2,2-2h4c1.103,0,2,.897,2,2v18Zm29.874-12.892l-2.28,10c-.521,2.291-2.525,3.892-4.875,3.892h-13.96c-1.081,0-2.177-.12-3.253-.356l-3.506-.78V19c0-.024-.007-.046-.007-.069,1.973-1.363,3.519-3.214,4.48-5.394L23.764,3.895c.355-.804,1.425-1.126,2.161-.677,1.207,.724,1.86,2.096,1.665,3.491l-1.45,10.15c-.041,.287,.044,.578,.234,.797,.19,.219,.465,.345,.755,.345h10.87c1.527,0,2.95,.685,3.903,1.879,.956,1.196,1.31,2.738,.972,4.229Z' />
            </Svg>
        </View>
    )
}
