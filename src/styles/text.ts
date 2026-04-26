import { StyleSheet, Dimensions } from 'react-native'
const aspectRatio = Dimensions.get('window').height / Dimensions.get('window').width

function adjustForAspectRatio(size: number) {
    if (aspectRatio < 1.7) {
        return size - 2
    }

    return size
}

export const T = StyleSheet.create({
    // Red text - used when
    red: {
        alignSelf: 'center',
        color: 'red',
        fontSize: adjustForAspectRatio(15)
    },
    // Location missing error text
    locationError: {
        top: 2,
        left: 8,
        alignSelf: 'center',
        color: 'red',
        fontSize: adjustForAspectRatio(15)
    },
    // Text of size 10
    text10: {
        fontSize: adjustForAspectRatio(10)
    },
    // Text of size 12
    text12: {
        fontSize: adjustForAspectRatio(12)
    },
    // Text of size 15
    text15: {
        fontSize: adjustForAspectRatio(15)
    },
    // Text of size 16
    text16: {
        fontSize: adjustForAspectRatio(16)
    },
    // Text of size 17.5
    text175: {
        fontSize: adjustForAspectRatio(17.5)
    },
    // Text of size 18
    text18: {
        fontSize: adjustForAspectRatio(18)
    },
    // Text of size 24
    text24: {
        fontSize: adjustForAspectRatio(24)
    },
    // Text of size 32
    text32: {
        fontSize: adjustForAspectRatio(32)
    },
    // Bold text of size 40
    bold40: {
        fontSize: adjustForAspectRatio(40),
        fontWeight: 'bold',
    },
    // Bold text of size 25 (used for a few words per line max)
    bold25: {
        fontSize: adjustForAspectRatio(25),
        fontWeight: 'bold',
    },
    // Bold text of size 28 (30 is too big when bold)
    bold28: {
        maxWidth: '89%',
        alignSelf: 'center',
        fontSize: adjustForAspectRatio(28),
        fontWeight: 'bold',
    },
    // Text of size 30
    text30: {
        fontSize: adjustForAspectRatio(30),
    },
    // Text of size 25
    text25: {
        fontSize: adjustForAspectRatio(25),
    },
    // Text of size 20
    text20: {
        fontSize: adjustForAspectRatio(20),
    },
    // Centered text of size 30
    centered: {
        alignSelf: 'center',
        fontSize: adjustForAspectRatio(30),
    },
    // Centered text of size 10
    centered10: {
        alignSelf: 'center',
        fontSize: adjustForAspectRatio(10),
    },
    // Centered text of size 15
    centered15: {
        alignSelf: 'center',
        fontSize: adjustForAspectRatio(15),
    },
    // Orange centered text of size 15
    orangeCentered15: {
        alignSelf: 'center',
        fontSize: adjustForAspectRatio(15),
        textDecorationLine: 'underline',
    },
    // Centered text of size 20
    centered20: {
        textAlign: 'center',
        fontSize: adjustForAspectRatio(20),
    },
    // Centered text of size 15 for the contact screen
    contact: {
        alignSelf: 'center',
        fontSize: adjustForAspectRatio(15),
    },
    // Centered bold text of size 25 (used for a few words per line max)
    centeredBold25: {
        fontWeight: 'bold',
        alignSelf: 'center',
        fontSize: adjustForAspectRatio(25),
    },
    // Centered bold text of size 20
    centeredBold20: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: adjustForAspectRatio(20),
    },
    // Centered text of size 50
    centered50: {
        alignSelf: 'center',
        fontSize: adjustForAspectRatio(50),
    },
    // Used for paragraphs, size 15
    paragraph: {
        fontSize: adjustForAspectRatio(15),
    },
    // Orange text of size 15
    orange15: {
        color: '#fd8738',
        fontSize: adjustForAspectRatio(15),
    },
    // Committee leader title text
    leaderTitle: {
        left: '17.5%',
        color: '#fd8738',
        fontSize: adjustForAspectRatio(20),
        fontWeight: 'bold',
        marginBottom: 5
    },
    // Committee leader name text
    leaderName: {
        left: '17.5%',
        fontSize: adjustForAspectRatio(20),
        marginBottom: 5
    },
    // Committee leader discord text
    discord: {
        left: '16.5%',
        fontSize: adjustForAspectRatio(20),
        textDecorationLine: 'underline',
    },
    // Bold text with line next to it
    boldWithLine: {
        left: 5,
        fontSize: adjustForAspectRatio(15),
        fontWeight: 'bold',
    },
    // Used for bold paragraphs, size 15
    boldParagraph: {
        maxWidth: '100%',
        fontSize: adjustForAspectRatio(15),
        fontWeight: 'bold',
    },
    // Copyright text (size: 10)
    copyright: {
        textAlign: 'center',
        fontSize: adjustForAspectRatio(10),
        marginVertical: 10
    },
    // DpecificEventInfo text (+10px from left)
    specificEventInfo: {
        fontSize: adjustForAspectRatio(18),
    },
    specificEventInfoContent: {
        fontSize: adjustForAspectRatio(20),
        maxWidth: 240
    },
    // Text used for filter categories
    filterCategoryText: {
        fontSize: adjustForAspectRatio(12),
        left: 5,
    },
    // Mazemap text on SES
    mazemap: {
        textDecorationLine: 'underline',
        fontSize: adjustForAspectRatio(18),
    },
})

export default T
