/*
 * @Author: lzw
 * @Date: 2021-04-22 20:13:10
 * @LastEditors: lzw
 * @LastEditTime: 2021-07-27 19:23:55
 * @Description:
 */
import childProcess from 'child_process';
import { config } from './config';
import chalk from 'chalk';

export interface PlanObject {
  [key: string]: any;
}

export function execSync(cmd, stdio?: childProcess.StdioOptions, cwd?: string) {
  if (!cwd) cwd = config.baseDir;
  if (!stdio) stdio = config.silent ? 'pipe' : 'inherit';
  const res = childProcess.execSync(cmd, { stdio, encoding: 'utf8', cwd });
  if (res) return res.toString().trim();
}

export function assign(a: PlanObject, b: PlanObject) {
  if (!a || !b) return a;
  if (typeof b !== 'object') return b;

  for (const key in b) {
    if (null == b[key] || typeof b[key] !== 'object' || b[key] instanceof RegExp || b[key] instanceof Array) {
      a[key] = b[key];
    } else {
      if (!a[key]) a[key] = {};
      assign(a[key], b[key]);
    }
  }

  return a;
}

export function log(...args: string[]) {
  console.log(`[${chalk.cyanBright(new Date().toTimeString().slice(0, 8))}]`, ...args);
}
