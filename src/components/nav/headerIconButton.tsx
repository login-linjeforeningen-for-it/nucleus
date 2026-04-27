import { BlurView } from 'expo-blur'
import { JSX, ReactNode } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import Svg, { Path } from 'react-native-svg'

type HeaderIconButtonProps = {
    active?: boolean
    children: ReactNode
    connector?: boolean
    onPress: () => void
}

export default function HeaderIconButton({ active, children, connector, onPress }: HeaderIconButtonProps): JSX.Element {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)
    const overlayColor = active
        ? 'rgba(253,135,56,0.12)'
        : isDark
            ? 'rgba(255,255,255,0.07)'
            : theme.transparentAndroid
    const connectorColor = isDark ? 'rgba(255,255,255,0.07)' : theme.transparentAndroid
    const borderColor = active ? 'rgba(253,135,56,0.32)' : 'rgba(255,255,255,0.14)'
    const connectorBorderColor = 'rgba(255,255,255,0.14)'

    if (connector) {
        return (
            <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                overflow: 'visible',
            }}>
                <Pressable
                    onPress={onPress}
                    style={{
                        position: 'absolute',
                        left: -23,
                        top: 0,
                        width: 86,
                        height: 48,
                        alignItems: 'center',
                        zIndex: 12,
                        overflow: 'visible',
                    }}
                >
                    <Svg
                        width={86}
                        height={48}
                        viewBox='0 0 86 48'
                        style={StyleSheet.absoluteFill}
                    >
                        <Path
                            d='M43 0 C54 0 63 9 63 20 C63 28 67 39 86 48 L0 48 C19 39 23 28 23 20 C23 9 32 0 43 0 Z'
                            fill={connectorColor}
                        />
                        <Path
                            d='M43 0 C54 0 63 9 63 20 C63 28 67 39 86 48'
                            fill='none'
                            stroke={connectorBorderColor}
                            strokeWidth={1}
                        />
                        <Path
                            d='M0 48 C19 39 23 28 23 20 C23 9 32 0 43 0'
                            fill='none'
                            stroke={connectorBorderColor}
                            strokeWidth={1}
                        />
                    </Svg>
                    <View style={{
                        width: 40,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {children}
                    </View>
                </Pressable>
            </View>
        )
    }

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
                    backgroundColor: active
                        ? 'rgba(253,135,56,0.12)'
                        : pressed
                            ? 'rgba(255,255,255,0.10)'
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
                    backgroundColor: overlayColor,
                }} />
                {children}
                <View
                    pointerEvents='none'
                    style={{
                        ...StyleSheet.absoluteFill,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor,
                    }}
                />
            </Pressable>
        </View>
    )
}
