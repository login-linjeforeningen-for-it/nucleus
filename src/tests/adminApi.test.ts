jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
}))

jest.mock('@redux/store', () => ({
    __esModule: true,
    default: {
        getState: jest.fn(() => ({
            login: {
                token: null,
            },
            profile: {
                id: null,
            },
        })),
    }
}))

import { listAiClients, selectBestNativeClient } from '@/utils/adminApi'

describe('adminApi AI helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns an empty client list when the endpoint shape is invalid', async () => {
        global.fetch = jest.fn(async () => ({
            ok: true,
            text: async () => JSON.stringify({ clients: [] }),
        })) as any

        await expect(listAiClients()).resolves.toEqual([])
    })

    it('normalizes clients and picks the highest TPS model', async () => {
        global.fetch = jest.fn(async () => ({
            ok: true,
            text: async () => JSON.stringify([
                { name: 'slow', model: { tps: 12, status: 'idle' } },
                { name: 'fast', model: { tps: 42, status: 'generating' } },
            ]),
        })) as any

        const clients = await listAiClients()
        expect(clients).toHaveLength(2)
        expect(selectBestNativeClient(clients)?.name).toBe('fast')
        expect(clients[0].model.currentTokens).toBe(0)
    })
})
