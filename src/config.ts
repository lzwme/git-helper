/*
 * @Author: lzw
 * @Date: 2021-04-22 20:14:35
 * @LastEditors: lzw
 * @LastEditTime: 2021-10-08 17:42:58
 * @Description:
 */

import { color } from 'console-log-colors';
import fs from 'fs';
import path from 'path';
import { assign } from './utils';

export interface IConfig {
  /** 用户自定义文件的路径 */
  configPath?: string;
  /** 根目录，默认为当前执行目录 */
  baseDir?: string;
  /** 是否打印调试信息 */
  debug?: boolean;
  /** 开启静默模式，只打印必要的信息 */
  silent?: boolean;
  /** cm 命令相关的配置 */
  commit?: {
    /** commit 后是否执行 pull <rebase> */
    pull?: boolean;
    /** 是否执行 push 推送 */
    push?: boolean;
    /** git commit --amend 模式，即覆盖前一条提交，不建议写在配置文件中 */
    amend?: boolean;
    /** 提交注释 */
    message?: string;
    /** 是否跳过 git hook */
    noVerify?: boolean;
    /** 提交注释的验证规则，不符合规则的提交会被阻止 */
    messageReg?: RegExp;
  };
}

export const config: IConfig = {
  configPath: '.git-helper.config.js',
  baseDir: process.cwd(),
  debug: false,
  commit: {},
};

/**
 * 获取配置信息
 */
export function getConfig(options?: IConfig, useCache = true) {
  if (useCache) return config;

  if (options && options.configPath) config.configPath = options.configPath;

  const configPath = path.resolve(config.configPath);
  if (fs.existsSync(configPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cfg: IConfig = require(configPath);
    assign(config, cfg);
  } else if (config.debug) {
    console.log(color.yellowBright(`配置文件不存在：${configPath}`));
  }

  // 直接入参的优先级最高
  if (options) assign(config, options);

  // 默认参数设置
  if (null == config.commit.pull) config.commit.pull = true;
  if (config.debug) config.silent = true;

  return config;
}
