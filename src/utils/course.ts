import config from "../constants"

// Fetches courses from server, different url based on location, therefore the 
// location parameter to ensure all requests are successful
export async function getCourses(): Promise<CourseAsList[] | string> {
    try {
        const response = await fetch(`${config.studentbee_api_url}/courses`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const data = await response.text()
            throw new Error(data)
        }

        const courses = await response.json()
        return courses
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

        const course = await response.json()
        return course
    } catch (error) {
        const err = error as Error
        return err.message
    }
}
