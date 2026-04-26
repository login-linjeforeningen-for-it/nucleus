import { createSlice } from '@reduxjs/toolkit'

type FilterProps = {
    input: string
    events: GetEventProps[]
    clickedEvents: GetEventProps[]
    clickedCategories: string[]
}

type FilterTextProps = {
    events: GetEventProps[]
    input: string
}

type FilterCategoriesProps = {
    events: GetEventProps[]
    clickedEvents: GetEventProps[]
    clickedCategories: string[]
}

type filterBothProps = {
    clickedCategories: string[]
    clickedEvents: GetEventProps[]
    events: GetEventProps[]
    input: string
}

// Declares the event slice
export const EventSlice = createSlice({
    // Names the slice as "event"
    name: 'event',
    // Initial state of the slice
    initialState: {
        events: [] as GetEventProps[],
        eventName: '',
        clickedEvents: [] as GetEventProps[],
        renderedEvents: [] as GetEventProps[],
        lastFetch: '',
        lastSave: '',
        search: false,
        categories: {
            no: [] as string[],
            en: [] as string[],
        },
        clickedCategories: [] as string[],
        input: '',
        downloadState: '',
        tag: { title: '', body: '' },
    },
    // Declares reducers
    reducers: {
        // Sets the event array
        setEvents(state, action) {
            state.events = action.payload
            state.categories = setCategories(state.events, state.clickedEvents)

            if (!state.search) {
                state.renderedEvents = action.payload
            }
        },
        // Sets the event to be displayed on SES
        setEventName(state, action) {
            state.eventName = action.payload
        },
        // Sets the clicked events
        setClickedEvents(state, action) {
            state.clickedEvents = action.payload
            state.categories = setCategories(state.events, state.clickedEvents)
        },
        // Sets the events to be displayed
        setRenderedEvents(state, action) {
            state.renderedEvents = action.payload
        },
        // Stores the time of the most recent successful API call
        setLastFetch(state, action) {
            state.lastFetch = action.payload
        },
        // Stores the time of the most recent save to calendar
        setLastSave(state, action) {
            state.lastFetch = action.payload
        },
        // Toggles the filter visibility
        toggleSearch(state) {
            state.search = !state.search
        },
        // Sets the clicked categories inside of the filter
        setClickedCategories(state, action) {
            state.clickedCategories = action.payload
            state.renderedEvents = Filter({
                input: state.input,
                events: state.events,
                clickedEvents: state.clickedEvents,
                clickedCategories: state.clickedCategories
            })
        },
        // Resets states after searching
        reset(state) {
            state.input = ''
            state.renderedEvents = state.events
            state.clickedCategories = []
        },
        // Sets the search input
        setInput(state, action) {
            state.input = action.payload
            state.renderedEvents = Filter({
                input: state.input,
                events: state.events,
                clickedEvents: state.clickedEvents,
                clickedCategories: state.clickedCategories
            })
        },
        // Gets the download date
        setDownloadState(state) {
            state.downloadState = new Date().toString()
        },
        // Sets the event tag
        setTag(state, action) {
            state.tag = action.payload
        }
    }
})

// Exports functions
export const {
    reset,
    setClickedCategories,
    setClickedEvents,
    setEvents,
    setEventName,
    setInput,
    setLastFetch,
    setLastSave,
    setRenderedEvents,
    toggleSearch,
    setDownloadState,
    setTag,
} = EventSlice.actions

// Exports the Event slice itself
export default EventSlice.reducer

/**
 * Updates relevant categories to filter
 * @param clickedEvents
 * @param events
 */
function setCategories(events: GetEventProps[], clickedEvents: GetEventProps[]) {
    // Adds enrolled (Påmeldt) filter option if relevant, since no ad has this attribute naturally
    const NO: Set<string> = new Set(clickedEvents.length ? ['Påmeldt'] : [])
    const EN: Set<string> = new Set(clickedEvents.length ? ['Enrolled'] : [])
    let englishCategoryExists = false

    events.forEach((event) => {
        if (event.category.name_no) {
            NO.add(event.category.name_no)
        }

        if (event.category.name_en) {
            EN.add(event.category.name_en)
            englishCategoryExists = true
        }
    })

    const categories = {
        no: Array.from(NO),
        en: englishCategoryExists ? Array.from(EN) : []
    }

    if (categories.no[0] === undefined) {
        categories.no = []
    }

    if (categories.en[0] === undefined) {
        categories.en = []
    }

    return categories
}

// --- PARENT FILTER FUNCTION ---
function Filter({ input, events, clickedEvents, clickedCategories }: FilterProps) {
    // Filters both on input and clicked categories if both are provided
    if (input.length && clickedCategories.length) {
        return filterBoth({ clickedCategories, clickedEvents, events, input })
        // Filters on text if only text is provided
    } else if (input.length) {
        return filterText({ events, input })
        // Filters on categories if only categories are provided
    } else if (clickedCategories.length) {
        return filterCategories({ events, clickedEvents, clickedCategories })
    }

    // Returns events if there is nothing to be filtered
    return events
}

/**
 * Filters events based on if they include the passed text
 * @param events Events to filter
 * @param input Text to filter based on
 * @returns Filtered events
 */
function filterText({ events, input }: FilterTextProps) {
    const textFiltered = events.filter(event =>
        event.name_no.toLowerCase().includes(input.toLowerCase())
        || event.name_en.toLowerCase().includes(input.toLowerCase())
    )

    return removeDuplicatesAndOld(events, textFiltered)
}

/**
 * Filters events based on of their category is in the clickedCategories array
 * @param events Events to filter
 * @param clickedEvents Events clicked by the user
 * @param clickedCategories Categories clicked by the user
 * @returns Events filtered by category
 */
function filterCategories({ events, clickedEvents, clickedCategories }: FilterCategoriesProps) {
    // Checks if user is filtering by enrolled (PÅMELDT)
    const clickedFound = clickedCategories.find((category: string) => category === 'Påmeldt')

    // Filters based on category
    const categoryFiltered = events.filter(event =>
        clickedCategories.some((category: string) =>
            category === event.category.name_no
            || category === event.category.name_en
        ))

    // Returns if the user is not enrolled to any events
    if (!clickedFound) {
        return removeDuplicatesAndOld(events, categoryFiltered)
    }

    // Returns clickedEvents if the user has only clicked this
    if (clickedCategories.length < 2) {
        return removeDuplicatesAndOld(events, clickedEvents)
    }

    // Combines categoryFiltered and concatenatedArray and returns them without duplicates
    return removeDuplicatesAndOld(events, categoryFiltered.concat(clickedEvents))
}

/**
 * Filters events based on both category and text input
 * @param clickedCategories Categories clicked by the user
 * @param clickedEvents Events clicked by the user
 * @param events Events to filter
 * @param input
 * @returns Events filtered by both category and text
 */
function filterBoth({ clickedCategories, clickedEvents, events, input }: filterBothProps) {
    const categoryFiltered = filterCategories({ events, clickedEvents, clickedCategories })
    const textFiltered = filterText({ events: categoryFiltered, input })
    return removeDuplicatesAndOld(events, textFiltered)
}

/**
* Function for removing old events and duplicates
*
* @param APIevents Events from API
* @param events Events to filter
* @returns Filtered events
*/
export function removeDuplicatesAndOld(APIevents: GetEventProps[], events:
GetEventProps[]): GetEventProps[] {

    // Removes old events and preserves newer version of all events
    const realEvents = APIevents.filter(APIevent =>
        events.some(event => APIevent.id === event.id))

    // Removes duplicates
    const filteredEvents = realEvents.filter((event, index) => {
        return realEvents.findIndex(obj => obj.id === event.id) === index
    })

    return filteredEvents
}
