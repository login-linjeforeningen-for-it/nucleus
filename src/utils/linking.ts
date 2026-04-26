import { LinkingOptions } from '@react-navigation/native'
import * as Linking from 'expo-linking'

const prefix = Linking.createURL('/')

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [prefix, 'login://', 'https://login.no', 'https://www.login.no'],
    config: {
        screens: {
            Tabs: {
                initialRouteName: 'EventNav',
                screens: {
                    EventNav: {
                        path: 'events',
                        screens: {
                            SpecificEventScreen: {
                                path: ':eventID',
                                parse: {
                                    eventID: Number
                                }
                            }
                        }
                    },
                    AdNav: {
                        path: 'career',
                        screens: {
                            SpecificAdScreen: {
                                path: ':adID',
                                parse: {
                                    adID: Number
                                }
                            }
                        }
                    },
                    MenuNav: {
                        screens: {
                            AboutScreen: 'about',
                            BusinessScreen: 'companies',
                            AiScreen: 'ai',
                            SearchScreen: {
                                path: 'search',
                                alias: ['s'],
                            },
                            StatusScreen: 'status',
                            MusicScreen: 'music',
                            AlbumsScreen: 'albums',
                            FundScreen: 'fund',
                            VervScreen: 'verv',
                            PolicyScreen: 'policy',
                            PwnedScreen: 'pwned',
                            SpecificAlbumScreen: {
                                path: 'albums/:albumID',
                                parse: {
                                    albumID: Number
                                }
                            },
                            QueenbeeScreen: 'internal',
                            VulnerabilitiesScreen: 'internal/vulnerabilities'
                        }
                    }
                }
            }
        }
    }
}

export default linking
