import { createSlice } from '@reduxjs/toolkit'

type NotificationCategory =
    // Notification categories
    'SETUP' | 'IMPORTANT' | 'TEKKOM' | 'CTF' | 'SOCIAL' | 'BEDPRES' |
    'KARRIEREDAG' | 'FADDERUKA' | 'LOGIN' | 'ANNET' |

    // TekKom
    'tekkom10m' | 'tekkom30m' | 'tekkom1h' | 'tekkom2h' | 'tekkom3h' |
    'tekkom6h' | 'tekkom1d' | 'tekkom2d' |

    // CTF
    'ctf10m' | 'ctf30m' | 'ctf1h' | 'ctf2h' | 'ctf3h' | 'ctf6h' |
    'ctf1d' | 'ctf2d' |

    // Social
    'social10m' | 'social30m' | 'social1h' | 'social2h' | 'social3h' |
    'social6h' | 'social1d' | 'social2d' | 'social1w' |

    // Karrieredag
    'karrieredag10m' | 'karrieredag30m' | 'karrieredag1h' | 'karrieredag2h' |
    'karrieredag3h' | 'karrieredag6h' | 'karrieredag1d' | 'karrieredag2d' |
    'karrieredag1w' |

    // Fadderuka
    'fadderuka10m' | 'fadderuka30m' | 'fadderuka1h' | 'fadderuka2h' |
    'fadderuka3h' | 'fadderuka6h' | 'fadderuka1d' | 'fadderuka2d' |
    'fadderuka1w' |

    // Bedpres
    'bedpres10m' | 'bedpres30m' | 'bedpres1h' | 'bedpres2h' | 'bedpres3h' |
    'bedpres6h' | 'bedpres1d' | 'bedpres2d' | 'bedpres1w' |

    // Login
    'login10m' | 'login30m' | 'login1h' | 'login2h' | 'login3h' | 'login6h' |
    'login1d' | 'login2d' | 'login1w' |

    // Annet
    'annet10m' | 'annet30m' | 'annet1h' | 'annet2h' | 'annet3h' | 'annet6h' |
    'annet1d' | 'annet2d' | 'annet1w'


export const NotificationSlice = createSlice({
    // Slice name
    name: 'notification',
    // Initial states, the user will recieve notifications for truthy values.
    initialState: {

        /**
         * Notification categories.
         */

        SETUP: [false, true],
        IMPORTANT: [true, true],
        TEKKOM: [true, true],
        CTF: [true, true],
        SOCIAL: [true, true],
        BEDPRES: [true, true],
        KARRIEREDAG: [true, true],
        FADDERUKA: [true, true],
        LOGIN: [true, true],
        ANNET: [true, true],

        // Notification preferences - for automatic notifications

        // TekKom
        tekkom10m: [false, true],
        tekkom30m: [false, true],
        tekkom1h: [false, true],
        tekkom2h: [false, true],
        tekkom3h: [false, true],
        tekkom6h: [false, true],
        tekkom1d: [false, true],
        tekkom2d: [false, true],

        // Ctf
        ctf10m: [false, true],
        ctf30m: [false, true],
        ctf1h: [false, true],
        ctf2h: [false, true],
        ctf3h: [false, true],
        ctf6h: [false, true],
        ctf1d: [false, true],
        ctf2d: [false, true],

        // Social
        social10m: [false, true],
        social30m: [false, true],
        social1h: [false, true],
        social2h: [false, true],
        social3h: [false, true],
        social6h: [false, true],
        social1d: [false, true],
        social2d: [false, true],
        social1w: [false, true],

        // Karrieredag
        karrieredag10m: [false, true],
        karrieredag30m: [false, true],
        karrieredag1h: [false, true],
        karrieredag2h: [false, true],
        karrieredag3h: [false, true],
        karrieredag6h: [false, true],
        karrieredag1d: [false, true],
        karrieredag2d: [false, true],
        karrieredag1w: [false, true],

        // Fadderuka
        fadderuka10m: [false, true],
        fadderuka30m: [false, true],
        fadderuka1h: [false, true],
        fadderuka2h: [false, true],
        fadderuka3h: [false, true],
        fadderuka6h: [false, true],
        fadderuka1d: [false, true],
        fadderuka2d: [false, true],
        fadderuka1w: [false, true],

        // Bedpres
        bedpres10m: [false, true],
        bedpres30m: [false, true],
        bedpres1h: [false, true],
        bedpres2h: [false, true],
        bedpres3h: [false, true],
        bedpres6h: [false, true],
        bedpres1d: [false, true],
        bedpres2d: [false, true],
        bedpres1w: [false, true],

        // Login
        login10m: [false, true],
        login30m: [false, true],
        login1h: [false, true],
        login2h: [false, true],
        login3h: [false, true],
        login6h: [false, true],
        login1d: [false, true],
        login2d: [false, true],
        login1w: [false, true],

        // Annet
        annet10m: [false, true],
        annet30m: [false, true],
        annet1h: [false, true],
        annet2h: [false, true],
        annet3h: [false, true],
        annet6h: [false, true],
        annet1d: [false, true],
        annet2d: [false, true],
        annet1w: [false, true],
    },

    // Declares slice reducer
    reducers: {
        // Change state of important notifications
        setNotificationStateTrue(state, action) {
            const category: NotificationCategory = action.payload.category
            state[category] = [true, true]
        },
        changeNotificationState(state, action) {
            const category: NotificationCategory = action.payload.category
            state[category] = [!state[category][0], true]
        },
        setNotificationDidUpdateRemotely(state, action) {
            const category: NotificationCategory = action.payload.category
            state[category] = [state[category][0], false]
        }
    }
})

// Exports the change function
export const {
    setNotificationStateTrue,
    changeNotificationState,
    setNotificationDidUpdateRemotely
} = NotificationSlice.actions

// Exports the notification slice
export default NotificationSlice.reducer
