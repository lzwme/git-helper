import * as gitUtils from './git-utils';

test('gitUtils.getGitLogList', () => {
  const res = gitUtils.getGitLogList(1);
  expect(res.length).toBe(1);
  expect(res[0].s.length > 0).toBeTruthy();
  expect(gitUtils.getGitLogList().length).toBe(1);
  expect(gitUtils.getGitLogList(3).length).toBe(3);
});

test('gitUtils.getHeadCommitId', () => {
  expect(typeof gitUtils.getHeadCommitId() === 'string').toBeTruthy();
});

test('gitUtils.getHeadBranch', () => {
  expect(typeof gitUtils.getHeadBranch() === 'string').toBeTruthy();
});

test('gitUtils.getHeadDiffFileList', () => {
  expect(Array.isArray(gitUtils.getHeadDiffFileList())).toBeTruthy();
  expect(gitUtils.getHeadDiffFileList(1).length > 0).toBeTruthy();
});

test('gitUtils.getUserEmail', () => {
  expect(gitUtils.getUserEmail().length > 0).toBeTruthy();
});
