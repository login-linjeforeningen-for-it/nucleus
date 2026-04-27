import Space from '@/components/shared/utils'
import GS from '@styles/globalStyles'
import { useSelector } from 'react-redux'
import T from '@styles/text'
import Swipe from '@components/nav/swipe'
import { View, Dimensions } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Text from '@components/shared/text'
import ManageTopics from '@components/notification/manageTopics'
import TopicManager from '@utils/notification/topicManager'
import { JSX } from 'react'
import { startLogin } from '@utils/auth/auth'
import { ActionCard, GlassCard, RoleChips, StatusPill } from '@components/menu/internal/internalCards'

export default function InternalScreen({ navigation }: MenuProps<'InternalScreen'>): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login, groups } = useSelector((state: ReduxState) => state.login)

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 110 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    <GlassCard theme={theme} accent>
                        <View style={{ gap: 12 }}>
                            <View style={{ gap: 6 }}>
                                <Text style={{ ...T.text25, color: theme.textColor }}>
                                    Internal
                                </Text>
                                <Text style={{ ...T.text15, color: theme.oppositeTextColor, lineHeight: 21 }}>
                                    Compact tools for Login operations, notifications, and Queenbee access.
                                </Text>
                            </View>
                            <StatusPill
                                theme={theme}
                                label={login ? 'Authenticated session' : 'Guest session'}
                                active={login}
                            />
                        </View>
                    </GlassCard>

                    <Space height={12} />
                    <ActionCard
                        theme={theme}
                        title={login ? 'Queenbee' : 'Login for Queenbee'}
                        description={login ? 'Open the internal control surface.' : 'Authenticate before opening internal tools.'}
                        label={login ? 'Open' : 'Log in'}
                        onPress={() => login ? navigation.navigate('QueenbeeScreen') : startLogin('queenbee')}
                    />

                    <Space height={12} />
                    <GlassCard theme={theme}>
                        <View style={{ gap: 12 }}>
                            <View style={{ gap: 4 }}>
                                <Text style={{ ...T.text20, color: theme.textColor }}>
                                    Topic manager
                                </Text>
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor, lineHeight: 19 }}>
                                    Subscribe or unsubscribe this device from notification topics.
                                </Text>
                            </View>
                            <ManageTopics />
                        </View>
                    </GlassCard>

                    <Space height={12} />
                    <GlassCard theme={theme}>
                        <View style={{ gap: 12 }}>
                            <View style={{ gap: 4 }}>
                                <Text style={{ ...T.text20, color: theme.textColor }}>
                                    Session
                                </Text>
                                <Text style={{ ...T.text12, color: theme.oppositeTextColor, lineHeight: 19 }}>
                                    {login ? 'Current access groups for this app session.' : 'Log in to reveal internal roles.'}
                                </Text>
                            </View>
                            <RoleChips theme={theme} groups={groups} login={login} />
                        </View>
                    </GlassCard>

                    <Space height={12} />
                    <ActionCard
                        theme={theme}
                        title='Maintenance alerts'
                        description='Follow platform maintenance messages on this device.'
                        label='Subscribe'
                        onPress={() => void TopicManager({ topic: 'maintenance' })}
                        subtle
                    />
                </ScrollView>
            </View>
        </Swipe>
    )
}
