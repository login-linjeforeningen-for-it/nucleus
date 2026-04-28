import { Text, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import Markdown from './markdown'
import T from '@styles/text'

type CardProps = {
    card: Card,
    shuffledAlternatives: string[],
    indexMapping: number[],
    handlePress: (index: number) => void,
    getBackground: (index: number) => string
    cardID: number
    length: number
}

export default function CourseCard({
    card,
    cardID,
    shuffledAlternatives,
    indexMapping,
    length,
    handlePress,
    getBackground,
}: CardProps) {
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
