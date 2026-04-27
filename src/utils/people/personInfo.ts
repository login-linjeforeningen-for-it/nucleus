import config from '@/constants'

type personInfoProps = {
    person: string
    lang: boolean
}

/**
 * Function for returning the cdn string for each board member.
 *
 * @param {string} verv
 * @returns cdn link as string
 */
export default function personInfo({ person, lang }: personInfoProps) {
    const titleNO = {
        leader: 'Leader',
        coleader: 'Deputy chairman',
        secretary: 'Secretary',
        evntkom: 'EvntKom leader',
        bedkom: 'BedKom leder',
        tekkom: 'TekKom leder',
        ctf: 'CTFkom leader',
        satkom: 'SatKom leader',
        pr: 'PR leader',
        barkom: 'BarKom leder'
    }

    const titleEN = {
        leader: 'Leder',
        coleader: 'Nestleder',
        secretary: 'Sekretær',
        evntkom: 'EvntKom leder',
        bedkom: 'BedKom leader',
        tekkom: 'TekKom leader',
        ctf: 'CTFkom leder',
        satkom: 'SatKom leder',
        pr: 'PR leader',
        barkom: 'BarKom leader'
    }

    const title = lang ? titleNO : titleEN

    const leader = {
        title: title.leader,
        name: 'Tinius Jurgensen Presterud',
        tag: '.tinius',
        dclink: 'https://discordapp.com/users/284712326030950410',
        img: `${config.portrait}/leder.jpg`
    }

    const coleader = {
        title: title.coleader,
        name: 'Daoud Chaudhry',
        tag: 'dahood018784',
        dclink: 'https://discordapp.com/users/428285256467087383',
        img: `${config.portrait}/nestleder.jpg`,
    }

    const secretary = {
        title: title.secretary,
        name: 'Jørgen Arnesen-Lerudsmoen',
        tag: 'jorgen03',
        dclink: 'https://discordapp.com/users/163668247982505984',
        img: `${config.portrait}/sekret%C3%A6r.jpg`,
    }

    const evntkom = {
        title: title.evntkom,
        name: 'Caroline Madelén Lau-Revil',
        tag: 'carolinemadelen0574',
        dclink: 'https://discordapp.com/users/890926400314429511',
        img: `${config.portrait}/evntkom.jpg`,
    }

    const bedkom = {
        title: title.bedkom,
        name: 'Sander Clausen',
        tag: 'clausen03',
        dclink: 'https://discordapp.com/users/526072193235419146',
        img: `${config.portrait}/bedkom.jpg`
    }

    const tekkom = {
        title: title.tekkom,
        name: 'Adam Dariusz Rytel',
        tag: 'adamdarek',
        dclink: 'https://discordapp.com/users/222767435198103553',
        img: `${config.portrait}/tekkom.jpg`,
    }

    const ctfkom = {
        title: title.ctf,
        name: 'Maja Melby',
        tag: 'majam_',
        dclink: 'https://discordapp.com/users/1011661501536407552',
        img: `${config.portrait}/ctfkom.jpg`,
    }

    const satkom = {
        title: title.satkom,
        name: 'Mohaymen Al-Diaami',
        tag: 'sygor',
        dclink: 'https://discordapp.com/users/1003701353937391616',
        img: `${config.portrait}/satkom.jpg`
    }

    const pr = {
        title: title.pr,
        name: 'Andrea Karense Magnussen Øksendal',
        tag: 'andreakarense',
        dclink: 'https://discordapp.com/users/566664434995691540',
        img: `${config.portrait}/pr.jpg`
    }

    const barkom = {
        title: title.barkom,
        name: 'Frikk Brændsrød',
        tag: 'frikk.',
        dclink: 'https://discordapp.com/users/277153635832561675',
        img: `${config.portrait}/barkom.jpg`
    }

    switch (person.toLowerCase()) {
        case 'leader': return leader
        case 'coleader': return coleader
        case 'secretary': return secretary
        case 'evntkom': return evntkom
        case 'pr': return pr
        case 'ctf': return ctfkom
        case 'eco': return satkom
        case 'bedkom': return bedkom
        case 'barkom': return barkom
        default: return tekkom
    }
}
