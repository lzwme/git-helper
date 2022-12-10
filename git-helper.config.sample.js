/**
 * @type {import('./').IConfig}
 */
export default {
  debug: false,
  baseDir: process.cwd(),
  commit: {
    messageReg: /^(fix|feat|pref|test|doc):.+/,
    pull: true,
    noVerify: true,
  },
  run: {
    cmds: {
      // test: {
      //   desc: 'test',
      //   list: ['npm run lint', 'npm run test']
      // },
    },
  },
};
