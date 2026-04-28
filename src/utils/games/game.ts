import config from '@/constants'

// Fetches the list of games from the server
export async function getGames() {
    return await getGameJson('/games/games')
}

// Fetches questions for the 100 Questions game from the server
export async function getQuestions() {
    return await getGameJson('/questions')
}

// Fetches questions for the Never Have I Ever game from the server
export async function getNeverHaveIEver() {
    return await getGameJson('/neverhaveiever')
}

// Fetches questions for the Ok Red Flag Dealbreaker game from the server
export async function getOkRedFlagDealbreaker() {
    return await getGameJson('/okredflagdealbreaker')
}

async function getGameJson(path: string) {
    try {
        const response = await fetch(`${config.app_api}${path}`, {
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
