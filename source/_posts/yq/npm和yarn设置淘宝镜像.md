---
title: npm和yarn设置淘宝镜像
urlname: okxy9e
date: 2020-08-23 13:45:28 +0800
tags: [前端,NPM,Nodejs]
categories: [技巧]
---

## NPM 设置淘宝镜像

1.查询当前配置的镜像

````bash
npm get registry

# https://registry.npmjs.org/
``` 

设置成淘宝镜像
```bash
npm config set registry https://registry.npm.taobao.org/
````

2.换成原来的

```bash
npm config set registry https://registry.npmjs.org/
```

## Yarn 设置淘宝镜像

1.查询当前配置的镜像

```bash
yarn config get registry

# https://registry.yarnpkg.com
```

设置成淘宝镜像

```bash
yarn config set registry https://registry.npm.taobao.org/
```
