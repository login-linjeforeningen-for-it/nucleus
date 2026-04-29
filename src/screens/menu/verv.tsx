import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { CommitteeCard, CommitteeTabs, PhotoRail, VervCommittee, VervLeader, VervPhoto } from '@/components/menu/verv/vervCards'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { JSX, useState } from 'react'
import { Dimensions, Linking, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function VervScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').verv : require('@text/en.json').verv
    const [activeCommittee, setActiveCommittee] = useState<string>((text.committees as VervCommittee[])[0]?.id || '')
    const committees = text.committees as VervCommittee[]
    const committee = committees.find((item) => item.id === activeCommittee) || committees[0]

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    style={GS.content}
                    contentContainerStyle={{ paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Space height={Dimensions.get('window').height / 8} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text25, color: theme.textColor }}>{text.title}</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.intro}</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.intro2}</Text>
                        </View>
                    </Cluster>

                    <Space height={10} />
                    <PhotoRail photos={text.photos as VervPhoto[]} />

                    <Space height={10} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>{text.committeeTitle}</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.committeeIntro}</Text>
                            <Space height={12} />
                            <CommitteeTabs
                                committees={committees}
                                activeCommittee={committee.id}
                                setActiveCommittee={setActiveCommittee}
                            />
                            <Space height={12} />
                            <CommitteeCard
                                committee={committee}
                                leader={text.leaderData[committee.leaderKey] as VervLeader}
                                leaderTitle={text.leaders[committee.leaderKey] as string}
                            />
                        </View>
                    </Cluster>

                    <Space height={10} />
                    <Cluster>
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text20, color: theme.textColor }}>{text.apply.title}</Text>
                            <Space height={6} />
                            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{text.apply.body}</Text>
                            <Space height={12} />
                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://forms.gle/nQrJuqo3C9URLRM29')}
                                activeOpacity={0.88}
                            >
                                <View style={{
                                    borderRadius: 999,
                                    backgroundColor: theme.orange,
                                    paddingHorizontal: 16,
                                    paddingVertical: 11,
                                    alignSelf: 'flex-start',
                                }}>
                                    <Text style={{ ...T.text15, color: theme.textColor, fontWeight: '600' }}>
                                        {text.apply.action}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Cluster>
                </ScrollView>
            </View>
        </Swipe>
    )
}
