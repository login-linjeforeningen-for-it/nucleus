module.exports = function(api) {
    api.cache(true)

    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-worklets/plugin',
            ["module-resolver", {
                "alias": {
                    "@components": "./src/components",
                    "@themes": "./src/styles/themes",
                    "@assets": "./public/assets",
                    "@text": "./public/text",
                    "@screens": "./src/screens",
                    "@utils": "./src/utils",
                    "@shared": "./src/shared",
                    "@styles": "./src/styles",
                    "@redux": "./src/redux",
                    "@nav": "./src/components/nav",
                    "@": "./src/",
                }
            }],
            ["babel-plugin-inline-import", {
              "extensions": [".svg"]
            }]
        ],
    }
}
