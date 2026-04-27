import { createSlice } from '@reduxjs/toolkit'
import { Abyss, Christmas, Dark, Easter, Light, Sunset } from '@themes/index'

// Declares the theme slice
export const ThemeSlice = createSlice({
    // Names the slice as "theme"
    name: 'theme',
    // Initial state of the slice
    initialState: {
        // Default 0 (dark theme)
        value: 0,
        isDark: true,
        theme: Dark
    },
    // Declares reducers
    reducers: {
        // Function to change theme
        changeTheme(state) {
            // Increments state.theme by 1
            state.value += 1
            state.isDark = isDark(state.value)
            state.theme = findTheme(state.value)
        },
        // Function to reset theme
        resetTheme(state) {
            // Sets it to 0 (dark theme)
            state.value = 0
            state.isDark = isDark(state.value)
            state.theme = Dark
        },
        // Function to change to a specific theme using a number prop
        setTheme(state, action) {
            // Changes theme based on number given
            state.value = action.payload
            state.isDark = isDark(state.value)
            state.theme = findTheme(state.value)
        }
    }
})

/**
 * Checks if the theme is light or dark
 * @param theme Current theme number
 * @returns true if dark, otherwise false
 */
function isDark(theme: number) {
    return theme === 0 || theme === 2 || theme === 3 ? true : false
}

function findTheme(theme: number): Theme {
    switch (theme) {
        case 1: return Light
        case 2: return Abyss
        case 3: return Sunset
        case 4: return Christmas
        case 5: return Easter
    }

    return Dark
}

// Exports functions
export const { changeTheme, resetTheme, setTheme } = ThemeSlice.actions

// Exports the theme slice itself
export default ThemeSlice.reducer
