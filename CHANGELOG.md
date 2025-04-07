# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.7.3](https://github.com/lzwme/git-helper/compare/v1.7.2...v1.7.3) (2025-04-07)

### [1.7.2](https://github.com/lzwme/git-helper/compare/v1.7.1...v1.7.2) (2024-04-12)

### [1.7.1](https://github.com/lzwme/git-helper/compare/v1.7.0...v1.7.1) (2024-02-23)


### Bug Fixes

* 更新 ghproxy 地址 ([ad98a8c](https://github.com/lzwme/git-helper/commit/ad98a8cd1e152199cd4a29c310a2b5558c1ad0c6))
* 修复 -m 参数允许不指定值时 commit信息为 true 的问题 ([54c21af](https://github.com/lzwme/git-helper/commit/54c21af5e8f5bbdbd74d6d8c873a5856523874b5))

## [1.7.0](https://github.com/lzwme/git-helper/compare/v1.6.0...v1.7.0) (2023-09-15)


### Features

* 新增 gh auto-git 命令，支持定时的执行 git 提交 ([3454a41](https://github.com/lzwme/git-helper/commit/3454a41d2635e05111bf6281ba9d6191dbf98351))


### Bug Fixes

* **auto-git:** 修复 cmd 为 function 时二次执行会被替换为字符串的问题 ([fcab701](https://github.com/lzwme/git-helper/commit/fcab701d0545933e4d7422bde7983e1c057ab3fa))

## [1.6.0](https://github.com/lzwme/git-helper/compare/v1.5.1...v1.6.0) (2023-07-19)


### Features

* 新增 gh github 命令，支持以代理方式加速 github 仓库的 clone 与附件下载 ([4422670](https://github.com/lzwme/git-helper/commit/4422670b86653108c8742f0c872deeae876c9ead))


### Bug Fixes

* 修复 cmd group 命令组参数名错误的问题 ([4888816](https://github.com/lzwme/git-helper/commit/4888816871ce81049f96a9e3afc99dcefc026edb))

### [1.5.1](https://github.com/lzwme/git-helper/compare/v1.5.0...v1.5.1) (2023-03-01)


### Bug Fixes

* cli 参数优先级应高于配置文件 ([4cfb763](https://github.com/lzwme/git-helper/commit/4cfb763b06dd515e43557d55f51d0fe0a7333ed8))

## [1.5.0](https://github.com/lzwme/git-helper/compare/v1.4.2...v1.5.0) (2022-12-10)


### Features

* 新增 gh log 命令 ([965da37](https://github.com/lzwme/git-helper/commit/965da37110b472c6a19dce7f9b7c910753a93fc0))


### Bug Fixes

* fix for git stash pop ([19dd12c](https://github.com/lzwme/git-helper/commit/19dd12cdf0427b55af4c0b54e26c7033849a2752))

### [1.4.2](https://github.com/lzwme/git-helper/compare/v1.4.0...v1.4.2) (2022-12-07)

### [1.4.1](https://github.com/lzwme/git-helper/compare/v1.4.0...v1.4.1) (2022-06-07)

## [1.4.0](https://github.com/lzwme/git-helper/compare/v1.3.0...v1.4.0) (2021-10-08)


### Features

* 增加 util --user-email 获取 git 用户邮箱的快捷命令 ([7517da5](https://github.com/lzwme/git-helper/commit/7517da55075cc3cdefc6671b18ee7dbfca61fc56))

## 1.3.0 (2021-06-13)

### Bug Fixes

* 修改 git add 命令为 git add --all ([24f0f2d](https://github.com/lzwme/git-helper/commit/24f0f2d2b0440ee13894891c6f6b57fdcc6c20a5))

## 1.2.0 (2021-04-24)


### Features

* 新增 gh u 命令，提供常用 git 工具类功能 ([4809a3b](https://github.com/lzwme/git-helper/commit/4809a3b8eb4714239dd9410a103603acc70fcfcc))
* 增加 silent 参数及静默模式支持 ([fe7abe5](https://github.com/lzwme/git-helper/commit/fe7abe5db7677bc59da86a18e8cfcc53e92a19a8))
* gh util 命令增加获取 commitId 功能 ([212c62e](https://github.com/lzwme/git-helper/commit/212c62ee3ea2d0859408e5bb153927226750f921))
