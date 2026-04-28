import GS from '@styles/globalStyles'
import { getCategories, getHeight } from '@utils/general'
import { BlurView } from 'expo-blur'
import { PropsWithChildren } from 'react'
import { Dimensions, Image, Platform, StatusBar, StyleSheet, View } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'

const GAME_IMAGE_STYLES = StyleSheet.create({
    terning: {
        width: 200,
        height: 200,
        top: 100,
        left: '25%',
        resizeMode: 'contain',
    },
    questions: {
        width: 180,
        height: 135,
        top: 55,
        left: '27%',
        resizeMode: 'contain',
    },
    neverhaveiever: {
        width: 130,
        height: 130,
        top: 57,
        left: '34%',
        resizeMode: 'contain',
    },
    okredflagdealbreaker: {
        width: 180,
        height: 160,
        top: 85,
        left: '27.5%',
        resizeMode: 'contain',
    },
})

export function BlurWrapper(props: PropsWithChildren) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const event = useSelector((state: ReduxState) => state.event)
    const ad = useSelector((state: ReduxState) => state.ad)
    const route = useRoute()
    const exceptions = ['SpecificGameScreen']
    const height = getHeaderBackgroundHeight({ lang, event, ad, routeName: route.name })
    const gameID = (route.params as any)?.gameID
    const gameImages = [
        { style: GAME_IMAGE_STYLES.terning, icon: require('@assets/games/terning.png') },
        { style: GAME_IMAGE_STYLES.questions, icon: require('@assets/games/100questions.png') },
        { style: GAME_IMAGE_STYLES.neverhaveiever, icon: require('@assets/games/neverhaveiever.png') },
        { style: GAME_IMAGE_STYLES.okredflagdealbreaker, icon: require('@assets/games/okredflagdealbreaker.png') },
    ]

    return (
        <>
            {!exceptions.includes(route.name) && <BlurView
                blurMethod='dimezisBlurView'
                intensity={Platform.OS === 'ios' ? 30 : 20}
            />}
            <View style={{ ...GS.blurBackgroundView, height }}>
                {Object.keys(route.params || {}).includes('gameID') && <Image
                    style={gameImages[gameID + 1].style}
                    source={gameImages[gameID + 1].icon}
                />}
                {route.name === 'DiceScreen' && <Image
                    style={GAME_IMAGE_STYLES.terning}
                    source={gameImages[0].icon}
                />}
                {props.children}
            </View>
        </>
    )
}

export function HeaderGlassBackground({ borderRadius }: { borderRadius: number }) {
    const { theme, isDark } = useSelector((state: ReduxState) => state.theme)

    return (
        <>
            <BlurView
                style={StyleSheet.absoluteFill}
                blurMethod='dimezisBlurView'
                intensity={Platform.OS === 'ios' ? 35 : 24}
            />
            <View style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius,
                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : theme.transparentAndroid,
            }} />
        </>
    )
}

function getHeaderBackgroundHeight({
    lang,
    event,
    ad,
    routeName,
}: {
    lang: boolean
    event: ReduxState['event']
    ad: ReduxState['ad']
    routeName: string
}) {
    const defaultHeight = Dimensions.get('window').height * 8 / (Platform.OS === 'ios' ? 85 : 100)
        + (StatusBar.currentHeight ? StatusBar.currentHeight - 2 : 0)
    const isSearchingEvents = event.search && routeName === 'EventScreen'
    const categories = getCategories({ lang, categories: event.categories })
    const item = isSearchingEvents ? categories : ad.skills
    const isSearchingAds = ad.search && routeName === 'AdScreen'
    const extraHeight = getHeight(item.length)
    const windowHeight = Dimensions.get('window').height
    const largeDeviceReduction = windowHeight > 915 ? -15 : 0

    return defaultHeight + (isSearchingEvents || isSearchingAds
        ? Platform.OS === 'ios'
            ? 50 + extraHeight
            : isSearchingEvents
                ? 35 + extraHeight + largeDeviceReduction
                : 25 + extraHeight + largeDeviceReduction
        : Platform.OS === 'ios'
            ? 20
            : defaultHeight <= 100
                ? 5
                : windowHeight > 915
                    ? -defaultHeight / 3.8
                    : -defaultHeight / 5
    )
}
