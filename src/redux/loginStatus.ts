import { createSlice } from "@reduxjs/toolkit"

// Declares Login status slice
export const LoginSlice = createSlice({
    // Slice name
    name: "login",
    // Initial state
    initialState: {
        // true is logged in, false is logged out
        login: false,
        token: null as string | null,
        groups: [] as string[],
        target: null as string | null
    },
    // Declares slice reducer
    reducers: {
        // Function to change login status
        changeLoginStatus(state) {
            state.login = !state.login
        },
        setSession(state, action) {
            state.login = true
            state.token = action.payload.token
            state.groups = action.payload.groups || []
            state.target = action.payload.target || null
        },
        clearSession(state) {
            state.login = false
            state.token = null
            state.groups = []
            state.target = null
        }
    }
})

// Exports change login status function
export const { changeLoginStatus, setSession, clearSession } = LoginSlice.actions

// Exports the login status slice
export default LoginSlice.reducer
