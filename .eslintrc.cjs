module.exports = {
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },

    env: {
        browser: true,
    },

    extends: [
        'eslint:recommended',
        // '@typhonjs-fvtt/eslint-config-foundry.js/0.8.0',
        'plugin:jest/recommended',
        'plugin:prettier/recommended',
        "@typhonjs-config/eslint-config/esm/2022/browser",
        "@typhonjs-fvtt/eslint-config-foundry.js"
    ],

    plugins: ['jest'],

    // choices or "off", "warn", and "error"
    rules: {
        // Specify any specific ESLint rules.
        'brace-style': [2, "stroustrup"],
        "no-unused-vars": ["off", { "argsIgnorePattern": "^_" }],
        "space-before-function-paren": ["error", { "anonymous": "always", "named": "never", "asyncArrow": "always" }],
    },

    ignorePatterns: [
        ".eslintrc.cjs",
        "gulpfile.js",
    ],

    globals: {
        "libWrapper": "readonly",
        "PIXI": "readonly",
        "warpgate": "readonly",
        "RollPF": "readonly",
    },

    overrides: [
        {
            files: ['./*.js', './*.cjs'],
            env: {
                node: true,
            },
        },
        {
            files: ['./test/**/*.js'],
            env: {
                'jest/globals': true,
            },
        },
    ],
};
