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

import {
    listAiClients,
    listDatabaseBackupFiles,
    listDatabaseBackups,
    selectBestNativeClient,
} from '@utils/queenbee/api'
import store from '@redux/store'

describe('queenbeeApi AI helpers', () => {
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

    it('normalizes database backup endpoints', async () => {
        ;(store.getState as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue({
            login: {
                token: 'test-token',
            },
            profile: {
                id: null,
            },
        })
        global.fetch = jest.fn(async (url: string) => ({
            ok: true,
            text: async () => {
                if (url.endsWith('/backup')) {
                    return JSON.stringify([
                        {
                            id: 'backup-container-1',
                            name: 'workerbee_database',
                            status: 'up',
                            lastBackup: null,
                            nextBackup: '0 4 * * *',
                        },
                        { id: 42, name: 'invalid', status: 'up' },
                    ])
                }

                return JSON.stringify([
                    {
                        service: 'workerbee',
                        file: 'workerbee-2026-04-26.sql.gz',
                        location: 'remote',
                    },
                    { service: 12, file: null },
                ])
            },
        })) as any

        await expect(listDatabaseBackups()).resolves.toEqual([
            {
                id: 'backup-container-1',
                name: 'workerbee_database',
                status: 'up',
                lastBackup: null,
                nextBackup: '0 4 * * *',
            },
        ])
        await expect(listDatabaseBackupFiles()).resolves.toEqual([
            {
                service: 'workerbee',
                file: 'workerbee-2026-04-26.sql.gz',
                location: 'remote',
            },
        ])
    })
})
