import Space from '@/components/shared/utils'
import GS from '@styles/globalStyles'
import { JSX, useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import {
    View,
    Text,
    Dimensions,
    RefreshControl,
} from 'react-native'
import NS from '@styles/notificationStyles'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NotificationListView from '@/components/notification/notificationList'
import Swipe from '@components/nav/swipe'
import { ScrollView } from 'react-native-gesture-handler'
import {
    getFirstReadIndex,
    markNotificationsRead,
    parseNotificationList,
    pruneOldNotifications,
} from '@utils/notification/list'

type ReadListProps = {
    list: NotificationListProps[]
    setReadIndex: (index: number) => void
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
            <View style={{ ...GS.content, backgroundColor: theme.darker, paddingHorizontal: 0 }}>
                <Space height={Dimensions.get('window').height / 8.1} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={100}
                    style={{ minHeight: '100%', top: -5 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={onRefresh}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
                >
                    {Array.isArray(list) && list.length
                        ? (
                            <NotificationListView
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
                <TopRefreshIndicator refreshing={refresh} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}

function findIndexOfFirstReadIfAny({ list, setReadIndex }: ReadListProps): void {
    setReadIndex(getFirstReadIndex(list))
}
