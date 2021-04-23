#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');
const chalk = require('chalk');
const { getConfig, gitCommit, assign, getHeadBranch, getHeadCommitId } = require('../');

let config = getConfig(null, false);
const initConfig = (cfg) => {
  const options = program.opts();
  assign(options, cfg);
  config = getConfig(options, false);

  if (config.debug) console.log(chalk.cyanBright('CONFIG:'), config);
}

program
    .aliases(['gh'])
    .version(pkg.version, '-v, --version')
    .description(chalk.yellow(pkg.description) + ` [version@${chalk.cyanBright(pkg.version)}]`)
    .option('-c, --config-path [filepath]', `配置文件 ${chalk.yellow(config.configPath)} 的路径`)
    .option('--debug', `开启调试模式。`, false);

program
  .command('commit')
  .aliases(['c', 'cm'])
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
    if (commit.messageReg) commit.messageReg = new RegExp(commit.messageReg);

    const cfg = { commit };
    if (commit.debug) cfg.debug = true;
    initConfig(cfg);
    if (config.debug) console.log(commit);

    gitCommit(null);
  });

  program
  .command('util')
  .aliases(['u', 'utils'])
  .description(chalk.yellow(' 提供常用的 git 快捷工具类功能'))
  .option('-b, --head-branch', '获取当前的本地分支名')
  .option('-i, --commitId', '获取当前分支的 commitId')
  .option('--remote-id', '获取远端 upstream 的 commitId')
  .option('--debug', '是否打印调试信息')
  .action((opts) => {
    const cfg = { utils: opts };
    if (opts.debug) cfg.debug = true;
    initConfig(cfg);

    if (config.debug) console.log(opts);

    if (opts.headBranch) return getHeadBranch();
    if (opts.commitId || opts.remoteId) return getHeadCommitId(opts.remoteId);
  });


program.parse(process.argv);
