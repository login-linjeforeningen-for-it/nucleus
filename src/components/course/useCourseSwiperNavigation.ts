import { Dispatch, SetStateAction, useState } from 'react'

export function useCourseSwiperNavigation(cardCount: number, setClicked: Dispatch<SetStateAction<number[]>>) {
    const [cardID, setCardID] = useState<number>(0)

    function resetAndSetCard(nextCardID: number) {
        setClicked([])
        setCardID(nextCardID)
    }

    function handlePrevious() {
        resetAndSetCard(cardID - 1 >= 0 ? cardID - 1 : cardID)
    }

    function handleNext() {
        resetAndSetCard(cardID + 1 < cardCount ? cardID + 1 : cardID)
    }

    return { cardID, setCardID, handleNext, handlePrevious }
}
