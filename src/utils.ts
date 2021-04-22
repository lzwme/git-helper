/*
 * @Author: lzw
 * @Date: 2021-04-22 20:13:10
 * @LastEditors: lzw
 * @LastEditTime: 2021-04-23 10:08:01
 * @Description:
 */
import childProcess from 'child_process';

export interface PlanObject {
  [key: string]: any;
}

export function execSync(cmd, stdio: childProcess.StdioOptions = 'inherit', cwd = process.cwd()) {
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
