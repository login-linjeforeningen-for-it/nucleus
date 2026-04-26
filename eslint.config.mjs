import config from 'utilbee/eslint'

export default [
    ...config,
    {
        files: ['src/**/*.{ts,tsx}'],
        rules: {
            '@stylistic/max-len': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['src/tests/**/*.{js,ts,tsx}'],
        languageOptions: {
            globals: {
                global: 'readonly',
            },
        },
    },
]
