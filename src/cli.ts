#!/usr/bin/env node

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type StdioOptions } from 'node:child_process';
import { program, Option } from 'commander';
import { color } from 'console-log-colors';
import { getConfig, type IConfig } from './config.js';
import {
  readJsonFileSync,
  assign,
  type PackageJson,
  getUserEmail,
  getHeadDiffFileList,
  getHeadBranch,
  getHeadCommitId,
  isGitRepo,
} from '@lzwme/fe-utils';
import { gitCommit, execSync, logger } from './index.js';
import { githubHelper, type GithubHelperOptions } from './github.js';
import { autoCommit } from './auto-run.js';

const flhSrcDir = dirname(fileURLToPath(import.meta.url));
const pkg = readJsonFileSync<PackageJson>(resolve(flhSrcDir, '../package.json'));

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
  .option('-c, --config-path <filepath>', `配置文件 ${color.yellow('git-helper.config.<js|cjs|mjs>')} 的路径`)
  .option('-s, --silent', '开启静默模式，只打印必要的信息')
  .option('-f, --force', '是否强制执行。如 `git push --force` 等')
  .option('--debug', `开启调试模式。`, false);

program
  .command('commit')
  .aliases(['c', 'cm'])
  .description(color.yellow(' 执行 git 提交相关的动作，包括 add、commit、pull 及 push 等'))
  .option('-m, --message <message>', 'git 提交注释内容')
  .option('-r, --messageReg', 'message 提交注释的验证规则，建议写在配置文件中')
  .option('-a, --amend', '是否修改上一次提交')
  .option('-d, --date <ISO Date>', '修改提交日期。当 --amend 参数存在时默认为当前时间')
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
  .command('github <url>')
  .alias('g')
  .allowUnknownOption(true)
  .description(color.yellow(` Github 辅助工具，通过代理方式加速 clone 或下载 raw、release 等文件`))
  .addOption(new Option('-p, --proxy <type>', `clone、pull 时使用的代理类型`).choices(['ghproxy', 'fastgit', 'none']).default('ghproxy'))
  .option(`-C, --clone`, `加速 git clone`)
  .option(`-A, --clone-args <args>`, `git clone 的其他参数。如 "--depth=1"`)
  .option(`-D, --dl`, `加速 github Releases 或 raw 文件下载`)
  .option(`-F, --filepath`, `指定输出文件或仓库目录的路径`)
  .action((url: string, opts: GithubHelperOptions) => {
    opts.url = url;
    githubHelper(opts).catch(e => console.error(e));
  });

program
  .command('run [groupName]')
  .alias('r')
  .allowUnknownOption(true)
  .description(color.yellow(` 执行一组或多组（内置的或在配置文件中定义的）预定义命令`))
  .option(`-l, --list`, `查看可执行的命令组`)
  .option(`-u, --update`, `更新：${color.cyan('stash & pull --rebase & stash')}`)
  .option(`-g, --cmd-group <groupName...>`, `指定预定义的命令组名。可指定多个，按顺序执行命令组`)
  .action(async (groupName: string, opts: { list?: boolean; update?: boolean; cmdGroup?: string[] }) => {
    const config = await initConfig();
    const cmds: IConfig['run']['cmds'] = {};
    const stdio: StdioOptions = config.silent ? 'pipe' : 'inherit';
    if (config.debug) console.log(opts);

    if (opts.list) {
      const list = Object.entries(config.run.cmds).map(d => `${color.greenBright(d[0])}  ${color.cyan(d[1].desc || '')}`);
      console.log(`可用的命令组：${color.cyanBright(`\n - ${list.join('\n - ')}`)}`);
      return;
    }

    if (groupName) {
      opts.cmdGroup = opts.cmdGroup ? [...opts.cmdGroup, groupName] : [groupName];
    }

    if (opts.update || opts.cmdGroup?.includes('update')) {
      const label = `gh_${Date.now()}`;
      config.run.cmds.update.list = (changed: string[]) =>
        [changed.length > 0 ? `git stash save ${label}` : '', `git pull -r -n`, changed.length > 0 ? `git stash pop` : ''].filter(Boolean);
      cmds.update = config.run.cmds.update;
    }

    if (Array.isArray(opts.cmdGroup)) {
      opts.cmdGroup.forEach(groupName => {
        if (config.run.cmds[groupName]) cmds[groupName] = config.run.cmds[groupName];
        else console.warn(color.yellow(`未知的命令组：`), color.yellowBright(groupName));
      });
    }

    if (Object.keys(cmds).length === 0) {
      console.log(color.red('未指定任何有效的命令组'));
      return;
    }

    const changed = getHeadDiffFileList(0, config.baseDir);
    if (config.debug) console.log('changed', changed);
    const unknownArgs = program.parseOptions(process.argv.slice(2)).unknown;
    for (const [groupName, item] of Object.entries(cmds)) {
      console.log(color.gray(`# Run:`), color.cyanBright(item.desc || groupName));
      let list = item.list;
      if (typeof list === 'function') list = list(changed, unknownArgs);
      for (let cmd of list) {
        if (typeof cmd === 'function') cmd = cmd(changed, unknownArgs);
        if (!cmd) continue;
        console.log(color.gray(` > [cmd]:`), color.greenBright(cmd));
        execSync(cmd, stdio, config.baseDir);
      }
    }
  });

program
  .command('log')
  .alias('l')
  .argument('[filepath]', '指定文件路径')
  .allowUnknownOption(true)
  .description(color.yellow(` git log 输出简化`))
  .option(`-n, --num <num>`, `日志数量`, '5')
  .option(`-F, --format <tags...>`, `git log --format 的参数`, ['h', 'an', 'cr', 's'])
  .option('--date <date-type>', '指定 git log --date 参数', 'iso-local')
  .option(`--sep <sep>`, `指定 format 参数之间的分隔符。默认为空格`)
  .option(`--cwd <cwd>`, `指定工作目录。默认为当前目录`)
  .action((filepath: string | undefined, opts: { num?: number; sep?: string; format?: string[]; cwd?: string; date?: string }) => {
    if (typeof opts.sep !== 'string') opts.sep = '';
    opts.sep = opts.sep.replace(/([$])/g, '\\$1');

    let cmd = `git log -${+opts.num || 5} --date=${opts.date} --format="%${opts.format.join(`${opts.sep || ' '}%`)}"`;
    if (filepath) cmd += ` "${filepath}"`;
    execSync(cmd, 'inherit', opts.cwd || process.cwd());
  });

program
  .command('auto-git')
  .alias('a')
  .description(color.yellow(` 定时的自动执行 git 代码提交`))
  .option(`--cmd <cmd...>`, `自定义要执行的命令`)
  .option(`--dir <dir>`, `指定要监控的目录。默认为当前目录`)
  .option(`-m, --min-sync-interval <num>`, `最小同步时间间隔。单位为秒。默认为 30`, '30')
  .action((opts: { dir?: string; cmd?: string[]; minSyncInterval?: number }) => {
    if (isGitRepo(opts.dir)) {
      logger.info('[auto-git]已启动');
      autoCommit({
        id: 'auto-git',
        ...opts,
      });
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
