/*
 * @Author: lzw
 * @Date: 2021-04-22 20:13:10
 * @LastEditors: lzw
 * @LastEditTime: 2021-10-08 17:42:46
 * @Description:
 */
import { execSync as cpExecSync, type StdioOptions } from 'node:child_process';
import { color } from 'console-log-colors';
import { getLogger } from '@lzwme/fe-utils';
import { config } from './config.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlanObject = Record<string, any>;

export function execSync(cmd, stdio?: StdioOptions, cwd?: string) {
  if (!cwd) cwd = config.baseDir;
  if (!stdio) stdio = config.silent ? 'pipe' : 'inherit';
  if (config.debug) console.log(color.cyanBright('exec cmd:'), color.yellowBright(cmd), color.cyan(cwd));
  const res = cpExecSync(cmd, { stdio, encoding: 'utf8', cwd });
  return res == null ? '' : res.toString().trim();
}

export function log(...args: unknown[]) {
  console.log(`[${color.cyanBright(new Date().toTimeString().slice(0, 8))}]`, ...args);
}

export const logger = getLogger('[GH]');
