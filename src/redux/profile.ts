import { PayloadAction, createSlice } from '@reduxjs/toolkit'

type ProfilePatch = Partial<Profile> & {
    authentik?: Partial<Profile['authentik']>
}

const initialState: Profile = {
    id: '',
    name: null,
    email: null,
    username: null,
    preferredUsername: null,
    nickname: null,
    givenName: null,
    familyName: null,
    emailVerified: false,
    picture: null,
    groups: [],
    authentik: {
        available: false,
        pk: null,
        uid: null,
        username: null,
        name: null,
        email: null,
        isActive: null,
        lastLogin: null,
        dateJoined: null,
        path: null,
        type: null,
        groups: [],
        attributes: {}
    }
}

export const ProfileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile(state, action: PayloadAction<ProfilePatch>) {
            const { authentik, ...profile } = action.payload

            Object.assign(state, profile)

            if (authentik) {
                Object.assign(state.authentik, authentik)
            }
        },
        clearProfile() {
            return initialState
        },
    }
})

export const { clearProfile, setProfile } = ProfileSlice.actions

export default ProfileSlice.reducer
