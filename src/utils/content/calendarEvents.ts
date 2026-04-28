import config from '@/constants'
import { fetchAdDetails, fetchEventDetails } from '@/utils/fetch'
import { capitalizeFirstLetter } from '@utils/general'

type ItemsToCalendarFormatProps = {
    items: GetEventProps[] | GetJobProps[]
    calendarID: string
    lang: boolean
    isEventScreen: boolean
}

/**
 * Function for formatting items to native calendar format
 *
 * @param {array} item      Items to format
 * @returns                   Native calendar objects
 */
export async function eventsToCalendarFormat({ items, calendarID, lang, isEventScreen }: ItemsToCalendarFormatProps) {
    const formattedEvents = []

    for (const item of items) {
        const event = await fetchEventDetails(item.id)
        const ad = await fetchAdDetails(item.id)
        let location
        let title
        let notes
        let startDate
        let endDate

        if (isEventScreen && event) {
            location = lang
                ? event.location?.name_no || event.location?.name_no || ''
                : event.location?.name_en || event.location?.name_en || ''
            title = lang
                ? event.name_no || event.name_en || ''
                : event.name_en || event.name_no || ''
            const fixedDesc = lang
                ? event.description_no || event.description_en || ''
                : event.description_en || event.description_no || ''

            notes = fixedDesc.replace(/\\n/g, '\n') || undefined
            if (!location.length) location = `${config.login}/events/${item.id}`
            startDate = new Date(event.time_start)
            endDate = new Date(event.time_end)
        } else if (ad) {
            location = ad.cities?.map(city => capitalizeFirstLetter(city)).join(', ') || ''
            title = `${lang ? 'Frist for å søke jobb - ' : 'Deadline to apply - '}`
                + `${lang ? ad.title_no || ad.title_en : ad.title_en || ad.title_no}!`
            const tempShort = lang
                ? ad.description_short_no || ad.description_short_en
                : ad.description_short_en || ad.description_short_no
            const tempLong = lang
                ? ad.description_long_no || ad.description_long_en
                : ad.description_long_en || ad.description_long_no

            const shortDescription = tempShort ? tempShort.replace(/\\n/g, '\n') : ''
            const LongDescription = tempLong ? tempLong.replace(/\\n/g, '\n') : ''
            notes = LongDescription || shortDescription || ''
            if (!location.length) location = `${config.login}/career/${item.id}`
            startDate = new Date(new Date(ad.time_expire).getTime() - 14400000)
            endDate = new Date(ad.time_expire)
        }

        const obj = {
            calendarId: calendarID,
            allDay: false,
            id: `${isEventScreen ? 'e' : 'a'}${item.id}`,
            title, notes, location, startDate, endDate,
            timeZone: 'Europe/Oslo',
            status: 'CONFIRMED',
            availability: 'BUSY',
            alarms: [{ relativeOffset: -30 }]
        }
        formattedEvents.push(obj)
    }

    return formattedEvents
}
