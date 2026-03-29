import handleSwipe from "@utils/handleSwipe"
import { Navigation } from "@/interfaces"
import { useNavigation } from "@react-navigation/native"
import { ReactNode } from "react"
import { View } from "react-native"
import { scheduleOnRN } from 'react-native-worklets'
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView
} from "react-native-gesture-handler"

type SwipeProps = {
    children?: ReactNode
    left?: string
    right?: string
}

export default function Swipe({ children, left, right }: SwipeProps) {
    const navigation: Navigation = useNavigation()

    const panGesture = Gesture.Pan()
        .onEnd((event) => {
            scheduleOnRN(handleSwipe, {
                navigation,
                event,
                screenLeft: left,
                screenRight: right
            })
        })

    return (
        <GestureHandlerRootView>
            <GestureDetector gesture={panGesture}>
                <View>{children}</View>
            </GestureDetector>
        </GestureHandlerRootView>
    )
}
