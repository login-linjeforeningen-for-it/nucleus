export type FundSection = {
    title: string
    body: string
}

export type FundBoardMember = {
    title: string
    name: string
    discord: string
    image: string
}

export type FundSupportText = {
    title: string
    intro: string
    target: string
    period: string
    apply: string
}

export type FundBoardText = {
    title: string
    intro: string
    body: string
    membersTitle: string
    members: FundBoardMember[]
}

export type HoldingsCardText = {
    title: string
    updated: string
    history: string
    change: string
    empty: string
}

export type HoldingsCardProps = {
    holdings: FundHoldingsTotal | null
    history: FundHoldingsHistory | null
    text: HoldingsCardText
}
