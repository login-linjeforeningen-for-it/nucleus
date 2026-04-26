import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import * as ImagePicker from 'expo-image-picker'
import PS from '@styles/profileStyles'
import { setImage } from '@redux/profile'
import { JSX, useState } from 'react'
import T from '@styles/text'

import {
    TouchableOpacity,
    Dimensions,
    Image,
    View,
    Text,
} from 'react-native'

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

type ChangeProfileCardProps = {
    hide: () => void
    trigger: boolean
}
/**
 * Function for drawing a very small square of the category of the event
 *
 * @param {string} category    Category of the event, Format: "CATEGORY"
 * @returns                     Small circle of the categories color
 */
export default function ChangeProfileCard({ trigger }:
ChangeProfileCardProps): JSX.Element {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)

    // Dispatch to change Redux states
    const dispatch = useDispatch()

    // Profile info
    const { image } = useSelector((state: ReduxState) => state.profile)

    // Selected local profile image
    const [tempImage, setTempImage] = useState('')

    // Height of the screen window
    const windowHeight = Dimensions.get('window').height

    // Shared value for reanimated library
    const translateY = useSharedValue(windowHeight)
    const startY = useSharedValue(0)

    // Trigger for slideUp animation
    const [shouldTrigger, setShouldTrigger] = useState(trigger)

    // Starts increasing value when swiping starts
    const panGesture = Gesture.Pan()
        .onBegin(() => {
            startY.value = translateY.value
        })
        .onUpdate((event) => {
            translateY.value = startY.value + event.translationY
        })
        .onEnd((event) => {
            if (event.velocityY > windowHeight / 3) {
                translateY.value = withTiming(windowHeight)
            } else {
                translateY.value = withTiming(0)
            }
        })

    // Animates the sliding
    const animation = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        }
    })

    // Slides the card up from the bottom
    function slideUp() {
        translateY.value = withTiming(windowHeight / 3.6)
    }

    // Checks if it has slid up yet, and slides it up if not
    if (shouldTrigger === true) {
        slideUp()
        setShouldTrigger(false)
    }

    async function selectImage() {
        // No permissions request is necessary for launching the image library
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.canceled) {
            setTempImage(result.assets[0].uri)
            dispatch(setImage(result.assets[0].uri))
        }
    }

    // Returns the visual card component
    return (
        <GestureHandlerRootView>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[PS.animatedProfileChangeCard, animation,
                    { backgroundColor: theme.darker }]}>
                    <View style={[PS.animatedView, {
                        backgroundColor:
                            theme.darker
                    }]}>
                        <TouchableOpacity onPress={selectImage}>
                            <Image
                                style={PS.bigProfileImage}
                                source={tempImage || image
                                    ? { uri: tempImage ? tempImage : image }
                                    : isDark
                                        ? require('@assets/icons/loginperson-white.png')
                                        : require('@assets/icons/loginperson-black.png')}
                            />
                            <Text style={{ ...T.centered15, color: theme.oppositeTextColor }}>
                                {lang ? 'Velg bilde' : 'Choose image'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    )
}
