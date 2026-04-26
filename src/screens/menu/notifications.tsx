import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import GS from '@styles/globalStyles'
import React, { JSX, useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Platform,
    Animated,
    TouchableHighlight
} from 'react-native'
import NS from '@styles/notificationStyles'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NotificationText from '@/components/notification/notificationText'
import Swipe from '@components/nav/swipe'
import { useNavigation } from '@react-navigation/native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { Swipeable } from 'react-native-gesture-handler'
import TrashCan from '@components/menu/navigation'
import { NotificationSeperator } from '@components/event/seperator'
import T from '@styles/text'
import {
    getFirstReadIndex,
    markNotificationsRead,
    parseNotificationList,
    pruneOldNotifications,
    resolveNotificationTarget,
} from '@utils/notification/list'

type NotificationModalProps = {
    item: NotificationListProps
    list: NotificationListProps[]
    id: number
    setList: React.Dispatch<React.SetStateAction<NotificationListProps[]>>
    hideOld: boolean
    setHideOld: React.Dispatch<React.SetStateAction<boolean>>
    readIndex: number
}

type NotificationList = {
    list: NotificationListProps[]
    setList: React.Dispatch<React.SetStateAction<NotificationListProps[]>>
    hideOld: boolean
    setHideOld: React.Dispatch<React.SetStateAction<boolean>>
    readIndex: number
}

type ReadListProps = {
    list: NotificationListProps[]
    setReadIndex: React.Dispatch<React.SetStateAction<number>>
}

export default function NotificationScreen(): JSX.Element {
    const [list, setList] = useState<NotificationListProps[]>([])
    const [refresh, setRefresh] = useState(false)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const [hideOld, setHideOld] = useState<boolean>(false)
    const [readIndex, setReadIndex] = useState<number>(-1)

    async function getList() {
        const temp = await AsyncStorage.getItem('notificationList')
        const storedList = parseNotificationList(temp)
        const prunedList = pruneOldNotifications(storedList)
        const nextList = markNotificationsRead(prunedList)

        setList(nextList)
        findIndexOfFirstReadIfAny({ list: nextList, setReadIndex })
        await AsyncStorage.setItem('notificationList', JSON.stringify(nextList))
        return true
    }

    useEffect(() => {
        getList()
    }, [])

    const onRefresh = useCallback(async () => {
        setRefresh(true)
        await getList()
        setRefresh(false)
    }, [])

    return (
        <Swipe left='MenuScreen'>
            <View>
                <View style={{ ...GS.content, backgroundColor: theme.darker, paddingHorizontal: 0 }}>
                    <Space height={Dimensions.get('window').height / 8.1} />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={100}
                        style={{ minHeight: '100%', top: -5 }}
                    >
                        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                        {Array.isArray(list) && list.length
                            ? (
                                <List
                                    list={list}
                                    setList={setList}
                                    hideOld={hideOld}
                                    setHideOld={setHideOld}
                                    readIndex={readIndex}
                                />
                            )
                            : <Text style={{ ...NS.error, color: theme.oppositeTextColor }}>
                                {lang
                                    ? 'Ingen varslinger. Kom tilbake senere.'
                                    : 'You have no notifications at this time. Check back later.'}
                            </Text>}
                    </ScrollView>
                </View>
            </View>
        </Swipe>
    )
}

function Notification({ item, list, id, setList, hideOld, setHideOld, readIndex }: NotificationModalProps): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const [isSwiping, setIsSwiping] = useState<boolean>(false)
    const navigation: Navigation = useNavigation()
    const time = displayTime(item.time)
    const swipeableRef = useRef<Swipeable | null>(null)

    function navigateIfPossible() {
        const target = resolveNotificationTarget(item.data)

        if (target?.kind === 'ad') {
            navigation.navigate('SpecificAdScreen', { adID: target.adID })
            return
        }

        if (target?.kind === 'event') {
            navigation.navigate('SpecificEventScreen', { eventID: target.eventID })
        }
    }

    async function deleteNotification() {
        // Copies the list to ensure that React detects the change since splice mutates the list undetectably.
        const newList = list.filter((_, index) => index !== id)
        setList(newList)
        await AsyncStorage.setItem('notificationList', JSON.stringify(newList))
        swipeableRef.current?.close()
    }

    function handlePress() {
        setHideOld(!hideOld)
    }

    function DisplayPrevious() {
        return (
            <TouchableOpacity onPress={handlePress}>
                <NotificationSeperator text={lang ? 'Tidligere' : 'Previous'} />
            </TouchableOpacity>
        )
    }

    if (hideOld && id >= readIndex) {
        return <>{id == readIndex && <DisplayPrevious />}</>
    }

    return (
        <>
            {id == readIndex && <DisplayPrevious />}
            <Swipeable
                renderRightActions={(_progress, dragX) => (
                    <DeleteAction dragX={dragX} onDelete={deleteNotification} />
                )}
                ref={swipeableRef}
                // Red background when deleting item
                containerStyle={{ backgroundColor: 'red' }}
                // Indents corners as soon as they start dragging
                onSwipeableWillOpen={() => {
                    setIsSwiping(true)
                }}
                // Removes borderRadius on close
                onSwipeableWillClose={() => {
                    setIsSwiping(false)
                }}
                rightThreshold={Dimensions.get('window').width * 0.28}
                overshootRight={false}
                onSwipeableOpen={(direction) => {
                    if (direction === 'right') {
                        void deleteNotification()
                    }
                }}
            >
                {/*
                    Using TouchableHighlight since we want feedback on touch,
                    but not opacity change, since the background is red because
                    of the delete functionality. Therefore we "highlight" the
                    click using a different foreground color instead.
                */}
                <TouchableHighlight
                    activeOpacity={1}
                    onPress={navigateIfPossible}
                    underlayColor={theme.background}
                    style={{
                        backgroundColor: theme.darker,
                        borderTopRightRadius: isSwiping ? 8 : 0,
                        borderBottomRightRadius: isSwiping ? 8 : 0,
                    }}
                >
                    <Animated.View>
                        <Cluster marginVertical={12} noColor={true}>
                            <View style={[NS.notificationBack]}>
                                <View style={NS.notificationView}>
                                    <NotificationText title={item.title} body={item.body} />
                                </View>
                                <Text style={{ ...NS.time, right: 32, color: theme.titleTextColor }}>
                                    {time}
                                </Text>
                            </View>
                        </Cluster>
                    </Animated.View>
                </TouchableHighlight>
            </Swipeable>
        </>
    )
}

function displayTime(time: string): string {
    const date = new Date(time)
    const currentTime = new Date()

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    // Calculate the time difference in milliseconds
    const timeDifference = currentTime.getTime() - date.getTime()

    // Check if the time is within the last 24 hours
    if (timeDifference <= 24 * 60 * 60 * 1000) {
        // If within 24 hours, display the time
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    } else {
        // If not within 24 hours, display the date
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        return `${day}.${month}`
    }
}

function List({ list, setList, hideOld, setHideOld, readIndex }: NotificationList): JSX.Element {
    if (!list) return <></>

    const offset = Dimensions.get('window').height / (Platform.OS === 'ios' ? 3.8 : 3.8)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? 'Varslinger slettes automatisk etter 30 dager' : 'Notifications are automatically deleted after 30 days'

    return (
        <>
            {readIndex > 0 && <NotificationSeperator text={lang ? 'Nye' : 'New'} />}
            {list.map((item, index) => (
                <Notification
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

function findIndexOfFirstReadIfAny({ list, setReadIndex }: ReadListProps): void {
    setReadIndex(getFirstReadIndex(list))
}

function DeleteAction({ dragX, onDelete }: {
    dragX: Animated.AnimatedInterpolation<number>
    onDelete: () => void
}): JSX.Element {
    const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    })

    return (
        <TouchableOpacity onPress={onDelete}>
            <View style={{
                minWidth: 70,
                backgroundColor: 'red',
                padding: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%'
            }}>
                <Animated.View style={{ transform: [{ scale }] }}>
                    <TrashCan />
                </Animated.View>
            </View>
        </TouchableOpacity>
    )
}
