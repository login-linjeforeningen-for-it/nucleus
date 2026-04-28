import { Dispatch, SetStateAction, useState } from 'react'
import { scheduleOnRN } from 'react-native-worklets'

type GameList = Question[] | NeverHaveIEver[] | OkRedFlagDealBreaker[]
type CategorizedGame = Question | NeverHaveIEver | OkRedFlagDealBreaker

type NavState = {
    dataIndex: number
    uxIndex: number
}

type Options = {
    game: GameList
    mode: number
    school: boolean
    ntnu: boolean
}

export function useGameSwiperNavigation({ game, mode, school, ntnu }: Options) {
    const [nav, setNav] = useState<NavState>({
        dataIndex: 0,
        uxIndex: 1,
    })

    function navigate(direction: 'next' | 'prev') {
        setNav((prev) => {
            const isForward = direction === 'next'
            const nextIndex = resolveNextIndex({ game, mode, school, ntnu, currentIndex: prev.dataIndex, isForward })

            if (prev.uxIndex === 1 && !isForward) {
                return prev
            }

            if (!isForward) {
                return {
                    dataIndex: nextIndex,
                    uxIndex: Math.max(1, prev.uxIndex - 1),
                }
            }

            scheduleUxIncrement(setNav)
            return { ...prev, dataIndex: nextIndex }
        })
    }

    return { nav, navigate }
}

function resolveNextIndex({
    game,
    mode,
    school,
    ntnu,
    currentIndex,
    isForward,
}: Options & { currentIndex: number, isForward: boolean }) {
    if (!Object.hasOwn(game[0], 'categories')) {
        return isForward ? currentIndex + 1 : Math.max(0, currentIndex - 1)
    }

    const step = isForward ? 1 : -1
    let i = currentIndex + step
    const boundary = isForward ? game.length : -1

    while (i !== boundary) {
        const item = game[i] as CategorizedGame

        if (shouldSkipItem(item, { mode, school, ntnu })) {
            i += step
            continue
        }

        return i
    }

    return currentIndex
}

function shouldSkipItem(item: CategorizedGame, { mode, school, ntnu }: Pick<Options, 'mode' | 'school' | 'ntnu'>) {
    if (mode === 0 && item.categories.includes('Wild')) return true
    if (mode === 2 && !item.categories.includes('Wild')) return true
    if (!school && item.categories.includes('School')) return true
    if (!ntnu && item.categories.includes('NTNU')) return true

    return false
}

function scheduleUxIncrement(setNav: Dispatch<SetStateAction<NavState>>) {
    setTimeout(() => {
        scheduleOnRN(() => {
            setNav((prev) => ({
                ...prev,
                uxIndex: prev.uxIndex + 1,
            }))
        })
    }, 25)
}
