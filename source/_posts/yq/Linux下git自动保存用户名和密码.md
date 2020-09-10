---
title: Linux下git自动保存用户名和密码
urlname: ya7h3c
date: 2020-08-17 14:31:45 +0800
tags: [git]
categories: [技巧]
---

最近换了系统，安装好 git 在每次代码提交的时候总是提示要重复输入用户名和密码，可以通过以下两条命令来解决这个问题。

- 按项目设置

```bash
git config credential.helper store
```

- 全局设置

```bash
git config credential.helper store --global
```
