'use strict';

const { createConfig } = require('@origin-1/eslint-config');

module.exports =
createConfig
(
    {
        files:          ['*.cjs', '*.js', '*.mjs'],
        env:            { 'node': true },
        jsVersion:      2020,
    },
    {
        files:          '*.mjs',
        parserOptions:  { sourceType: 'module' },
    },
    {
        files:          '*.ts',
        tsVersion:      'latest',
        parserOptions:  { project: 'tsconfig.json' },
    },
    {
        files:          'dev/*',
        jsVersion:      2022,
    },
);
