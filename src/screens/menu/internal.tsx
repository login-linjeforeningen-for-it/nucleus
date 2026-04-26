import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import GS from '@styles/globalStyles'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import Swipe from '@components/nav/swipe'
import { View, TouchableOpacity, Dimensions } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Text from '@components/shared/text'
import ManageTopics from '@components/notification/manageTopics'
import TopicManager from '@utils/notification/topicManager'
import { JSX } from 'react'
import { startLogin } from '@utils/auth'

export default function InternalScreen({ navigation }: MenuProps<'InternalScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login, groups } = useSelector((state: ReduxState) => state.login)

    return (
        <ScrollView>
            <Swipe left='MenuScreen'>
                <View>
                    <View style={{ ...GS.content, backgroundColor: theme.darker }}>
                        <Space height={Dimensions.get('window').height / 8} />
                        <ManageTopics />
                        <Space height={Dimensions.get('window').height / 8} />
                        <TouchableOpacity onPress={() => navigation.navigate('AiScreen')}>
                            <Cluster>
                                <Text style={{ ...T.centered20, color: theme.textColor }}>
                                    Open Login AI
                                </Text>
                            </Cluster>
                        </TouchableOpacity>
                        <Space height={20} />
                        <TouchableOpacity onPress={() => login ? navigation.navigate('QueenbeeScreen') : startLogin('queenbee')}>
                            <Cluster>
                                <Text style={{ ...T.centered20, color: theme.textColor }}>
                                    {login ? 'Queenbee' : 'Login for Queenbee'}
                                </Text>
                            </Cluster>
                        </TouchableOpacity>
                        <Space height={20} />
                        <View style={{ paddingHorizontal: 20 }}>
                            <Text style={{ ...T.centered20, color: theme.textColor }}>
                                {login
                                    ? `Authenticated${groups.length ? ` · ${groups.join(', ')}` : ''}`
                                    : 'Not authenticated yet'}
                            </Text>
                        </View>
                        <Space height={20} />
                        <Space height={50} />
                        <TouchableOpacity onPress={() => TopicManager({ topic: 'maintenance' })}>
                            <Cluster>
                                <Text style={{ ...T.centered20, color: theme.textColor }}>
                                    Subscribe to maintenance
                                </Text>
                            </Cluster>
                        </TouchableOpacity>
                    </View>
                </View>
            </Swipe>
        </ScrollView>
    )
}
