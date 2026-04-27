import { createSlice } from '@reduxjs/toolkit'

export const LoginSlice = createSlice({
    name: 'login',
    initialState: {
        login: false,
        token: null as string | null,
        groups: [] as string[],
        target: null as string | null
    },
    reducers: {
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

export const { changeLoginStatus, setSession, clearSession } = LoginSlice.actions

export default LoginSlice.reducer
