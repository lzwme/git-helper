/*
 * @Author: lzw
 * @Date: 2021-04-22 14:51:05
 * @LastEditors: lzw
 * @LastEditTime: 2021-10-08 17:36:39
 * @Description: git commit 提交辅助工具
 */

import { color as chalk } from 'console-log-colors';
import { getConfig, IConfig } from './config.js';
import { execSync, assign, log } from './utils.js';
import { getHeadCommitId } from './git-utils.js';

function getGitHead(remote = false) {
  try {
    const commitId = getHeadCommitId(remote);
    return commitId;
  } catch (error) {
    const e = error as { stderr?: string };
    log(e.stderr ? chalk.redBright(e.stderr) : e);
  }

  return '';
}
function help() {
  console.log(chalk.yellowBright(`\n USEAGE:`));
  console.log(`   githelper cm -m "fix: test commit (JGCPS-XXX)" <--push> <--amend> <--n> <--debug>`);
}

function checkcommitCfg(config: IConfig) {
  const commitCfg = config.commit;
  let errmsg = '';

  const message = String(commitCfg.message || '');

  if (!commitCfg.amend && !message) errmsg = '缺少 message 提交注释';

  if (message && commitCfg.messageReg && !commitCfg.messageReg.test(message)) {
    errmsg = `提交注释内容格式校验失败，应匹配规则：${commitCfg.messageReg}`;
  }

  if (commitCfg.amend && getGitHead(false) === getGitHead(true)) {
    errmsg = '最近一次提交已在远端，不允许 amend 方式提交';
  }

  if (errmsg) {
    log(chalk.redBright(errmsg));
    help();
  }

  return !errmsg;
}

export async function gitCommit(cfg?: IConfig) {
  const config = await getConfig(null, false);

  if (cfg && cfg !== config) assign(config, cfg);

  const commitCfg = config.commit;

  if (config.debug) {
    log(chalk.cyanBright('开始执行 git commit 相关动作'));
  }
  if (!checkcommitCfg(config)) return;

  /** commit 提交命令 */
  let commit = `git commit -m "${commitCfg.message}"`;

  if (commitCfg.amend) {
    if (!commitCfg.message) commit = `git commit --amend --no-edit`;
    else commit += ' --amend';
  }

  if (commitCfg.noVerify) commit += ' -n';

  const cmds = [
    !config.silent ? 'git status --short' : '',
    // commitCfg.message && commitCfg.amend ? "git reset HEAD" : "",
    'git add --all',
    commit,
    commitCfg.pull ? `git pull --rebase` + (config.debug ? ' -v' : '') : '',
    commitCfg.push ? `git push` + (config.debug ? ' -v --progress' : '') : '',
  ].filter(Boolean);

  for (const cmd of cmds) {
    try {
      log(chalk.yellowBright('执行命令：'), chalk.cyanBright(cmd));
      execSync(cmd);
    } catch (error) {
      const e = error as Error;
      log(e.message || e);
      break;
    }
  }
}
