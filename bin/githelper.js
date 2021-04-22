#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');
const chalk = require('chalk');
const { getConfig, gitCommit, assign } = require('../');

let config = getConfig(null, false);
const initConfig = (cfg) => {
  const options = program.opts();
  assign(options, cfg);
  config = getConfig(options, false);
}

program
    .aliases(['gh'])
    .version(pkg.version, '-v, --version')
    .description(chalk.yellow(pkg.description) + ` [version@${chalk.cyanBright(pkg.version)}]`)
    .option('-c, --config-path [filepath]', `配置文件 ${chalk.yellow(config.configPath)} 的路径`)
    .option('--debug', `开启调试模式。`, false);

program
  .command('c')
  .aliases(['cm', 'commit'])
  .description(chalk.yellow(' 执行 git 提交相关的动作，包括 add、commit、pull 及 push 等'))
  .option('-m, --message [message]', 'git 提交注释内容')
  .option('-r, --messageReg', 'message 提交注释的验证规则，建议写在配置文件中')
  .option('-a, --amend', '是否修改上一次提交')
  .option('-n, --noVerify', '是否跳过 git hooks')
  .option('-p, --push', '是否执行 git push')
  .option('--no-push', '是否不执行 git push')
  .option('--pull', '是否执行 git pull --rebase', true)
  .option('--no-pull', '是否不执行 git pull --rebase')
  .option('--debug', '是否打印调试信息')
  .action((commit) => {
    if (commit.debug) config.debug = true;
    if (commit.messageReg) commit.messageReg = new RegExp(commit.messageReg);

    initConfig({commit });

    if (config.debug) {
      console.log(commit);
      console.log(chalk.cyanBright('CONFIG:'), config);
    }

    gitCommit(null);
  });


program.parse(process.argv);
