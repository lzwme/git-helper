/*
 * @Author: lzw
 * @Date: 2021-04-22 20:13:10
 * @LastEditors: lzw
 * @LastEditTime: 2021-10-08 17:42:46
 * @Description:
 */
import childProcess from 'child_process';
import { config } from './config';
import { color } from 'console-log-colors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlanObject = Record<string, any>;

export function execSync(cmd, stdio?: childProcess.StdioOptions, cwd?: string) {
  if (!cwd) cwd = config.baseDir;
  if (!stdio) stdio = config.silent ? 'pipe' : 'inherit';
  if (config.debug) console.log(color.cyanBright('exec cmd:'), color.yellowBright(cmd), color.cyan(cwd));
  const res = childProcess.execSync(cmd, { stdio, encoding: 'utf8', cwd });
  if (res) return res.toString().trim();
}

/** 简易的对象深复制 */
export function assign(a, b) {
  if (!a || !b) return a;
  if (typeof b !== 'object' || b instanceof RegExp || Array.isArray(b)) return a;

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
  console.log(`[${color.cyanBright(new Date().toTimeString().slice(0, 8))}]`, ...args);
}
