import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'
import Svg, { Circle, G, Path, Rect } from 'react-native-svg'
import { getBannerStyle } from './defaultBannerColors'

type DefaultBannerProps = {
    category: string | null | undefined
    color?: string | null
    height?: number
    borderRadius?: number
}

export default function DefaultBanner({
    category,
    color,
    height = 170,
    borderRadius = 18,
}: DefaultBannerProps) {
    const normalized = category?.toLowerCase() || ''
    const style = getBannerStyle(color || undefined)

    let content = <EventBanner fill={style.fill} />

    if (normalized === 'sosialt' || normalized === 'social' || normalized === 'evntkom') {
        content = <SocialBanner fill={style.fill} />
    } else if (normalized === 'tekkom') {
        content = <TekkomBanner fill={style.fill} />
    } else if (normalized === 'ctf') {
        content = <CtfBanner fill={style.fill} />
    } else if (normalized === 'bedkom' || normalized === 'bedpres') {
        content = <BedpresBanner fill={style.fill} />
    }

    return (
        <BannerFrame colors={style.colors} borderRadius={borderRadius} height={height}>
            <View style={{ width: '100%', height: '100%' }}>
                {content}
            </View>
        </BannerFrame>
    )
}

function BannerFrame({
    colors,
    borderRadius,
    height,
    children,
}: React.PropsWithChildren<{ colors: readonly [string, string], borderRadius: number, height: number }>) {
    return (
        <LinearGradient
            colors={[colors[0], colors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                width: '100%',
                height,
                borderRadius,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {children}
        </LinearGradient>
    )
}

function TekkomBanner({ fill }: { fill: string }) {
    return (
        <Svg width='100%' height='100%' viewBox='0 0 500 200'>
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M225 75.0505L230.271 80.3219L210.543 100.051L230.271 119.779L225 125.051L200 100.051L225 75.0505Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M236.045 128.638L256.919 69L263.955 71.4627L243.081 131.101L236.045 128.638Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M289.457 100.051L269.729 80.3219L275 75.0505L300 100.051L275 125.051L269.729 119.779L289.457 100.051Z' />
        </Svg>
    )
}

function CtfBanner({ fill }: { fill: string }) {
    return (
        <Svg width='100%' height='100%' viewBox='0 0 500 200'>
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M209.755 64H251.845L260.245 106H218.155L209.755 64ZM215.245 68.5L221.845 101.5H254.755L248.155 68.5H215.245Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M245.755 101.5L247.794 111.691L248.155 113.5H250H287.5H290.245L289.706 110.809L282.206 73.3087L281.845 71.5H280H249.114L250.034 76H278.155L284.755 109H251.845L250.345 101.5H245.755Z' />
            <Path fill={fill} d='M211 59.5H214L230.5 149.5H227.5L211 59.5Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M208.3 57.25H215.875L233.2 151.75H225.625L208.3 57.25Z' />
            <Path fill={fill} d='M211.75 59.5C214.235 59.5 216.25 57.4854 216.25 55C216.25 52.5146 214.235 50.5 211.75 50.5C209.265 50.5 207.25 52.5146 207.25 55C207.25 57.4854 209.265 59.5 211.75 59.5Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M205 55C205 51.272 208.022 48.25 211.75 48.25C215.478 48.25 218.5 51.272 218.5 55C218.5 58.728 215.478 61.75 211.75 61.75C208.022 61.75 205 58.728 205 55ZM211.75 52.75C210.507 52.75 209.5 53.7573 209.5 55C209.5 56.2427 210.507 57.25 211.75 57.25C212.993 57.25 214 56.2427 214 55C214 53.7573 212.993 52.75 211.75 52.75Z' />
        </Svg>
    )
}

function SocialBanner({ fill }: { fill: string }) {
    return (
        <Svg width='100%' height='100%' viewBox='0 0 500 200'>
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M242.5 64.75C223.032 64.75 207.25 80.532 207.25 100C207.25 119.468 223.032 135.25 242.5 135.25C261.968 135.25 277.75 119.468 277.75 100C277.75 80.532 261.968 64.75 242.5 64.75ZM202.75 100C202.75 78.0467 220.547 60.25 242.5 60.25C264.453 60.25 282.25 78.0467 282.25 100C282.25 121.953 264.453 139.75 242.5 139.75C220.547 139.75 202.75 121.953 202.75 100Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M240.25 62.5V47.5H244.75V62.5H240.25Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M250 49.75H235V45.25H250V49.75Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M242.5 64.75C233.151 64.75 224.185 68.4638 217.574 75.0745C210.964 81.6851 207.25 90.6511 207.25 100C207.25 109.349 210.964 118.315 217.574 124.926C224.185 131.536 233.151 135.25 242.5 135.25V139.75C231.958 139.75 221.847 135.562 214.393 128.108C206.938 120.653 202.75 110.542 202.75 100C202.75 89.4576 206.938 79.3471 214.393 71.8925C221.847 64.4379 231.958 60.25 242.5 60.25V64.75Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M242.5 64.75C238.566 64.75 234.204 67.7979 230.708 74.5215C227.255 81.1622 225.25 90.3257 225.25 100C225.25 109.674 227.255 118.838 230.708 125.478C234.204 132.202 238.566 135.25 242.5 135.25V139.75C236.091 139.75 230.533 134.896 226.715 127.555C222.854 120.13 220.75 110.217 220.75 100C220.75 89.7831 222.854 79.8701 226.715 72.4455C230.533 65.1038 236.091 60.25 242.5 60.25V64.75Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M240.25 137.5V62.5H244.75V137.5H240.25Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M254.292 74.5215C250.796 67.7979 246.434 64.75 242.5 64.75V60.25C248.909 60.25 254.467 65.1038 258.285 72.4455C262.146 79.8701 264.25 89.7831 264.25 100C264.25 110.217 262.146 120.13 258.285 127.555C254.467 134.896 248.909 139.75 242.5 139.75V135.25C246.434 135.25 250.796 132.202 254.292 125.478C257.745 118.838 259.75 109.674 259.75 100C259.75 90.3257 257.745 81.1622 254.292 74.5215Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M280 102.25H205V97.75H280V102.25Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M277 85.75H208V81.25H277V85.75Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M277 118.75H208V114.25H277V118.75Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M291.25 57.416L295.835 72.2643L302.068 76.7503L295.835 81.2362L291.25 96.0846L286.665 81.2363L280.432 76.7503L286.665 72.2643L291.25 57.416ZM291.25 67.5846L289.235 74.1112L285.568 76.7503L289.235 79.3893L291.25 85.916L293.265 79.3893L296.932 76.7503L293.265 74.1112L291.25 67.5846Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M277.75 125.079L281.724 137.496L287.13 141.25L281.724 145.005L277.75 157.422L273.776 145.005L268.37 141.25L273.776 137.496L277.75 125.079ZM277.75 134.922L276.324 139.38L273.63 141.25L276.324 143.121L277.75 147.579L279.176 143.121L281.87 141.25L279.176 139.38L277.75 134.922Z' />
        </Svg>
    )
}

function BedpresBanner({ fill }: { fill: string }) {
    return (
        <Svg width='100%' height='100%' viewBox='0 0 500 200'>
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M220.342 134.071L235.342 125.071L237.658 128.93L222.658 137.93L220.342 134.071Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M210.673 84.5801L237.673 101.08L235.327 104.92L208.327 88.4198L210.673 84.5801Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M240.135 60.2886L250.635 91.7886L246.365 93.2116L235.865 61.7116L240.135 60.2886Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M289.389 71.2222L272.889 96.7222L269.111 94.2776L285.611 68.7776L289.389 71.2222Z' />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M284.536 139.208L274.036 130.208L276.964 126.792L287.464 135.792L284.536 139.208Z' />
            <Circle cx='212.5' cy='142' r='9' stroke={fill} strokeWidth='4.5' fill='none' />
            <Circle cx='203.5' cy='82' r='9' stroke={fill} strokeWidth='4.5' fill='none' />
            <Circle cx='235' cy='52' r='9' stroke={fill} strokeWidth='4.5' fill='none' />
            <Circle cx='292' cy='62.5' r='9' stroke={fill} strokeWidth='4.5' fill='none' />
            <Circle cx='292' cy='142' r='9' stroke={fill} strokeWidth='4.5' fill='none' />
            <Circle cx='257.5' cy='115' r='22.75' stroke={fill} strokeWidth='4.5' fill='none' />
            <Circle cx='257.5' cy='109' r='7.25' fill={fill} />
            <Path fill={fill} fillRule='evenodd' clipRule='evenodd' d='M268.043 123.35C271.005 125.227 273.179 128.213 273.179 132.25V134.144L257.938 136.783L242.5 134.149V132.25C242.5 128.213 244.674 125.227 247.636 123.35C250.535 121.512 254.254 120.667 257.839 120.667C261.425 120.667 265.144 121.512 268.043 123.35Z' />
        </Svg>
    )
}

function EventBanner({ fill }: { fill: string }) {
    return (
        <Svg width='100%' height='100%' viewBox='0 0 500 200'>
            <Rect width='500' height='200' fill='transparent' />
            <G>
                <Path fill={fill} d='M200 50H206.667V78.3333H200V50Z' />
                <Path fill={fill} d='M228.333 50V56.6667H200V50H228.333Z' />
                <Path fill={fill} d='M300 50V56.6667H271.667V50H300Z' />
                <Path fill={fill} d='M300 78.3333H293.333V50H300V78.3333Z' />
                <Path fill={fill} d='M200 150V143.333H228.333V150H200Z' />
                <Path fill={fill} d='M200 121.667H206.667V150H200V121.667Z' />
                <Path fill={fill} d='M300 150H293.333V121.667H300V150Z' />
                <Path fill={fill} d='M271.667 150V143.333H300V150H271.667Z' />
                <Path fill={fill} d='M231.667 68.3333H243.333V131.667H231.667V68.3333Z' />
                <Path fill={fill} d='M231.667 120H268.333V131.667H231.667V120Z' />
            </G>
        </Svg>
    )
}
