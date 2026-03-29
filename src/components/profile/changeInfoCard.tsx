import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import { useDispatch, useSelector } from "react-redux"
import PS from "@styles/profileStyles"
import { Line } from "@/components/shared/utils"
import { useEffect, useState } from "react"
import T from "@styles/text"

import {
    TouchableOpacity,
    Dimensions,
    TextInput,
    Keyboard,
    View,
    Text
} from "react-native"

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated"

import {
    setAllergies,
    setPreferences,
    setMail,
    setSchoolyear,
    setDegree
} from "@redux/profile"
import { scheduleOnRN } from 'react-native-worklets'

type ChangeInfoCardProps = {
    type: string
    value: number
    hide: () => void
    trigger: boolean
}

type SaveProps = {
    edited: boolean
    save: () => void
}

type CancelProps = {
    tryToHide: () => void
}

/**
 * Function for drawing a very small square of the category of the event
 *
 * @param {string} category    Category of the event, Format: "CATEGORY"
 * @returns                     Small circle of the categories color
 */
export default function ChangeInfoCard({type, value, hide, trigger}: 
ChangeInfoCardProps) {

    const { theme } = useSelector((state: ReduxState) => state.theme)

    // Dispatch to change Redux states
    const dispatch = useDispatch()

    // Profile info
    const { degree, schoolyear, mail, preferences, allergies } = 
        useSelector((state: ReduxState) => state.profile)
    const profile = { degree, schoolyear, mail, preferences, allergies }

    // Checks if any info has been edited by the user
    const [edited, setEdited] = useState(false)
    const [text, setText] = useState("")

    // Dimensions of the screen window
    const height = Dimensions.get("window").height
    const width = Dimensions.get("window").width

    // Shared value for reanimated library
    const translateY = useSharedValue(height)
    const startY = useSharedValue(0)

    // Trigger for slideUp animation
    const [shouldTrigger, setShouldTrigger] = useState(trigger)

    // Tries to hide the component, checks to avoid double calls
    const [hiding, setHiding] = useState(false)
    function tryToHide() {
        if (!hiding) {
            setHiding(true)
            scheduleOnRN(() => hide())
        }
    }

    // Starts increasing value when swiping starts
    const panGesture = Gesture.Pan()
    .onBegin(() => {
        // replaces onStart
        startY.value = translateY.value;
    })
    .onUpdate((event) => {
        // replaces onActive
        translateY.value = startY.value + event.translationY;
    })
    .onEnd((event) => {
        if (event.velocityY > height / 2) {
        translateY.value = withTiming(height);

        // new API
        scheduleOnRN(Keyboard.dismiss);
        } else {
        translateY.value = withTiming(0);
        }
    });

    // Animates the sliding
    const animation = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        }
    })

    // Slides the card up from the bottom
    function slideUp() {
        translateY.value = withTiming(0)
    }

    // Checks if it has slid up yet, and slides it up if not
    if (shouldTrigger === true) {
        slideUp()
        setShouldTrigger(false)
    }

    useEffect(() => {
        // Add listener
        const keyboardListener = Keyboard.addListener("keyboardDidHide", 
            _keyboardDidHide)

        // Cleanup function
        return () => {
            keyboardListener.remove()
        }
    }, [])

    // Checks if the keyboard did hide, and if so closes the component
    function _keyboardDidHide() {
        translateY.value = withTiming(height)
        tryToHide()
    }

    function checkChange () {
        if (Object.values(profile)[value] != text && text.length > 0) {
            setEdited(true)
        } else {
            setEdited(false)
        }
    }

    function handleText(val: string) {
        setText(val)
        checkChange()
    }

    function save() {
        switch (value) {
            case 0: dispatch(setDegree(text));       break
            case 1: dispatch(setSchoolyear(text));   break
            case 2: dispatch(setMail(text));         break
            case 3: dispatch(setPreferences(text));  break
            case 4: dispatch(setAllergies(text));    break
        }
    }

    function findBestPlaceHolder() {
        switch (value) {
            case 0: return (profile.degree      ? profile.degree      : type)
            case 1: return (profile.schoolyear  ? profile.schoolyear  : type)
            case 2: return (profile.mail        ? profile.mail        : type)
            case 3: return (profile.preferences ? profile.preferences : type)
            case 4: return (profile.allergies   ? profile.allergies   : type)
        }
    }

    // Returns the visual card component
    return (
        <GestureHandlerRootView>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[
                    PS.animatedCard, animation,
                    {backgroundColor: theme.darker}
                ]}>
                    <View style={{...PS.animatedView, backgroundColor: theme.darker}}>
                        <TextInput style={{...PS.inputText, color: theme.textColor}}
                            placeholder = {findBestPlaceHolder()}
                            placeholderTextColor={theme.titleTextColor}
                            textAlign="center"
                            keyboardType={value === 1
                                ? "numeric"
                                : value === 2
                                    ? "email-address"
                                    : "default"
                            }
                            onChangeText={(val) => handleText(val)}
                            autoFocus={true}
                            selectionColor={theme.orange}
                        />
                        <View style={PS.inputInfoView}>
                            <Cancel tryToHide={tryToHide} />
                            <Text style={{
                                ...T.centered15, 
                                color: theme.oppositeTextColor
                            }}>
                                {type}
                            </Text>
                            <Save edited={edited} save={save} />
                        </View>
                        <View style={[PS.centeredLine, {top: 20}]}>
                            <Line 
                                height={2} 
                                width={width*(2/3)} 
                                fill={theme.oppositeTextColor} 
                            />
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    )
}

function Save({edited, save}: SaveProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)

    if (edited) {
        return (
            <TouchableOpacity style={{right: 20}} onPress={() => save()}>
            <Text style={{...T.centered15, color: theme.textColor}}>
                {lang ? "Lagre" : "Save"}
            </Text>
        </TouchableOpacity>
        )
    } else {
        return (
            <Text style={{
                ...T.centered15, 
                right: 20, 
                color: theme.oppositeTextColor
            }}>
                {lang ? "Lagre" : "Save"}
            </Text>
        )
    }
}

function Cancel({tryToHide}: CancelProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <TouchableOpacity style={{left: 20}} onPress={() => tryToHide()}>
            <Text style={{...T.centered15, color: theme.textColor}}>
                {lang ? "Avbryt" : "Cancel"}
            </Text>
        </TouchableOpacity>
    )
}