import {
    cleanMarkdown,
    filterByContentQuery,
    formatContentDate,
    formatLocationDetails,
    matchesContentQuery,
} from '@utils/content/content'

describe('content helper behavior', () => {
    it('filters rows across localized fields and ignores casing/spacing', () => {
        const rows = [
            { id: 1, name_no: 'Arrangementregler', name_en: 'Event rules' },
            { id: 2, name_no: 'Kontoret', name_en: 'Office' },
        ]

        expect(filterByContentQuery(rows, '  office ', (row) => [row.name_no, row.name_en])).toEqual([rows[1]])
        expect(filterByContentQuery(rows, '', (row) => [row.name_no, row.name_en])).toBe(rows)
    })

    it('matches numbers, missing values, and mixed value types safely', () => {
        expect(matchesContentQuery(['MazeMap', 1341, null, undefined], '1341')).toBe(true)
        expect(matchesContentQuery(['MazeMap', 1341, null, undefined], 'discord')).toBe(false)
    })

    it('formats markdown, dates, and location details for compact cards', () => {
        const location = {
            id: 1,
            name_no: 'Kontoret',
            name_en: 'Office',
            type: 'physical',
            address_street: 'Teknologivegen 22',
            address_postcode: 2815,
            city_name: 'Gjovik',
            mazemap_campus_id: 1,
            mazemap_poi_id: 42,
            url: 'https://login.no',
            created_at: '2026-04-26T00:00:00Z',
            updated_at: '2026-04-26T00:00:00Z',
        } as WorkerbeeLocation

        expect(cleanMarkdown(' **Hei**\r\nDer ')).toBe('Hei\nDer')
        expect(formatLocationDetails(location, 'empty')).toBe(
            'Teknologivegen 22 · 2815 · Gjovik · campus 1 · poi 42 · https://login.no',
        )
        expect(formatLocationDetails({} as WorkerbeeLocation, 'empty')).toBe('empty')
        expect(formatContentDate('not-a-date')).toBe('not-a-date')
    })
})
