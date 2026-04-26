import { createSlice } from '@reduxjs/toolkit'

// Declares Profile Slice
export const ProfileSlice = createSlice({
    // Slice name
    name: 'profile',
    // Initial state
    initialState: {
        id: null,
        ban: null,
        joinedevents: null,
        name: null,
        allergies: null,
        preferences: null,
        mail: null,
        schoolyear: null,
        degree: null,
        image: null
    },
    // Declares slice reducer
    reducers: {
        setID(state, action) {
            state.id = action.payload
        },
        setName(state, action) {
            state.name = action.payload
        },
        setAllergies(state, action) {
            state.allergies = action.payload
        },
        setPreferences(state, action) {
            state.preferences = action.payload
        },
        setMail(state, action) {
            state.mail = action.payload
        },
        setBan(state, action) {
            state.ban = action.payload
        },
        setJoinedevents(state, action) {
            state.joinedevents = action.payload
        },
        setSchoolyear(state, action) {
            state.schoolyear = action.payload
        },
        setDegree(state, action) {
            state.degree = action.payload
        },
        setImage(state, action) {
            state.image = action.payload
        }
    }
})

// Exports redurcers
export const {
    setID,
    setName,
    setAllergies,
    setPreferences,
    setMail,
    setJoinedevents,
    setSchoolyear,
    setDegree,
    setImage
} = ProfileSlice.actions

// Exports the profile slice
export default ProfileSlice.reducer
