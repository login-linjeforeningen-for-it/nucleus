import config from '@/constants'

export async function fetchFundHoldings(): Promise<FundHoldingsTotal | null> {
    try {
        const response = await fetch(`${config.login_url}/api/fund/holdings`)
        if (!response.ok) throw new Error('Failed to fetch fund holdings')
        const data = await response.json()
        return typeof data?.totalBase === 'number' ? data as FundHoldingsTotal : null
    } catch {
        return null
    }
}

export async function fetchFundHoldingsHistory(range: FundHoldingsRange = '1m'): Promise<FundHoldingsHistory | null> {
    try {
        const response = await fetch(`${config.login_url}/api/fund/holdings/history?range=${range}`)
        if (!response.ok) throw new Error('Failed to fetch fund holdings history')
        const data = await response.json()
        return Array.isArray(data?.points) ? data as FundHoldingsHistory : null
    } catch {
        return null
    }
}
