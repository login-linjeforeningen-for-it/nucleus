import { LinkingOptions } from "@react-navigation/native"
import * as Linking from "expo-linking"
import { RootStackParamList } from "../types/screenTypes"

// APP.js config
// "intentFilters": [
// {
//     "action": "VIEW",
//     "autoVerify": true,
//     "data": [
//       {
//         "scheme": "https",
//         "host": "login.no",
//         "pathAdvancedPattern": "/events/[0-9]*"
//       },
//       {
//           "scheme": "https",
//           "host": "login.no",
//           "pathAdvancedPattern": "/career/[0-9]*"
//       },
//       {
//           "scheme": "https",
//           "host": "login.no",
//           "pathAdvancedPattern": "/about"
//       },
//       {
//           "scheme": "https",
//           "host": "login.no",
//           "pathAdvancedPattern": "/companies"
//       }
//     ],
//     "category": ["BROWSABLE", "DEFAULT"]
//   }
// ]
// "entitlements": {
//     "com.apple.developer.associated-domains": [
//         "applinks:login.no"
//     ]
// }

const prefix = Linking.createURL('/')

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [prefix, 'login://', 'https://login.no'],
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
                            BusinessScreen: 'companies'
                        }
                    }
                }
            }
        }
    }
}

export default linking
