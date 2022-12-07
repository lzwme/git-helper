#!/usr/bin/env node

import { type StdioOptions } from 'node:child_process';
import { program } from 'commander';
import { color } from 'console-log-colors';
import { getConfig, gitCommit, assign, getHeadBranch, getHeadCommitId, getUserEmail, getHeadDiffFileList, execSync } from './index';

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
  .option('-c, --config-path <filepath>', `配置文件 ${color.yellow(config.configPath)} 的路径`)
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
  .command('run')
  .alias('r')
  .description(color.yellow(` 执行一组或多组（内置的或在配置文件中定义的）预定义命令`))
  .option(`-l, --list`, `查看可执行的命令组`)
  .option(`-u, --update`, `更新：${color.cyan('stash & pull --rebase & stash')}`)
  .option(`-g, --group <groupName...>`, `指定预定义的命令组名。可指定多个，按顺序执行命令组`)
  .action((opts: { list?: boolean; update?: boolean; cmds?: string[] }) => {
    const cmds: typeof config['run']['cmds'] = {};
    const programOpts = program.opts();
    const stdio: StdioOptions = programOpts.silent ? 'pipe' : 'inherit';
    if (programOpts.debug) console.log(opts, programOpts);

    if (opts.list) {
      const list = Object.keys(config.run.cmds).concat(['update']);
      console.log(`可用的命令组：${color.cyanBright(`\n - ${list.join('\n - ')}`)}`);
      return;
    }

    if (opts.update || opts.cmds?.includes('update')) {
      const label = `stash_${Date.now()}`;
      const changed = getHeadDiffFileList(0, config.baseDir);
      if (programOpts.debug) console.log('changed', changed);
      config.run.cmds.update.list = [
        changed.length > 0 ? `git stash save ${label}` : '',
        `git pull -r -n`,
        changed.length > 0 ? `git stash pop ${label}` : '',
      ].filter(Boolean);
      cmds.update = config.run.cmds.update;
    }

    if (Array.isArray(opts.cmds)) {
      opts.cmds.forEach(groupName => {
        if (config.run.cmds[groupName]) cmds[groupName] = config.run.cmds[groupName];
        else console.warn(color.yellow(`未知的命令组：`), color.yellowBright(groupName));
      });
    }

    if (Object.keys(cmds).length === 0) {
      console.log(color.red('未指定任何有效的命令组'));
      return;
    }

    for (const [groupName, item] of Object.entries(cmds)) {
      console.log(`> Run For Group: ${color.cyan(item.desc || groupName)}`);
      for (const cmd of item.list) {
        console.log(` - [cmd]: ${color.greenBright(cmd)}`);
        execSync(cmd, stdio, config.baseDir);
      }
    }
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
