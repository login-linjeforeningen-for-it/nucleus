import { Dimensions, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import CardFooter from './footer'
import Card from './card'

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
