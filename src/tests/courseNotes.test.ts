import { updateCourseNotes } from '@utils/course'

describe('course notes mobile editing', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('rejects note saves when there is no access token', async () => {
        await expect(updateCourseNotes(12, '## Notes', null)).resolves.toEqual({
            ok: false,
            error: 'Missing access token',
        })
    })

    it('rejects empty note saves before hitting the API', async () => {
        global.fetch = jest.fn() as any

        await expect(updateCourseNotes(12, '   ', 'token-123')).resolves.toEqual({
            ok: false,
            error: 'Notes cannot be empty',
        })
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('sends the note update to the Studentbee notes endpoint', async () => {
        global.fetch = jest.fn(async () => ({
            ok: true,
        })) as any

        await expect(updateCourseNotes(42, '# Updated from mobile', 'token-123')).resolves.toEqual({ ok: true })
        expect(global.fetch).toHaveBeenCalledWith(
            'https://studentbee-api.login.no/api/course/42/notes',
            expect.objectContaining({
                method: 'PUT',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token-123',
                }),
                body: JSON.stringify({ notes: '# Updated from mobile' }),
            }),
        )
    })

    it('surfaces API validation errors', async () => {
        global.fetch = jest.fn(async () => ({
            ok: false,
            text: async () => JSON.stringify({ error: 'Missing required field (user ID, notes)' }),
        })) as any

        await expect(updateCourseNotes(42, '# Updated from mobile', 'token-123')).resolves.toEqual({
            ok: false,
            error: 'Missing required field (user ID, notes)',
        })
    })
})
