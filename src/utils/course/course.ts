import config from '@/constants'

function normalizeCourseList(raw: unknown): CourseAsList[] {
    if (!Array.isArray(raw)) {
        throw new Error('Invalid course list response')
    }

    return raw.map((course) => {
        const item = course as Record<string, unknown>
        return {
            id: Number(item.id),
            code: String(item.code || ''),
            cards: [],
            count: Number(item.cardCount ?? item.count ?? 0),
        }
    })
}

function normalizeCard(raw: unknown): Card {
    const item = raw as Record<string, unknown>
    return {
        question: String(item.question || ''),
        alternatives: Array.isArray(item.alternatives) ? item.alternatives.map(String) : [],
        correct: Array.isArray(item.answers)
            ? item.answers.map((answer) => Number(answer))
            : Array.isArray(item.correct)
                ? item.correct.map((answer) => Number(answer))
                : [],
        source: String(item.source || ''),
        rating: Number(item.rating ?? 0),
        votes: Array.isArray(item.votes)
            ? item.votes.map((vote) => vote as Vote)
            : [],
        help: typeof item.help === 'string' ? item.help : undefined,
        theme: typeof item.theme === 'string' ? item.theme : undefined,
    }
}

function normalizeCourse(raw: unknown): Course {
    const item = raw as Record<string, unknown>
    return {
        id: String(item.id || ''),
        code: String(item.code || ''),
        name: String(item.name || ''),
        learningBased: Boolean(item.learningBased),
        notes: String(item.notes || ''),
        cards: Array.isArray(item.cards) ? item.cards.map(normalizeCard) : [],
        files: {
            id: 0,
            name: 'root',
            content: '',
            files: [],
        },
    }
}

// Fetches courses from server, different url based on location, therefore the
// location parameter to ensure all requests are successful
export async function getCourses(): Promise<CourseAsList[] | string> {
    try {
        const response = await fetch(`${config.studentbee_api_url}/course/courses`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const data = await response.text()
            throw new Error(data)
        }

        return normalizeCourseList(await response.json())
    } catch (error) {
        const err = error as Error
        return err.message
    }
}

// Fetches the requested course from the server if possible.
// ID - Course ID
// location - Whether the request is coming from SSR or CSR
export async function getCourse(id: number): Promise<Course | string> {
    try {
        const response = await fetch(`${config.studentbee_api_url}/course/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const data = await response.text()
            throw new Error(data)
        }

        return normalizeCourse(await response.json())
    } catch (error) {
        const err = error as Error
        return err.message
    }
}

export async function updateCourseNotes(id: number, notes: string, token: string | null): Promise<CourseNotesUpdateResult> {
    if (!token) {
        return { ok: false, error: 'Missing access token' }
    }

    if (!notes.trim()) {
        return { ok: false, error: 'Notes cannot be empty' }
    }

    try {
        const response = await fetch(`${config.studentbee_api_url}/course/${id}/notes`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ notes }),
        })

        if (!response.ok) {
            const text = await response.text()

            try {
                const parsed = JSON.parse(text) as { error?: string }
                return { ok: false, error: parsed.error || 'Failed to update notes' }
            } catch {
                return { ok: false, error: text || 'Failed to update notes' }
            }
        }

        return { ok: true }
    } catch (error) {
        return { ok: false, error: (error as Error).message }
    }
}
