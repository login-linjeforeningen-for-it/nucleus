import { createSlice } from '@reduxjs/toolkit'
import { filterEvents, setCategories } from './helpers/eventFilters'

export const EventSlice = createSlice({
    name: 'event',
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
            state.renderedEvents = filterEvents({
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
            state.renderedEvents = filterEvents({
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
