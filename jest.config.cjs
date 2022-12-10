// const fs = require('node:fs');
// const tsToJs = fs.readdirSync('./src').filter(d => d.endsWith('.ts')).map(d => d.replace(/\.ts$/, ''));

/** @type {import('@jest/types').Config.InitialOptions } */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/cli.ts', 'src/index.ts'],
  collectCoverageFrom: ['src/**/!(*.d).ts'],
  maxWorkers: require('os').cpus().length,
  moduleNameMapper: {
    // [`(.+)/(${tsToJs.join('|')}).js`]: '$1/$2.ts',
  },
  resolver: '<rootDir>/scripts/jest-js-ts-resolver.cjs',
};
