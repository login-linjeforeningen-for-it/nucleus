import { useEffect, useRef, useState } from 'react'
import { View, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native'
import { useSelector } from 'react-redux'

type DotsProps = {
    amount: number
}

type Positions = {
    [key: number]: { top: string, left: string }[]
}

export default function DiceScreen() {
    const width = Dimensions.get('window').width * 0.6;
    const rotateAnimation = useRef(new Animated.Value(0)).current
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [isAnimating, setIsAnimating] = useState(false)
    const [diceValue, setDiceValue] = useState(4)
    const [direction, setDirection] = useState(1)
    const [duration, setDuration] = useState(75)
    const [steps, setSteps] = useState(5)

    const spin = rotateAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: direction ? ['0deg', '360deg'] : ['360deg', '0deg'],
    })

    function handlePress() {
        setIsAnimating(true)
        setDirection(Math.floor(Math.random() * 2))
        setDuration(Math.floor(Math.random() * 25) + 175)
        setSteps(Math.floor(Math.random() * 2) + 3)
    }

    // Rotates the dice
    useEffect(() => {
        if (isAnimating) {
            const animations = Array.from({ length: steps }, (_, i) =>
                Animated.timing(rotateAnimation, {
                    toValue: (i + 1) / steps,
                    duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            )

            Animated.sequence(animations).start(() => {
                setIsAnimating(false)
                rotateAnimation.setValue(0)
                setDiceValue(Math.floor(Math.random() * 6) + 1)
            })

            const valueChangeInterval = setInterval(() => {
                const newValue = Math.floor(Math.random() * 6) + 1
                setDiceValue(newValue)
            }, duration)

            setTimeout(() => clearInterval(valueChangeInterval), steps * duration)
        }
    }, [isAnimating, rotateAnimation])

    return (
        <View style={{
            backgroundColor: theme.background,
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <TouchableOpacity onPress={handlePress} style={{
                width: width,
                height: width,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
                    <View style={{
                        backgroundColor: theme.textColor,
                        width: width,
                        height: width,
                        borderRadius: 30,
                    }}>
                        <DiceDots amount={diceValue} />
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </View>
    )
}

function DiceDots({ amount }: DotsProps) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const dotSize = 50
    const positions: Positions = {
        1: [
            { top: '50%', left: '50%' }
        ],
        2: [
            { top: '20%', left: '25%' }, { top: '80%', left: '75%' }
        ],
        3: [
            { top: '20%', left: '25%' }, { top: '50%', left: '50%' },
            { top: '80%', left: '75%' }
        ],
        4: [
            { top: '20%', left: '25%' }, { top: '20%', left: '75%' },
            { top: '80%', left: '25%' }, { top: '80%', left: '75%' }
        ],
        5: [
            { top: '20%', left: '25%' }, { top: '20%', left: '75%' },
            { top: '50%', left: '50%' }, { top: '80%', left: '25%' },
            { top: '80%', left: '75%' }
        ],
        6: [
            { top: '20%', left: '25%' }, { top: '50%', left: '25%' },
            { top: '80%', left: '25%' }, { top: '20%', left: '75%' },
            { top: '50%', left: '75%' }, { top: '80%', left: '75%' }
        ],
    }

    const dotStyle = {
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: theme.background,
        position: 'absolute',
        transform: [{ translateX: -dotSize / 2 }, { translateY: -dotSize / 2 }],
    }

    return (
        <View style={{ width: '100%', height: '100%' }}>
            {positions[amount].map((pos, index) => (
                // @ts-expect-error
                <View key={index} style={[dotStyle, { top: pos.top, left: pos.left, position: 'absolute' }]} />
            ))}
        </View>
    )
}
