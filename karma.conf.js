/* eslint-disable import/no-extraneous-dependencies */
const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');

module.exports = (config) => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        // runs all files ending with .test in the test folder,
        // can be overwritten by passing a --grep flag. examples:
        //
        // npm run test -- --grep test/foo/bar.test.js
        // npm run test -- --grep test/bar/*
        {
          pattern: config.grep ? config.grep : 'test/**/*.test.js',
          type: 'module'
        },
        {
          pattern: 'node_modules/prismjs/prism.js',
          type: 'js'
        }
      ],

      // see the karma-esm docs for all options
      esm: {
        // if you are using 'bare module imports' you will need this option
        nodeResolve: true
      },

      coverageIstanbulReporter: {
        thresholds: {
          global: {
            statements: 80,
            branches: 80,
            functions: 89,
            lines: 80
          }
        }
      },
    })
  );
  return config;
};
