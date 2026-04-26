import { createSlice } from '@reduxjs/toolkit'

// Declares Misc Slice
export const MiscSlice = createSlice({
    // Slice name
    name: 'misc',
    // Initial state
    initialState: {
        // Title of the screen
        localTitle: {} as { title: string, screen: string },
        // Empty till the user makes a calendar
        calendarID: '',
    },
    // Declares slice reducer
    reducers: {
        // Function for setting the calendar ID
        setCalendarID(state, action) {
            // Sets the calendarID to the payload
            state.calendarID = action.payload
        },
        // Function for setting the screen title
        setLocalTitle(state, action) {
            // Sets the screen title to the payload
            state.localTitle = action.payload
        }
    }
})

// Exports redurcers
export const { setLocalTitle, setCalendarID } = MiscSlice.actions

// Exports the misc slice
export default MiscSlice.reducer
