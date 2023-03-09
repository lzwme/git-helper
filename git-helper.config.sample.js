/**
 * @type {import('./').IConfig}
 */
module.exports = {
  // debug: false,
  // baseDir: process.cwd(),
  commit: {
    // messageReg: /^(fix|feat|pref|test|doc):.+/,
    // noVerify: false,
    pull: true,
  },
  run: {
    cmds: {
      // gh r -g test
      // test: {
      //   desc: 'test',
      //   list: ['npm run lint', 'npm run test']
      // },
    },
  },
};
