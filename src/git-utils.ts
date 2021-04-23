/*
 * @Author: lzw
 * @Date: 2021-04-23 10:44:32
 * @LastEditors: lzw
 * @LastEditTime: 2021-04-23 11:11:42
 * @Description: gh u 相关的命令。主要为常用的快捷工具方法
 */

import path from 'path';
import fs from 'fs';
import { getConfig } from './config';
import { execSync } from './utils';

/** 获取当前的本地分支名 */
export function getHeadBranch() {
  const config = getConfig(null, true);
  const head = fs.readFileSync(path.resolve(config.baseDir, './.git/HEAD'), { encoding: 'utf-8' });
  let branch = head.split('refs/heads/')[1];

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
