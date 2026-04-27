import { createContext, ReactNode, useContext, useMemo, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import {
    PanResponder,
    Platform,
    View,
    GestureResponderEvent,
    PanResponderGestureState
} from 'react-native'

type SwipeProps = {
    children: ReactNode
    left?: string
    right?: string
}

type SwipeNavigationLock = {
    lock: () => void
    unlock: () => void
}

const SwipeNavigationLockContext = createContext<SwipeNavigationLock>({
    lock: () => undefined,
    unlock: () => undefined,
})

export function useSwipeNavigationLock() {
    return useContext(SwipeNavigationLockContext)
}

const SWIPE_VELOCITY_THRESHOLD = Platform.OS === 'ios' ? 0.2 : 0.32
const SWIPE_DIRECTION_RATIO = Platform.OS === 'ios' ? 0.25 : 0.45

export default function Swipe({ children, left, right }: SwipeProps) {
    const navigation = useNavigation()
    const nestedHorizontalGestureCount = useRef(0)
    const swipeLock = useMemo(() => ({
        lock: () => {
            nestedHorizontalGestureCount.current += 1
        },
        unlock: () => {
            nestedHorizontalGestureCount.current = Math.max(0, nestedHorizontalGestureCount.current - 1)
        },
    }), [])

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,

            onMoveShouldSetPanResponder: (_, gesture) => {
                if (nestedHorizontalGestureCount.current > 0) {
                    return false
                }

                const { dx, dy } = gesture

                const absX = Math.abs(dx)
                const absY = Math.abs(dy)

                return absX > absY
            },

            onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
                const { dx, dy, vx } = gesture

                const absX = Math.abs(dx)
                const absY = Math.abs(dy)

                if (absX > absY * SWIPE_DIRECTION_RATIO) {
                    if (vx > SWIPE_VELOCITY_THRESHOLD && left) {
                        navigation.navigate(left as never)
                    }

                    if (vx < -SWIPE_VELOCITY_THRESHOLD && right) {
                        navigation.navigate(right as never)
                    }
                }
            }
        })
    ).current

    return (
        <SwipeNavigationLockContext.Provider value={swipeLock}>
            <View style={{ flex: 1 }} {...panResponder.panHandlers}>
                {children}
            </View>
        </SwipeNavigationLockContext.Provider>
    )
}
