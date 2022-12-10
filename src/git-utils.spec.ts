import * as gitUtils from './git-utils';
import { execSync } from './utils';

const gitLogLine = [
  `a5840084eae998ee4a33ad091d004b9f856c1140`,
  `a584008 _-_ ea936e476429e71abae4d2b92b95331414116e15 _-_ ea936e4 _-_ 3013cd5`,
  `3013cd5a74bbfbab88cc9a0d9adbed745aee80d8 _-_ 2022-11-20 18:56:29 +0800 _-_ 2022-11-20 18:56:29 +0800`,
  `renxia _-_ no@lzw.me _-_ no@lzw.me`,
  `chore: update dependencies`,
  `2 days ago`,
  `2 days ago`,
]
  .join(' _-_ ')
  .trim();
const execSyncFn = execSync as jest.Mock;

jest.mock(
  './utils.js',
  jest.fn(() => ({
    execSync: jest.fn(),
  }))
);

describe('git-utils', () => {
  test('gitUtils.getGitLogList', () => {
    execSyncFn.mockReturnValueOnce(gitLogLine);
    const res = gitUtils.getGitLogList(1);
    expect(res.length).toBe(1);
    expect(res[0].s.length > 0).toBeTruthy();

    execSyncFn.mockReturnValueOnce(gitLogLine);
    expect(gitUtils.getGitLogList().length).toBe(1);

    execSyncFn.mockImplementationOnce(() => [gitLogLine, gitLogLine, gitLogLine].join('\n'));
    expect(gitUtils.getGitLogList(3).length).toBe(3);
  });

  test('gitUtils.getHeadCommitId', () => {
    execSyncFn.mockReturnValueOnce('aaaaaaaa');
    expect(typeof gitUtils.getHeadCommitId() === 'string').toBeTruthy();
  });

  test('gitUtils.getHeadBranch', () => {
    execSyncFn.mockReturnValueOnce('main');
    expect(typeof gitUtils.getHeadBranch() === 'string').toBeTruthy();
  });

  test('gitUtils.getHeadDiffFileList', () => {
    execSyncFn.mockReturnValueOnce('123.js\n123.ts');
    expect(Array.isArray(gitUtils.getHeadDiffFileList())).toBeTruthy();

    execSyncFn.mockReturnValueOnce('abc.ts');
    expect(gitUtils.getHeadDiffFileList(1).length > 0).toBeTruthy();
  });

  test('gitUtils.getUserEmail', () => {
    execSyncFn.mockReturnValueOnce('a@lzw.me');
    expect(gitUtils.getUserEmail().length > 0).toBeTruthy();
  });
});
