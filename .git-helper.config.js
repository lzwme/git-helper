/**
 * @type {import('./dist').IConfig}
 */
 module.exports = {
  configPath: ".git-helper.config.js",
  debug: false,
  baseDir: process.cwd(),
  commit: {
    // messageReg: /^(fix|feat|pref|test|doc):.+/,
    push: false,
    pull: false,
    noVerify: false,
  },
};
