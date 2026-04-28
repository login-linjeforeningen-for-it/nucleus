import { setCalendarID } from '@redux/misc'
import { Platform } from 'react-native'
import { UnknownAction, Dispatch } from 'redux'
import {
    requestCalendarPermissionsAsync,
    getDefaultCalendarAsync,
    createCalendarAsync,
    CalendarAccessLevel,
    getCalendarsAsync,
    updateEventAsync,
    createEventAsync,
    getEventsAsync,
    EntityTypes,
    Availability,
    EventStatus,
} from 'expo-calendar'
import { eventsToCalendarFormat } from './calendarEvents'

type handleDownloadProps = {
    items: GetEventProps[] | GetJobProps[]
    calendarID: string
    dispatch: Dispatch<UnknownAction>
    lang: boolean
    isEventScreen: boolean
}

type updateCalendarProps = {
    items: GetEventProps[] | GetJobProps[]
    calendarID: string
    lang: boolean
    isEventScreen: boolean
}

type executeDownloadProps = {
    items: GetEventProps[] | GetJobProps[]
    calendarID: string
    dispatch: Dispatch<UnknownAction>
    lang: boolean
    isEventScreen: boolean
}

/**
 * Handles press of download button, changes color of the button
 * and downloads if more than 3 seconds since last download
 *
 * @see executeDownload Executes the download if permitted
 */
export default async function handleDownload({ items, calendarID,
    dispatch, lang, isEventScreen }: handleDownloadProps) {
    await executeDownload({ items, calendarID, dispatch, lang, isEventScreen })
}

/**
 * Adds the passed items to the default calendar of the phone
 * @param item Items to add to calendar
 * @param calendarID ID of the calendar to add the items to
 */
export async function updateCalendar({ items, calendarID, lang, isEventScreen }: updateCalendarProps) {
    const { status } = await requestCalendarPermissionsAsync()

    if (status !== 'granted') return

    const calendarEvents = await getEventsAsync(
        [calendarID],
        // Start date = 24 hours ago
        new Date(Date.now() - 86400000),
        // End date = 1 year from now
        new Date(Date.now() + 31536000000)
    )

    const formattedEvents = await eventsToCalendarFormat({ items, calendarID, lang, isEventScreen })

    for (const event of formattedEvents) {
        // Find the matching event in the formatted events array
        const matchingEvent = calendarEvents.find(e => e.title === event.title)
        const newObj = {
            title: event.title,
            notes: event.notes,
            location: event.location,
            startDate: event.startDate,
            endDate: event.endDate,
        }

        // Update the event in the calendar
        if (matchingEvent) {
            await updateEventAsync(matchingEvent.id, newObj)
        } else {
            await createEventAsync(calendarID, {
                ...event,
                status: event.status as unknown as EventStatus,
                availability: event.availability as unknown as Availability
            })
        }
    }
}

/**
 * Function for checking if a given calendar still exists
 *
 * @returns boolean
 */
async function calendarExists(calendarID: string) {
    const { status } = await requestCalendarPermissionsAsync()

    if (status !== 'granted') return

    try {
        const calendars = await getCalendarsAsync(EntityTypes.EVENT)
        return calendars.find(calendar => calendar.id === calendarID)
    } catch (error) {
        console.log(error)
    }
}

/**
 * Creates a calendar in the default calendar app of the device
 *
 * @param {array} items Items to include in the calendar
 */
async function createCalendar(items: GetEventProps[] | GetJobProps[], lang: boolean, isEventScreen: boolean) {
    const { status } = await requestCalendarPermissionsAsync()

    if (status !== 'granted') return

    try {
        const defaultCalendarSource = Platform.OS === 'ios'
            ? await getDefaultCalendarSource()
            : { isLocalAccount: true, name: 'Login', id: '', type: '' }

        if (!defaultCalendarSource) {
            throw new Error('Default calendar source is undefined')
        }

        const calendarID = await createCalendarAsync({
            title: 'Login',
            color: '#fd8738',
            entityType: EntityTypes.EVENT,
            sourceId: defaultCalendarSource.id,
            source: defaultCalendarSource,
            name: 'internalCalendarName',
            ownerAccount: 'personal',
            accessLevel: CalendarAccessLevel.OWNER,
        })

        await updateCalendar({ items, calendarID, lang, isEventScreen })

        return calendarID
    } catch (error) {
        console.log(error)
    }
}

/**
 * Function for fetching the default calendar source of the device
 *
 * @returns Default source
 */
async function getDefaultCalendarSource() {
    const { status } = await requestCalendarPermissionsAsync()

    if (status !== 'granted') return

    try {
        const defaultCalendar = await getDefaultCalendarAsync()
        return defaultCalendar.source
    } catch (error) {
        console.log(error)
    }
}

/**
 * Executes the download itself, updates existing calendar or creates a new calendar if no calendar exists.
 *
 * @param item Array of items the user wants to download
 *
 * @see calendarExists  Checks if the calendar storage is defined and if it still exists on the device
 * @see setCalendarID   Stores the ID of a new calendar in localstorage
 * @see updateCalendar  Updates the items for a calendar that is found
 * @see createCalendar  Creates a new calendar if no calendar is to be found
 */
async function executeDownload({ items, calendarID, dispatch, lang, isEventScreen }: executeDownloadProps) {
    if (typeof await calendarExists(calendarID) != 'undefined') {
        await updateCalendar({ items, calendarID, lang, isEventScreen })
    } else {
        dispatch(setCalendarID(await createCalendar(items, lang, isEventScreen)))
    }
}
