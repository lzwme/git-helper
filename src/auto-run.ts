// https://github.com/charlzyx/gitmd
import { execSync, dateFormat, gitHasUnstagedChanges } from '@lzwme/fe-utils';
import { cyan, greenBright } from 'console-log-colors';
import { logger } from './utils.js';

const cacheMap = new Map<string, { lastSync: number; total: 0; running?: boolean }>();

type AutoRunOption = {
  id: string;
  /** 执行的命令 */
  cmd?: string[] | ((now: string) => string[]);
  /** 命令执行的根目录 */
  dir?: string;
  /** 最小同步时间间隔。单位为秒。默认为 30 */
  minSyncInterval?: number;
};

export const autoRunCmds = (option: AutoRunOption) => {
  option = { ...option };
  if (!option.cmd) {
    logger.warn('cmd 命令列表不能为空！', option);
    return;
  }

  const now = dateFormat('yyyy/MM/dd hh:mm:ss');
  const cache = cacheMap.get(option.id) || { lastSync: 0, total: 0 };

  if (cache.running) return;

  if (!option.dir) option.dir = process.cwd();
  if (typeof option.cmd === 'function') option.cmd = option.cmd(now);
  option.minSyncInterval = +option.minSyncInterval || 0;

  if (cache.lastSync != null && option.minSyncInterval && +Date.now() - cache.lastSync < option.minSyncInterval * 1000) return;

  cache.lastSync = Date.now();
  cache.total++;
  cache.running = true;
  cacheMap.set(option.id, cache);

  for (const cmd of option.cmd) {
    if (!cmd) continue;

    const r = execSync(cmd, 'pipe', option.dir);
    if (r.stderr) {
      logger.error(r.stderr);
      break;
    }
  }

  logger.info(`第[${cyan(cache.total)}]次执行命令`, greenBright(option.cmd.join(' && ')));
  cache.running = false;
  cacheMap.set(option.id, cache);
};

export function autoCommit(option: AutoRunOption) {
  const minSyncInterval = Math.max(+option.minSyncInterval || 5, 3);

  setTimeout(() => {
    if (!option.cmd) {
      option.cmd = (now: string) => [`git add .`, `git commit -m "chore: autosave at ${now}"`, `git pull -r -n`, `git push`];
    }

    if (gitHasUnstagedChanges()) autoRunCmds(option);

    autoCommit(option);
  }, minSyncInterval * 1000);
}
