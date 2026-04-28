import config from '@/constants'

export function resolveEventImageUrl(url: string | null | undefined) {
    if (!url) {
        return ''
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    return `${config.cdn}/img/events/${url.replace(/^\/+/, '')}`
}

export function formatEventDate(dateValue: string, lang: boolean) {
    return new Intl.DateTimeFormat(lang ? 'nb-NO' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    }).format(new Date(dateValue))
}

export function formatEventTimeRange(start: string, end: string | null | undefined, lang: boolean) {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : null
    const date = formatEventDate(start, lang)
    const startTime = new Intl.DateTimeFormat(lang ? 'nb-NO' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(startDate)

    if (!endDate || Number.isNaN(endDate.valueOf())) {
        return `${date} • ${startTime}`
    }

    const endTime = new Intl.DateTimeFormat(lang ? 'nb-NO' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(endDate)

    return `${date} • ${startTime} - ${endTime}`
}

export function formatCapacity(event: GetEventProps, lang: boolean) {
    if (!event.capacity) {
        return lang ? 'Ingen grense' : 'No limit'
    }

    if (event.is_full) {
        return lang ? `Fullt (${event.capacity})` : `Full (${event.capacity})`
    }

    return `${event.capacity}`
}

export function getOrganizerName(event: GetEventProps, lang: boolean) {
    switch (event.organization?.shortname) {
        case 'board': return lang ? 'Styret' : 'The Board'
        case 'tekkom': return 'TekKom'
        case 'bedkom': return 'BedKom'
        case 'satkom': return 'SATkom'
        case 'evntkom': return 'EvntKom'
        case 'ctfkom': return 'CTFkom'
        case 's2g': return 'S2G'
        case 'idi': return 'IDI'
        default:
            return event.organization
                ? (lang
                    ? event.organization.name_no || event.organization.name_en
                    : event.organization.name_en || event.organization.name_no)
                : (lang
                    ? event.category.name_no || event.category.name_en
                    : event.category.name_en || event.category.name_no)
    }
}

export function getMazemapUrl(event: GetEventProps) {
    const location = event.location
    const locationName = location?.name_no || location?.name_en || ''
    const organizer = event.organization?.shortname || event.organization?.name_en || ''

    if (!location || location.type !== 'mazemap') {
        return ''
    }

    if (locationName === 'Orgkollektivet') {
        return 'https://link.mazemap.com/tBlfH1oY'
    }

    if (organizer === 'HUSET') {
        return 'https://link.mazemap.com/O1OdhRU4'
    }

    if (location.mazemap_campus_id == null || location.mazemap_poi_id == null) {
        return ''
    }

    return 'https://use.mazemap.com/#v=1'
        + `&campusid=${location.mazemap_campus_id}`
        + `&sharepoitype=poi&sharepoi=${location.mazemap_poi_id}`
}
