import { Dispatch, SetStateAction } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import { ThumbsDown, ThumbsUp } from './voteIcons'

type CardFooterProps = {
    votes: number,
    clicked: number[],
    setClicked: Dispatch<SetStateAction<number[]>>
    correct: number[]
}

export default function CardFooter({ votes, clicked, setClicked, correct }: CardFooterProps) {
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
