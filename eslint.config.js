const js = require('@eslint/js');

const nodeGlobals = {
    require: 'readonly',
    module: 'writable',
    __dirname: 'readonly',
    process: 'readonly',
    console: 'readonly',
    fetch: 'readonly',
    URL: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
};

const browserGlobals = {
    document: 'readonly',
    window: 'readonly',
    fetch: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
};

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: { ecmaVersion: 2022 },
        rules: {
            complexity: ['error', 6],
            'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
            'max-lines': ['error', { max: 120, skipBlankLines: true, skipComments: true }],
            'max-params': ['error', 4],
            'no-unused-vars': ['error', { argsIgnorePattern: '^next$' }],
            'no-var': 'error',
            'prefer-const': 'error',
        },
    },
    {
        files: ['src/**/*.js', 'tests/**/*.js', 'eslint.config.js'],
        languageOptions: { sourceType: 'commonjs', globals: nodeGlobals },
    },
    {
        files: ['public/**/*.js'],
        languageOptions: { sourceType: 'script', globals: browserGlobals },
    },
    {
        files: ['tests/**/*.js'],
        rules: { 'max-lines': 'off' },
    },
];