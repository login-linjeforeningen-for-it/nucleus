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
                            ProfileScreen: 'profile',
                            AboutScreen: 'about',
                            BusinessScreen: 'companies',
                            AiScreen: {
                                path: 'ai',
                                alias: ['internal/ai'],
                            },
                            SearchScreen: {
                                path: 'search',
                                alias: ['s'],
                            },
                            StatusScreen: {
                                path: 'status',
                                alias: ['internal/status', 'internal/monitoring'],
                            },
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
                            LoadBalancingScreen: 'internal/loadbalancing',
                            TrafficScreen: 'internal/traffic',
                            TrafficRecordsScreen: 'internal/traffic/records',
                            TrafficMapScreen: 'internal/traffic/map',
                            ContentScreen: 'internal/content',
                            NucleusDocumentationScreen: {
                                path: 'internal/nucleus/documentation',
                                alias: ['nucleus/documentation'],
                            },
                            DatabaseScreen: {
                                path: 'internal/databases',
                                alias: ['internal/db'],
                            },
                            VulnerabilitiesScreen: 'internal/vulnerabilities',
                            LogsScreen: 'internal/logs'
                        }
                    }
                }
            }
        }
    }
}

export default linking
