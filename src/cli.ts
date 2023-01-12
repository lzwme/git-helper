#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type StdioOptions } from 'node:child_process';
import { program } from 'commander';
import { color } from 'console-log-colors';
import { getConfig, type IConfig } from './config.js';
import { gitCommit, assign, getHeadBranch, getHeadCommitId, getUserEmail, getHeadDiffFileList, execSync } from './index.js';

const flhSrcDir = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(flhSrcDir, '../package.json'), 'utf8'));

const startTime = Date.now();
const initConfig = async (cfg?: IConfig) => {
  const options = program.opts();
  if (cfg) assign(options, cfg);
  const config = await getConfig(options, false);

  if (config.debug) console.log(color.cyanBright('CONFIG:'), config);
  return config;
};

program
  .aliases(['gh'])
  .version(pkg.version, '-v, --version')
  .description(color.yellow(pkg.description) + ` [version@${color.cyanBright(pkg.version)}]`)
  .option('-c, --config-path <filepath>', `配置文件 ${color.yellow('git-helper.config.js')} 的路径`)
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
  .action(async opts => {
    if (opts.messageReg) opts.messageReg = new RegExp(opts.messageReg);

    const config = await initConfig({ commit: opts });
    if (config.debug) console.log(opts);
    await gitCommit(config);
    logEnd();
  });

program
  .command('run')
  .alias('r')
  .allowUnknownOption(true)
  .description(color.yellow(` 执行一组或多组（内置的或在配置文件中定义的）预定义命令`))
  .option(`-l, --list`, `查看可执行的命令组`)
  .option(`-u, --update`, `更新：${color.cyan('stash & pull --rebase & stash')}`)
  .option(`-g, --group <groupName...>`, `指定预定义的命令组名。可指定多个，按顺序执行命令组`)
  .action(async (opts: { list?: boolean; update?: boolean; cmds?: string[] }) => {
    const config = await initConfig();
    const cmds: IConfig['run']['cmds'] = {};
    const stdio: StdioOptions = config.silent ? 'pipe' : 'inherit';
    if (config.debug) console.log(opts);

    if (opts.list) {
      const list = Object.keys(config.run.cmds).concat(['update']);
      console.log(`可用的命令组：${color.cyanBright(`\n - ${list.join('\n - ')}`)}`);
      return;
    }

    if (opts.update || opts.cmds?.includes('update')) {
      const label = `gh_${Date.now()}`;
      const changed = getHeadDiffFileList(0, config.baseDir);
      if (config.debug) console.log('changed', changed);
      config.run.cmds.update.list = [
        changed.length > 0 ? `git stash save ${label}` : '',
        `git pull -r -n`,
        changed.length > 0 ? `git stash pop` : '',
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

    const unknownArgs = program.parseOptions(process.argv.slice(2)).unknown;
    for (const [groupName, item] of Object.entries(cmds)) {
      console.log(color.gray(`# Run:`), color.cyanBright(item.desc || groupName));
      let list = item.list;
      if (typeof list === 'function') list = list(unknownArgs);
      for (let cmd of list) {
        if (typeof cmd === 'function') cmd = cmd(unknownArgs);
        if (!cmd) continue;
        console.log(color.gray(` > [cmd]:`), color.greenBright(cmd));
        execSync(cmd, stdio, config.baseDir);
      }
    }
  });

program
  .command('log')
  .alias('l')
  .allowUnknownOption(true)
  .description(color.yellow(` git log 输出简化`))
  .option(`-n, --num <num>`, `日志数量`, '5')
  .option(`-f, --format <tags...>`, `git log --format 的参数`, ['h', 'an', 'cr', 's'])
  .option(`--sep <sep>`, `指定 format 参数之间的分隔符。默认为空格`)
  .option(`--cwd <cwd>`, `指定工作目录。默认为当前目录`)
  .action((opts: { num?: number; sep?: string; format?: string[]; cwd?: string }) => {
    if (typeof opts.sep !== 'string') opts.sep = '';
    opts.sep = opts.sep.replace(/([$])/g, '\\$1');

    const cmd = `git log -${+opts.num || 5} --format="%${opts.format.join(`${opts.sep || ' '}%`)}"`;
    execSync(cmd, 'inherit', opts.cwd || process.cwd());
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
    const config = program.opts();
    // const config = await initConfig();
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
