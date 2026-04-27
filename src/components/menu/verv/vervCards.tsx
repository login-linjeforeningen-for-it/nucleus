import Space from '@/components/shared/utils'
import config from '@/constants'
import { useSwipeNavigationLock } from '@components/nav/swipe'
import Text from '@components/shared/text'
import T from '@styles/text'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

export type VervPhoto = {
    image: string
    title: string
    description: string
}

export type VervCommittee = {
    id: string
    title: string
    leaderKey: string
    intro: string
    body: string
}

export type VervLeader = {
    name: string
    discord: string
    image: string
}

export function PhotoRail({ photos }: { photos: VervPhoto[] }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const swipeNavigation = useSwipeNavigationLock()

    return (
        <View onTouchStart={swipeNavigation.lock} onTouchEnd={swipeNavigation.unlock} onTouchCancel={swipeNavigation.unlock}>
            <ScrollView horizontal directionalLockEnabled nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 10 }}>
                {photos.map((photo) => (
                    <View key={photo.image} style={{ width: 260, borderRadius: 22, overflow: 'hidden', backgroundColor: theme.contrast, borderWidth: 1, borderColor: '#ffffff14' }}>
                        <Image source={{ uri: `${config.cdn}/img/imagecarousel/${photo.image}`, cache: 'force-cache' }} style={{ width: '100%', height: 150 }} />
                        <View style={{ padding: 12 }}>
                            <Text style={{ ...T.text15, color: theme.textColor }}>{photo.title}</Text>
                            <Space height={5} />
                            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{photo.description}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

export function CommitteeTabs({
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
                    <TouchableOpacity key={committee.id} onPress={() => setActiveCommittee(committee.id)} activeOpacity={0.88}>
                        <View style={{
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: active ? theme.orangeTransparentBorderHighlighted : '#ffffff18',
                            backgroundColor: active ? theme.orangeTransparentHighlighted : theme.contrast,
                            paddingHorizontal: 11,
                            paddingVertical: 7,
                        }}>
                            <Text style={{ ...T.text12, color: active ? theme.textColor : theme.oppositeTextColor }}>
                                {committee.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export function CommitteeCard({ committee, leader, leaderTitle }: {
    committee: VervCommittee
    leader: VervLeader
    leaderTitle: string
}) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View>
            <Text style={{ ...T.text20, color: theme.textColor }}>
                {committee.title}
            </Text>
            <Space height={5} />
            <Text style={{ ...T.text15, color: theme.textColor }}>
                {committee.intro}
            </Text>
            <Space height={6} />
            <Text style={{ ...T.text15, color: theme.oppositeTextColor }}>
                {committee.body}
            </Text>
            <Space height={12} />
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#ffffff14',
                backgroundColor: theme.contrast,
                padding: 10
            }}>
                <LeaderImage leader={leader} fallback={committee.title} />
                <View style={{ flex: 1 }}>
                    <Text style={{ ...T.text15, color: theme.textColor }}>{leader?.name || committee.title}</Text>
                    <Space height={2} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>
                        {`${leaderTitle}${leader?.discord ? ` · ${leader.discord}` : ''}`}
                    </Text>
                </View>
            </View>
        </View>
    )
}

function LeaderImage({ leader, fallback }: { leader: VervLeader, fallback: string }) {
    const { theme } = useSelector((state: ReduxState) => state.theme)

    return (
        <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            overflow: 'hidden',
            backgroundColor: theme.darker,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {leader?.image ? (
                <Image
                    source={{ uri: `${config.portrait}/${leader.image}`, cache: 'force-cache' }}
                    style={{ width: 56, height: 56 }}
                />
            ) : (
                <Text style={{ ...T.text15, color: theme.orange }}>
                    {(leader?.name || fallback).slice(0, 1)}
                </Text>
            )}
        </View>
    )
}
