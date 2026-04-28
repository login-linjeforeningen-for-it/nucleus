import NotificationModal from '@components/shared/notificationModal'
import T from '@styles/text'
import { useNavigation } from '@react-navigation/native'
import {
    StackCardInterpolatedStyle,
    StackCardInterpolationProps,
} from '@react-navigation/stack'
import { Text, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export const modalTransitionSpec = {
    animation: 'timing',
    config: {
        duration: 100,
    },
} as const

export function TagInfo() {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { tag } = useSelector((state: ReduxState) => state.event)
    const navigation = useNavigation()

    return (
        <TouchableOpacity
            style={{ flex: 1, justifyContent: 'flex-end' }}
            onPress={() => navigation.goBack()}
            activeOpacity={1}
        >
            <View
                style={{
                    backgroundColor: theme.dark,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                testID='TagInfo'
            >
                <Text style={{ ...T.text20, color: theme.textColor, marginTop: 5 }}>{tag.title}</Text>
                <Text style={{ ...T.text18, color: theme.textColor, margin: 5, marginHorizontal: 12 }}>{tag.body}</Text>
            </View>
            <View style={{ height: 20, backgroundColor: theme.dark }} />
        </TouchableOpacity>
    )
}

export { NotificationModal }

export function animateFromBottom({ current }: StackCardInterpolationProps): StackCardInterpolatedStyle {
    return ({
        cardStyle: {
            transform: [{
                translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0],
                    extrapolate: 'clamp',
                })
            }],
        },
        overlayStyle: {
            backgroundColor: 'black',
            opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
                extrapolate: 'clamp',
            })
        }
    })
}

export function animateFromTop({ current }: StackCardInterpolationProps): StackCardInterpolatedStyle {
    return ({
        cardStyle: {
            transform: [{
                translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-200, 0],
                    extrapolate: 'clamp',
                })
            }],
        },
        overlayStyle: {
            backgroundColor: 'black',
            opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
                extrapolate: 'clamp',
            })
        }
    })
}
