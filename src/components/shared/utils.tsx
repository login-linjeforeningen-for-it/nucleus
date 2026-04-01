import { useSelector } from "react-redux"
import { View, Text } from "react-native"
import ES from "@styles/eventStyles"
import T from "@styles/text"
import { JSX, ReactNode } from "react"
import GS from '@styles/globalStyles'
import { Animated, Pressable } from "react-native"
import { useRef } from "react"

// Ony children or height can be defined at the same time. Both cant be arguments at the same time
type LineProps = {
    children: ReactNode
    width: number
    height?: never
    fill?: string
} |
{
    children?: never
    width: number
    height: number
    fill?: string
}

type randomProps = {
    min: number
    max: number
}

type MonthProps = {
    month: number
    color: string
}

type SpaceProps = {
    height: number
}

type ErrorMessageProps = {
    argument: "wifi" | "nomatch"
    screen: "event" | "ad"
}

/**
 * Function for creating an empty view, for adding spaces between objects such 
 * as views paragraphs etc
 *
 * @param {float} height How big the space should be
 * @returns Empty view of the given height
 */
export default function Space({ height }: SpaceProps): JSX.Element {
    return <View style={{ height: height }} />
}

/**
 * Function for drawing a dynamic line, can be adjusted as you wish using 
 * the height and width
 *
 * @param width Width of the line
 * @param height The height of the line if children is undefined
 * @param fill Color of the line
 * @param children The content that should have a line to the right
 * @returns View of the given size based on theme
 */
export function Line({ width, fill, children, height }: LineProps): JSX.Element {

    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            borderLeftWidth: width,
            borderColor: fill ? fill : theme.orange,
            height: height ? height : 'auto'
        }}>
            {children}
        </View>
    )
}

/**
 * Returns a random number between min and max
 *
 * @param {number} min Lowest acceptable integer
 * @param {number} max Highest acceptable integer
 * @returns
 */
export function random({ min, max }: randomProps): number {
    return Math.floor(Math.random() * (max - min)) + min
}

/**
 * Displays an error message to the user
 *
 * @param {string} argument  Error text to display
 * @param {number} theme     Users theme
 * @param {number} lang      Users language
 *
 * @returns {JSX.Element} Error message
 */
export function ErrorMessage({ argument, screen }: ErrorMessageProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const eventScreen = ["Ingen arrangementer", "No events"]
    const adsScreen = ["Ingen jobbannonser", "No matching jobs"]
    const error = screen === "event" ? eventScreen : adsScreen

    const text = {
        "wifi": lang
            ? "Sjekk nettverkstilkoblingen din og prøv igjen. Kontakt TEKKOM dersom problemet vedvarer."
            : "Check your wifi connection and try again. Contact TEKKOM if the issue persists.",
        "nomatch": lang ? error[0] : error[1]
    }

    const scale = useRef(new Animated.Value(1)).current

    function handlePress() {
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 1.1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true
            })
        ]).start()
    }

    return (
        <View style={{ alignSelf: "center", justifyContent: "center", display: "flex", flex: 1 }}>
            <Pressable onPress={handlePress}>
                <Animated.Text style={{ 
                    ...T.centered20, 
                    fontWeight: 600, 
                    color: theme.textColor, 
                    marginBottom: 50 ,
                    transform: [{ scale }]
                }}>
                    {text[argument]}
                </Animated.Text>
                <Animated.Image
                    style={[
                        GS.errorImage,
                        {
                            transform: [{ scale }],
                        },
                    ]}
                    source={require("../../../public/assets/icons/404.jpg")}
                />
            </Pressable>
        </View>
    )
}

/**
 * @param month    Month of the event
 * @param color    Hex color for the text based on theme
 * @returns
 */
export function Month({ month, color }: MonthProps): JSX.Element {
    const { lang } = useSelector((state: ReduxState) => state.lang)

    const monthsEN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Des"]
    const monthsNO = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun",
        "Jul", "Aug", "Sep", "Okt", "Nov", "Des"]

    return <Text style={{ ...ES.monthText, color: color }}>
        {lang ? monthsNO[month] : monthsEN[month]}
    </Text>
}
