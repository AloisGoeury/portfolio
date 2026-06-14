import eslint from '@eslint/js';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            'apps/backend/public/**',
            'apps/frontend/.angular/**',
            'coverage/**',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['apps/backend/{src,test}/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        files: ['apps/frontend/src/**/*.ts'],
        plugins: {
            '@angular-eslint': angular,
            '@angular-eslint/template': angularTemplate,
        },
        processor: '@angular-eslint/template/extract-inline-html',
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            ...angular.configs.recommended.rules,
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'app',
                    style: 'kebab-case',
                },
            ],
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'app',
                    style: 'camelCase',
                },
            ],
        },
    },
    {
        files: ['**/*.html'],
        plugins: {
            '@angular-eslint/template': angularTemplate,
        },
        languageOptions: {
            parser: angularTemplateParser,
        },
        rules: {
            ...angularTemplate.configs.recommended.rules,
            ...angularTemplate.configs.accessibility.rules,
        },
    },
);
