#!/usr/bin/env node

import { program } from 'commander';
import { color } from 'console-log-colors';
import { getConfig, gitCommit, assign, getHeadBranch, getHeadCommitId, getUserEmail } from './index';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

const startTime = Date.now();
let config = getConfig(undefined, false);
const initConfig = cfg => {
  const options = program.opts();
  assign(options, cfg);
  config = getConfig(options, false);

  if (config.debug) console.log(color.cyanBright('CONFIG:'), config);
};

program
  .aliases(['gh'])
  .version(pkg.version, '-v, --version')
  .description(color.yellow(pkg.description) + ` [version@${color.cyanBright(pkg.version)}]`)
  .option('-c, --config-path [filepath]', `配置文件 ${color.yellow(config.configPath)} 的路径`)
  .option('-s, --silent', '开启静默模式，只打印必要的信息')
  .option('--debug', `开启调试模式。`, false);

program
  .command('commit')
  .aliases(['c', 'cm'])
  .description(color.yellow(' 执行 git 提交相关的动作，包括 add、commit、pull 及 push 等'))
  .option('-m, --message [message]', 'git 提交注释内容')
  .option('-r, --messageReg', 'message 提交注释的验证规则，建议写在配置文件中')
  .option('-a, --amend', '是否修改上一次提交')
  .option('-n, --noVerify', '是否跳过 git hooks')
  .option('-p, --push', '是否执行 git push')
  .option('--no-push', '是否不执行 git push')
  .option('-P, --pull', '是否执行 git pull --rebase')
  .option('-N, --no-pull', '是否不执行 git pull --rebase')
  .action(opts => {
    if (opts.messageReg) opts.messageReg = new RegExp(opts.messageReg);

    initConfig({ commit: opts });
    if (config.debug) console.log(opts);

    gitCommit();
    logEnd();
  });

program
  .command('util')
  .aliases(['u', 'utils'])
  .description(color.yellow(' 提供常用的 git 快捷工具类功能'))
  .option('-b, --head-branch', '获取当前的本地分支名')
  .option('-i, --commit-id', '获取当前分支的 commitId')
  .option('-u, --upstream-id', '获取远端 upstream 的 commitId')
  .option('-e, --user-email', 'get user email')
  .action(opts => {
    // initConfig({ utils: opts });
    if (config.debug) console.log(opts);

    if (opts.headBranch) console.log(color.yellowBright('Head Branch:'), getHeadBranch());
    if (opts.commitId) console.log(color.yellowBright('Local CommitId:'), getHeadCommitId(false));
    if (opts.upstreamId) console.log(color.yellowBright('Upstream CommitId:'), getHeadCommitId(true));
    if (opts.userEmail) console.log(color.yellowBright('User Email:'), getUserEmail());
    logEnd();
  });

program.parse(process.argv);

function logEnd() {
  const constTime = Date.now() - startTime;
  console.log(`\n[${color.greenBright(new Date().toTimeString().slice(0, 8))}] Done in ${constTime}ms.`);
}
