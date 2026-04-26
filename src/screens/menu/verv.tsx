import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import config from '@/constants'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { JSX, useState } from 'react'
import { Dimensions, Image, Linking, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

type VervPhoto = {
    image: string
    title: string
    description: string
}

type VervCommittee = {
    id: string
    title: string
    leaderKey: string
    intro: string
    body: string
}

type VervLeader = {
    name: string
    discord: string
    image: string
}

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
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 90 }}
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
                                onPress={() => void Linking.openURL('https://forms.gle/nQrJuqo3C9URLRM29')}
                                activeOpacity={0.88}
                            >
                                <View style={{
                                    borderRadius: 999,
                                    backgroundColor: theme.orange,
                                    paddingHorizontal: 16,
                                    paddingVertical: 11,
                                    alignSelf: 'flex-start',
                                }}>
                                    <Text style={{ ...T.text15, color: '#16120f', fontWeight: '700' }}>
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

function PhotoRail({ photos }: { photos: VervPhoto[] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                {photos.map((photo) => (
                    <View
                        key={photo.image}
                        style={{
                            width: 260,
                            borderRadius: 22,
                            overflow: 'hidden',
                            backgroundColor: theme.contrast,
                            borderWidth: 1,
                            borderColor: '#ffffff14',
                        }}
                    >
                        <Image
                            source={{ uri: `${config.cdn}/imagecarousel/${photo.image}`, cache: 'force-cache' }}
                            style={{ width: '100%', height: 150 }}
                        />
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text15, color: theme.textColor }}>{photo.title}</Text>
                            <Space height={5} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                                {photo.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

function CommitteeTabs({
    committees,
    activeCommittee,
    setActiveCommittee,
}: {
    committees: VervCommittee[]
    activeCommittee: string
    setActiveCommittee: (committee: string) => void
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {committees.map((committee) => {
                const active = committee.id === activeCommittee

                return (
                    <TouchableOpacity
                        key={committee.id}
                        onPress={() => setActiveCommittee(committee.id)}
                        activeOpacity={0.88}
                    >
                        <View style={{
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: active ? theme.orangeTransparentBorderHighlighted : '#ffffff18',
                            backgroundColor: active ? theme.orangeTransparentHighlighted : theme.contrast,
                            paddingHorizontal: 11,
                            paddingVertical: 7,
                        }}>
                            <Text style={{
                                ...T.text12,
                                color: active ? theme.textColor : theme.oppositeTextColor,
                            }}>
                                {committee.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

function CommitteeCard({
    committee,
    leader,
    leaderTitle,
}: {
    committee: VervCommittee
    leader: VervLeader
    leaderTitle: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View>
            <Text style={{ ...T.text20, color: theme.textColor }}>{committee.title}</Text>
            <Space height={5} />
            <Text style={{ ...T.text15, color: theme.textColor }}>{committee.intro}</Text>
            <Space height={6} />
            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>{committee.body}</Text>
            <Space height={12} />
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#ffffff14',
                backgroundColor: theme.contrast,
                padding: 10,
            }}>
                <View style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    overflow: 'hidden',
                    backgroundColor: theme.darker,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {leader?.image ? (
                        <Image
                            source={{ uri: `${config.portrait_url}/${leader.image}`, cache: 'force-cache' }}
                            style={{ width: 56, height: 56 }}
                        />
                    ) : (
                        <Text style={{ ...T.text15, color: theme.orange }}>
                            {(leader?.name || committee.title).slice(0, 1)}
                        </Text>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>{leader?.name || committee.title}</Text>
                    <Space height={2} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {leaderTitle}{leader?.discord ? ` · ${leader.discord}` : ''}
                    </Text>
                </View>
            </View>
        </View>
    )
}
