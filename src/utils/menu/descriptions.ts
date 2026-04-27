export type MenuDescriptionMap = Record<string, string>

export function getMenuDescriptions(lang: boolean): MenuDescriptionMap {
    return {
        SettingScreen: lang ? 'App, språk og varsler' : 'App, language, and notification settings',
        NotificationScreen: lang ? 'Se siste varsler og oppdateringer' : 'See your latest alerts and updates',
        AboutScreen: lang ? 'Les om Login, komiteene og folkene' : 'Read about Login, the committees, and the people',
        BusinessScreen: lang ? 'Informasjon for bedrifter og samarbeid' : 'Information for companies and partnerships',
        CourseScreen: lang ? 'Emner, eksamener og studentverktøy' : 'Courses, exams, and student tools',
        GameScreen: lang ? 'Festspill og raske icebreakers' : 'Party games and quick icebreakers',
        AiScreen: lang ? 'Chat med Login AI direkte i appen' : 'Chat with Login AI directly in the app',
        QueenbeeScreen: lang ? 'Intern oversikt og administrative verktøy' : 'Internal overview and administrative tools',
        DashboardScreen: lang ? 'Siste aktivitet og oppdateringer' : 'Latest activity and updates',
        StatusScreen: lang ? 'Driftsstatus for Login sine tjenester' : 'Operational status for Login\'s services',
        SearchScreen: lang ? 'Søk og åpne direkte fra appen' : 'Search and open directly from the app',
        MusicScreen: lang ? 'Live musikkstatistikk fra Login' : 'Live music statistics from Login',
        AlbumsScreen: lang ? 'Bilder fra diverse arrangementer' : 'Photos from various events',
        FundScreen: lang ? 'Fondet, søknader og beholdning' : 'The fund, applications, and holdings',
        VervScreen: lang ? 'Komiteer, verv og søknad' : 'Committees, roles, and applications',
        PolicyScreen: lang ? 'Personvern og app-policy' : 'Privacy and app policy',
        PwnedScreen: lang ? 'Lås skjermen, ellers...' : 'Lock your screen, or else...',
    }
}
