/*
 * @Author: lzw
 * @Date: 2021-04-23 10:44:32
 * @LastEditors: lzw
 * @LastEditTime: 2021-08-26 09:10:48
 * @Description: gh u 相关的命令。主要为常用的快捷工具方法
 */

import path from 'path';
import fs from 'fs';
import { getConfig } from './config';
import { execSync } from './utils';

/** getGitLog 返回项的格式 */
interface GitLogItem {
  /** 提交对象（commit）的完整哈希字串 */
  H?: string;
  /** 提交对象的简短哈希字串 */
  h?: string;
  /** 树对象（tree）的完整哈希字串 */
  T?: string;
  /** 树对象的简短哈希字串 */
  t?: string;
  /** 父对象（parent）的完整哈希字串 */
  P?: string;
  /** 父对象的简短哈希字串 */
  p?: string;
  /** 作者（author）的名字 */
  an?: string;
  /** 作者的电子邮件地址 */
  ae?: string;
  /** 作者修订日期 */
  ad?: string;
  /** 作者修订日期，按多久以前的方式显示 */
  ar?: string;
  /** 提交者(committer)的名字 */
  cn?: string;
  /** 提交者的电子邮件地址 */
  ce?: string;
  /** 提交日期 */
  cd?: string;
  /** 提交日期，按多久以前的方式显示 */
  cr?: string;
  /** 提交说明 */
  s?: string;
}

/** 获取当前的本地分支名 */
export function getHeadBranch() {
  // 支持在 Jenkins CI 中从环境变量直接获取
  let branch = process.env.CI_COMMIT_REF_NAME;

  if (!branch) {
    const config = getConfig(null, true);
    const headPath = path.resolve(config.baseDir, './.git/HEAD');

    if (fs.existsSync(headPath)) {
      const head = fs.readFileSync(headPath, { encoding: 'utf-8' });
      branch = head.split('refs/heads/')[1];
    }
  }

  if (!branch) {
    // exec 速度比较慢
    branch = execSync('git rev-parse --abbrev-ref HEAD', 'pipe');
  }

  return branch.trim();
}

/** 获取本地或远端最新的 commitId */
export function getHeadCommitId(isRemote = false) {
  const commitId = execSync(`git rev-parse ${isRemote ? '@{upstream}' : 'HEAD'}`, 'pipe');
  return commitId;
}

/**
 * 获取指定 HEAD 的变更文件列表
 * @param headIndex HEAD 顺序，默认为 0，即最新的本地未提交变更
 */
export function getHeadDiffFileList(headIndex = 0, cwd?: string) {
  return execSync(`git diff HEAD~${headIndex} --name-only`, 'pipe', cwd).trim().split('\n');
}

/**
 * 获取指定数量的日志注释信息
 * @param num 指定获取日志的数量，
 */
export function getGitLogList(num = 1, cwd?: string) {
  num = Math.max(1, +num || 1);
  const prettyFormat = ['H', 'h', 'T', 't', 'p', 'P', 'cd', 'ad', 'an', 'ae', 'ce', 's', 'ar', 'cr'];
  const cmd = `git log -${num} --pretty="tformat:%${prettyFormat.join(' _-_ %')}" --date=iso`;
  const list = execSync(cmd, 'pipe', cwd).trim().split('\n');
  const result = list.map(line => {
    const valList = line.split(' _-_ ');
    return prettyFormat.reduce((r: Partial<GitLogItem>, key: string, idx: number) => {
      r[key] = valList[idx];
      return r;
    }, {});
  });

  return result;
}

/** 获取 git user eamil 地址 */
export function getUserEmail() {
  return execSync('git config --get user.email', 'pipe');
}
