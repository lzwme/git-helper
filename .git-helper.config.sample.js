/**
 * @type {import('./').IConfig}
 */
 module.exports = {
  debug: false,
  baseDir: process.cwd(),
  commit: {
    messageReg: /^(fix|feat|pref|test|doc):.+/,
    push: true,
    noVerify: false,
  },
  run: {
    cmds: {
      test: {
        desc: 'test',
        list: ['npm run lint', 'npm run test']
      },
    },
  },
};
