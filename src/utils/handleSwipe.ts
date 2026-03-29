import { Navigation } from "@/interfaces"

type HandleSwipeProps = {
    navigation: Navigation
    event: {
        velocityX: number
        velocityY: number
    }
    screenLeft?: string
    screenRight?: string
}


/**
 * Handles horizontal swipes on all screens, and navigates to the corresponding
 * screen if any exist.
 * 
 * @param navigation Navigation object 
 * @param event Gesture event from the gesture handler 
 * @param screenLeft The screen to the left of where you are (if any)
 * @param screenRight The screen to the right of where you are (if any)
 */
export default function handleSwipe({
    navigation,
    event,
    screenLeft,
    screenRight,
}: HandleSwipeProps): void {
    const { velocityX, velocityY } = event

    if (Math.abs(velocityX) > Math.abs(velocityY)) {
        if (velocityX > 600 && screenLeft) {
            navigation.navigate(screenLeft)
        }

        if (velocityX < -600 && screenRight) {
            navigation.navigate(screenRight)
        }
    }
}
