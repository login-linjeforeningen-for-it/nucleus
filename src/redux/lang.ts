import { createSlice } from '@reduxjs/toolkit'

// Declares Language Slice
export const LangSlice = createSlice({
    // Slice name
    name: 'lang',
    // Initial state
    initialState: {
        // true is Norwegian, false is English
        lang: true
    },
    // Declares slice reducer
    reducers: {
        // Function to change language
        changeLang(state) {
            state.lang = !state.lang
        },
    }
})

// Exports the change function
export const { changeLang } = LangSlice.actions

// Exports the language slice
export default LangSlice.reducer
