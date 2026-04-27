import Cluster from '@/components/shared/cluster'
import Space from '@/components/shared/utils'
import { BoardCard, FundSupportCard, HoldingsCard, SectionCard } from '@/components/menu/fund/fundCards'
import { FundSection } from '@/components/menu/fund/fundTypes'
import Swipe from '@components/nav/swipe'
import Text from '@components/shared/text'
import TopRefreshIndicator from '@components/shared/topRefreshIndicator'
import GS from '@styles/globalStyles'
import T from '@styles/text'
import { fetchFundHoldings, fetchFundHoldingsHistory } from '@utils/fetch'
import { JSX, useEffect, useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function FundScreen(): JSX.Element {
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const text = lang ? require('@text/no.json').fund : require('@text/en.json').fund
    const [holdings, setHoldings] = useState<FundHoldingsTotal | null>(null)
    const [history, setHistory] = useState<FundHoldingsHistory | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    async function load() {
        setRefreshing(true)
        const [nextHoldings, nextHistory] = await Promise.all([
            fetchFundHoldings(),
            fetchFundHoldingsHistory('1m'),
        ])
        setHoldings(nextHoldings)
        setHistory(nextHistory)
        setRefreshing(false)
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <Swipe left='MenuScreen'>
            <View style={{ flex: 1, backgroundColor: theme.darker }}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => load()}
                            tintColor={theme.orange}
                            colors={[theme.orange]}
                            progressViewOffset={0}
                        />
                    }
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
                        </View>
                    </Cluster>

                    <Space height={10} />
                    <HoldingsCard holdings={holdings} history={history} text={text.holdings} />

                    <Space height={10} />
                    <FundSupportCard text={text.support} lang={lang} />

                    <Space height={10} />
                    {(text.sections as FundSection[]).map((section) => (
                        <SectionCard key={section.title} section={section} />
                    ))}

                    <Space height={10} />
                    <BoardCard text={text.board} />
                </ScrollView>
                <TopRefreshIndicator refreshing={refreshing} theme={theme} top={112} />
            </View>
        </Swipe>
    )
}
