import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import TrashCan from '@components/menu/navigation'
import { NotificationSeperator } from '@components/event/seperator'
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
