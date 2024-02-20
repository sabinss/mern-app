/* eslint-env node */
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        project: ['tsconfig.json', 'jest.config.js'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    root: true,
    rules: {
        'no-console': 'error',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/require-await': 'off',
    },
    // ignorePatterns: ['**/*.spec.ts'],
};
