import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { NotificationSeperator } from '@components/event/seperator'
import GS from '@styles/globalStyles'
import NS from '@styles/notificationStyles'
import T from '@styles/text'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import React, { JSX, useRef, useState } from 'react'
import { Dimensions, Platform, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable'
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSelector } from 'react-redux'
import { resolveNotificationTarget } from '@utils/notification/list'
import { Path, Svg } from 'react-native-svg'

type NotificationModalProps = {
    item: NotificationListProps
    list: NotificationListProps[]
    id: number
    setList: React.Dispatch<React.SetStateAction<NotificationListProps[]>>
    hideOld: boolean
    setHideOld: React.Dispatch<React.SetStateAction<boolean>>
    readIndex: number
}

type NotificationListViewProps = {
    list: NotificationListProps[]
    setList: React.Dispatch<React.SetStateAction<NotificationListProps[]>>
    hideOld: boolean
    setHideOld: React.Dispatch<React.SetStateAction<boolean>>
    readIndex: number
}

export default function NotificationListView({
    list,
    setList,
    hideOld,
    setHideOld,
    readIndex,
}: NotificationListViewProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const offset = Dimensions.get('window').height / (Platform.OS === 'ios' ? 3.8 : 3.8)
    const text = lang ? 'Varslinger slettes automatisk etter 30 dager' : 'Notifications are automatically deleted after 30 days'

    return (
        <>
            {readIndex > 0 && <NotificationSeperator text={lang ? 'Nye' : 'New'} />}
            {list.map((item, index) => (
                <NotificationRow
                    key={index}
                    list={list}
                    item={item}
                    id={index}
                    setList={setList}
                    hideOld={hideOld}
                    setHideOld={setHideOld}
                    readIndex={readIndex}
                />
            ))}
            <Text style={{ alignSelf: 'center', ...T.text12, marginVertical: 10, color: theme.oppositeTextColor }}>{text}</Text>
            <Space height={offset} />
        </>
    )
}

function NotificationRow({ item, list, id, setList, hideOld, setHideOld, readIndex }: NotificationModalProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [isSwiping, setIsSwiping] = useState<boolean>(false)
    const navigation = useNavigation<NavigationProp<AppNavigationParamList>>()
    const time = displayTime(item.time)
    const swipeableRef = useRef<SwipeableMethods | null>(null)

    async function deleteNotification() {
        const newList = list.filter((_, index) => index !== id)
        setList(newList)
        await AsyncStorage.setItem('notificationList', JSON.stringify(newList))
        swipeableRef.current?.close()
    }

    if (hideOld && id >= readIndex) {
        return <>{id === readIndex && <PreviousSeparator lang={lang} onPress={() => setHideOld(!hideOld)} />}</>
    }

    return (
        <>
            {id === readIndex && <PreviousSeparator lang={lang} onPress={() => setHideOld(!hideOld)} />}
            <Swipeable
                renderRightActions={(_progress, dragX) => <DeleteAction dragX={dragX} onDelete={deleteNotification} />}
                ref={swipeableRef}
                containerStyle={{ backgroundColor: 'red' }}
                onSwipeableWillOpen={() => setIsSwiping(true)}
                onSwipeableWillClose={() => setIsSwiping(false)}
                rightThreshold={Dimensions.get('window').width * 0.28}
                overshootRight={false}
                onSwipeableOpen={(direction) => direction === 'right' ? deleteNotification() : undefined}
            >
                <TouchableHighlight
                    activeOpacity={1}
                    onPress={() => navigateIfPossible(item, navigation)}
                    underlayColor={theme.background}
                    style={{ backgroundColor: theme.darker, borderTopRightRadius: isSwiping ? 8 : 0, borderBottomRightRadius: isSwiping ? 8 : 0 }}
                >
                    <Animated.View>
                        <Cluster marginVertical={12} noColor>
                            <View style={NS.notificationBack}>
                                <View style={NS.notificationView}>
                                    <NotificationText title={item.title} body={item.body} />
                                </View>
                                <Text style={{ ...NS.time, right: 32, color: theme.titleTextColor }}>{time}</Text>
                            </View>
                        </Cluster>
                    </Animated.View>
                </TouchableHighlight>
            </Swipeable>
        </>
    )
}

function PreviousSeparator({ lang, onPress }: { lang: boolean, onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <NotificationSeperator text={lang ? 'Tidligere' : 'Previous'} />
        </TouchableOpacity>
    )
}

function NotificationText({ title, body }: { title: string, body: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View>
            <View>
                <Text style={{ ...NS.title, color: theme.textColor }}>
                    {title}
                </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ ...NS.loc, color: theme.oppositeTextColor }}>
                    {body}
                </Text>
            </View>
        </View>
    )
}

function navigateIfPossible(item: NotificationListProps, navigation: NavigationProp<AppNavigationParamList>) {
    const target = resolveNotificationTarget(item.data)

    if (target?.kind === 'ad') {
        navigation.navigate('SpecificAdScreen', { adID: target.adID })
        return
    }

    if (target?.kind === 'event') {
        navigation.navigate('SpecificEventScreen', { eventID: target.eventID })
    }
}

function displayTime(time: string): string {
    const date = new Date(time)
    const currentTime = new Date()

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    const timeDifference = currentTime.getTime() - date.getTime()
    if (timeDifference <= 24 * 60 * 60 * 1000) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    return `${day}.${month}`
}

function DeleteAction({ dragX, onDelete }: { dragX: SharedValue<number>, onDelete: () => void }): JSX.Element {
    const animatedStyle = useAnimatedStyle(() => {
        const progress = Math.min(1, Math.max(0, Math.abs(dragX.value) / 100))
        return { transform: [{ scale: progress }] }
    })

    return (
        <TouchableOpacity onPress={onDelete}>
            <View style={{ minWidth: 70, backgroundColor: 'red', padding: 10, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <Animated.View style={animatedStyle}>
                    <TrashCan />
                </Animated.View>
            </View>
        </TouchableOpacity>
    )
}

function TrashCan() {
    return (
        <View style={GS.trashCan}>
            <Svg width={500} height={500} >
                <Path d='M 21.857422 7 C 20.282422 7 19 8.2824219 19 9.8574219 L 19 13 L 10.5 13 C 10.224 13 10 13.224 10 13.5 C 10 13.776 10.224 14 10.5 14 L 12.925781 14 L 14.292969 38.607422 C 14.399969 40.509422 15.974906 42 17.878906 42 L 32.121094 42 C 34.025094 42 35.601031 40.510375 35.707031 38.609375 L 37.074219 14 L 39.5 14 C 39.776 14 40 13.776 40 13.5 C 40 13.224 39.776 13 39.5 13 L 31 13 L 31 9.8574219 C 31 8.2824219 29.717578 7 28.142578 7 L 21.857422 7 z M 21.857422 8 L 28.142578 8 C 29.166578 8 30 8.8334219 30 9.8574219 L 30 13 L 20 13 L 20 9.8574219 C 20 8.8334219 20.832422 8 21.857422 8 z M 13.927734 14 L 36.072266 14 L 34.708984 38.552734 C 34.631984 39.924734 33.495094 41 32.121094 41 L 17.878906 41 C 16.504906 41 15.368016 39.925734 15.291016 38.552734 L 13.927734 14 z M 19.169922 19 C 18.894922 19.009 18.6775 19.241578 18.6875 19.517578 L 19.242188 35.517578 C 19.252187 35.787578 19.473188 35.998047 19.742188 35.998047 L 19.761719 35.998047 C 20.036719 35.989047 20.252188 35.758422 20.242188 35.482422 L 19.6875 19.482422 C 19.6785 19.206422 19.436922 18.962 19.169922 19 z M 25 19 C 24.724 19 24.5 19.224 24.5 19.5 L 24.5 35.431641 C 24.5 35.707641 24.724 35.931641 25 35.931641 C 25.276 35.931641 25.5 35.707641 25.5 35.431641 L 25.5 19.5 C 25.5 19.224 25.276 19 25 19 z M 30.830078 19 C 30.545078 18.98 30.3225 19.207422 30.3125 19.482422 L 29.755859 35.482422 C 29.745859 35.758422 29.963281 35.989047 30.238281 35.998047 L 30.255859 35.998047 C 30.524859 35.998047 30.745859 35.787578 30.755859 35.517578 L 31.3125 19.517578 C 31.3225 19.241578 31.105078 19.009 30.830078 19 z' />
            </Svg>
        </View>
    )
}
