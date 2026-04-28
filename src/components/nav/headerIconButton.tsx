import { BlurView } from 'expo-blur'
import { JSX, ReactNode } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

type HeaderIconButtonProps = {
    children: ReactNode
    onPress: () => void
}

export default function HeaderIconButton({ children, onPress }: HeaderIconButtonProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'visible',
        }}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => ({
                    position: 'relative',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 19,
                    backgroundColor: pressed
                        ? theme.glassButtonPressed
                        : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    margin: 0,
                    paddingTop: 0,
                })}
            >
                <BlurView
                    style={{
                        ...StyleSheet.absoluteFill,
                        borderRadius: 19,
                    }}
                    blurMethod='dimezisBlurView'
                    intensity={Platform.OS === 'ios' ? 35 : 24}
                />
                <View style={{
                    ...StyleSheet.absoluteFill,
                    backgroundColor: theme.greyTransparent,
                }} />
                {children}
                <View
                    pointerEvents='none'
                    style={{
                        ...StyleSheet.absoluteFill,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: theme.greyTransparentBorder,
                    }}
                />
            </Pressable>
        </View>
    )
}
