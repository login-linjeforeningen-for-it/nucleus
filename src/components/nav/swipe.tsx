import { useRef } from "react"
import { useNavigation } from "@react-navigation/native"
import {
    PanResponder,
    View,
    GestureResponderEvent,
    PanResponderGestureState
} from "react-native"

export default function Swipe({ children, left, right }: any) {
    const navigation = useNavigation()

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,

            onMoveShouldSetPanResponder: (_, gesture) => {
                const { dx, dy } = gesture

                const absX = Math.abs(dx)
                const absY = Math.abs(dy)

                return absX > absY
            },

            onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
                const { dx, dy, vx } = gesture

                const absX = Math.abs(dx)
                const absY = Math.abs(dy)

                if (absX > absY * 0.25) {
                    if (vx > 0.2 && left) {
                        navigation.navigate(left)
                    }

                    if (vx < -0.2 && right) {
                        navigation.navigate(right)
                    }
                }
            }
        })
    ).current

    return (
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
            {children}
        </View>
    )
}
