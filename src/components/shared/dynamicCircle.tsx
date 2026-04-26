import Svg, { Circle } from 'react-native-svg'
import { DimensionValue } from 'react-native'
import { View } from 'react-native'
import { JSX } from 'react'

type DynamicCircleProps = {
    height: DimensionValue
    width: DimensionValue
    color: string
    left: DimensionValue
    right: DimensionValue
    top: DimensionValue
    bottom: DimensionValue
}

/**
 * Customizable circle where you can choose size color and placement as you wish
 *
 * @param { number } height   Height of the circle
 * @param { number } width    Width of the cirle
 * @param { hex    } color    Color of the circle
 * @param { number } left     Distance from the left
 * @param { number } right    Distance from the right
 * @param { number } top      Distance from top
 * @param { number } bottom   Distance from bottom
 *
 * @returns                 Circle with the properties given
 */
export default function DynamicCircle({ height, width, color, left, right, top,
    bottom }: DynamicCircleProps): JSX.Element {
    return (
        <View style={{
            left: left,
            right: right,
            top: top,
            bottom: bottom,
            height: height,
            width: width
        }}>
            <Svg height='100%' width='100%' viewBox='0 0 100 100' >
                <Circle cx='50' cy='50' r='50' fill={color} />
            </Svg>
        </View>
    )
}
