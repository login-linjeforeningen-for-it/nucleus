import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import Markdown from './markdown'
import { ThumbsDown, ThumbsUp } from './voteIcons'
import T from '@styles/text'

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
