/*
 * @Author: lzw
 * @Date: 2021-04-23 10:44:32
 * @LastEditors: lzw
 * @LastEditTime: 2023-03-09 11:04:48
 * @Description: gh u 相关的命令。主要为常用的快捷工具方法
 */

import { execSync } from './utils.js';

/** getGitLog 返回项的格式 */
export interface GitLogItem {
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
