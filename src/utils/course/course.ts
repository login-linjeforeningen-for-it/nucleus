import config from '@/constants'
import { getResponseErrorMessage, parseResponseBody } from '@utils/http'

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
    return await fetchStudentbee('/courses', normalizeCourseList)
}

async function fetchCourse(path: string): Promise<Course | string> {
    return await fetchStudentbee(path, normalizeCourse)
}

async function fetchStudentbee<T>(path: string, normalize: (raw: unknown) => T): Promise<T | string> {
    try {
        const response = await fetch(`${config.studentbee_api}${path}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const data = await response.text()
            throw new Error(data)
        }

        return normalize(await response.json())
    } catch (error) {
        const err = error as Error
        return err.message
    }
}

// Fetches the requested course from the server if possible.
// ID - Course ID
export async function getCourse(id: number): Promise<Course | string> {
    return fetchCourse(`/course/${id}`)
}

// Fetches the requested course by course code. Codes are not numeric database IDs.
export async function getCourseByCode(code: string): Promise<Course | string> {
    return fetchCourse(`/course/code/${encodeURIComponent(code)}`)
}

export async function updateCourseNotes(id: number, notes: string, token: string | null): Promise<CourseNotesUpdateResult> {
    if (!token) {
        return { ok: false, error: 'Missing access token' }
    }

    if (!notes.trim()) {
        return { ok: false, error: 'Notes cannot be empty' }
    }

    try {
        const response = await fetch(`${config.studentbee_api}/course/${id}/notes`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ notes }),
        })

        if (!response.ok) {
            const text = await response.text()
            const parsed = parseResponseBody(text)
            return { ok: false, error: getResponseErrorMessage(parsed) || 'Failed to update notes' }
        }

        return { ok: true }
    } catch (error) {
        return { ok: false, error: (error as Error).message }
    }
}
