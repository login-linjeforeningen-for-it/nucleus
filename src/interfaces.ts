import type { DimensionValue, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native'
import type { JSX, ReactNode } from 'react'
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import type { StackHeaderProps, StackNavigationOptions } from '@react-navigation/stack'
import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'

export interface ExtendedBottomTabHeaderProps
    extends Omit<BottomTabHeaderProps, 'options'> {
    options: ExtendedRouteOptions
}

export interface ExtendedRouteOptions extends Omit<BottomTabNavigationOptions, 'header'> {
    focusedIcon: ImageSourcePropType
    icon: ImageSourcePropType
    themeIcon?: ImageSourcePropType
    header?: (props: ExtendedBottomTabHeaderProps) => ReactNode
}

export interface ScreenProps {
    navigation: Navigation
}

export interface StackProps extends ExtendedRouteOptions {
    name: string
    component: React.FC<any>
}

export interface ClusterProps extends React.PropsWithChildren<{}> {
    noColor?: boolean
    marginVertical?: DimensionValue
    marginHorizontal?: DimensionValue
    highlight?: boolean
    style?: StyleProp<ViewStyle>
}

export interface HeaderProps extends Omit<StackHeaderProps, 'options'> {
    options: StackRouteOptions & { headerComponents?: { bottom?: JSX.Element[], right?: JSX.Element[], left?: JSX.Element[] } }
}

export interface StackRouteOptions extends Omit<StackNavigationOptions, 'header'> {
    header?: (props: HeaderProps) => React.ReactNode
}
