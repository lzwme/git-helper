import { resolve, basename } from 'node:path';
import { execSync, download, NLogger, color } from '@lzwme/fe-utils';

export interface GithubHelperOptions {
  clone?: boolean;
  /** 如 --depth 1 */
  cloneArgs?: string;
  filepath?: string;
  dl?: boolean;
  proxy?: 'ghproxy' | 'fastgit' | 'none';
  url: string;
}

export async function githubHelper(options: GithubHelperOptions) {
  let url = options.url;
  let type: 'clone' | 'dl' | undefined = options.clone ? 'clone' : options.dl ? 'dl' : void 0;
  if (!type) {
    const isRepo = url.includes('git@github') || /github\.com(\/[^/]+){2}(\.git)?$/.test(url);
    type = isRepo ? 'clone' : 'dl';
  }

  const filepath = resolve(options.filepath || basename(decodeURIComponent(url)));

  if (options.proxy === 'fastgit') {
    url = url.replace(/^(http(s)?|git):\/\/github\.com/, 'https://hub.fastgit.org').replace(/^git@github\.com:/, 'git@ssh.fastgit.org:');
  } else if (options.proxy === 'ghproxy') {
    if (type === 'clone' && url.includes('git@github')) url = url.replace('git@', '').replace(':', '/');
    url = `https://mirror.ghproxy.com/${type === 'clone' ? url : encodeURIComponent(url)}`;
  }

  if (type === 'clone') {
    execSync(`git clone ${options.cloneArgs || ''} ${url} "${filepath}"`, 'inherit');
  } else {
    console.log(`Downloading from`, color.gray(url));
    const result = await download({
      url,
      filepath,
      force: true,
      onProgress(d) {
        NLogger.getLogger().logInline(`${d.downloaded}/${d.size} ${d.percent.toFixed(2)}% ${(d.speed / 1024 / 1024).toFixed(2)}MB/S`);
      },
    });
    console.log(`\n🍡${result.size ? `下载完成！` : `下载失败！`}`, color.cyanBright(result.filepath));
    return result.filepath;
  }
}
