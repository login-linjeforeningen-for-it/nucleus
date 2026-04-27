import config from '@/constants'

// Fetches the list of games from the server
export async function getGames() {
    try {
        const response = await fetch(`${config.app_api}/games/games`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const data = await response.json()

            throw Error(data.error)
        }

        return await response.json()
    } catch (error: unknown) {
        const err = error as Error
        return err.message
    }
}

// Fetches questions for the 100 Questions game from the server
export async function getQuestions() {
    try {
        const response = await fetch(`${config.app_api}/questions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const data = await response.json()

            throw Error(data.error)
        }

        return await response.json()
    } catch (error: unknown) {
        const err = error as Error
        return err.message
    }
}

// Fetches questions for the Never Have I Ever game from the server
export async function getNeverHaveIEver() {
    try {
        const response = await fetch(`${config.app_api}/neverhaveiever`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const data = await response.json()

            throw Error(data.error)
        }

        return await response.json()
    } catch (error: unknown) {
        const err = error as Error
        return err.message
    }
}

// Fetches questions for the Ok Red Flag Dealbreaker game from the server
export async function getOkRedFlagDealbreaker() {
    try {
        const response = await fetch(`${config.app_api}/okredflagdealbreaker`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const data = await response.json()

            throw Error(data.error)
        }

        return await response.json()
    } catch (error: unknown) {
        const err = error as Error
        return err.message
    }
}
