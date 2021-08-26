import test from 'ava';
import * as gitUtils from './git-utils';

test('gitUtils.getGitLogList', t => {
  const res = gitUtils.getGitLogList(1);
  t.is(res.length, 1);
  t.is(res[0].s.length > 0, true);

  t.is(gitUtils.getGitLogList().length, 1);
  t.is(gitUtils.getGitLogList(3).length, 3);
});

test('gitUtils.getHeadCommitId', t => {
  t.true(typeof gitUtils.getHeadCommitId() === 'string');
});

test('gitUtils.getHeadBranch', t => {
  t.true(typeof gitUtils.getHeadBranch() === 'string');
});

test('gitUtils.getHeadDiffFileList', t => {
  t.true(Array.isArray(gitUtils.getHeadDiffFileList()));
  t.true(gitUtils.getHeadDiffFileList(1).length > 0);
});

test('gitUtils.getUserEmail', t => {
  t.true(gitUtils.getUserEmail().length > 0);
});
