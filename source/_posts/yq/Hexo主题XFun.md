---
title: Hexo主题XFun
urlname: if3wr3
date: 2020-08-29 02:05:15 +0000
tags: [Hexo,主题]
categories: [其他]
---

![xfun-hexo-theme.png](/images/post/1598666814364-c2cb3a1b-c0b9-4cc7-94a0-d570c310d818.png)
花了根据几天时间在官方 landscape 主题上修改并借鉴了 next 一些的风格，命名为 XFun，虽说有些简陋，但是符合我喜欢的风格。
_<!-- more -->_

## Installation

### Install

```bash
$ git clone https://github.com/jianjunx/hexo-theme-xfun.git themes/xfun
```

XFun 的主题搜索依赖[hexo-generator-search]插件，请 hexo 项目中执行以下命令安装

```bash
$ npm install hexo-generator-search --save
```

并在 hexo 的\_config.yml(不是 xfun 主题里的那个)中添加如下配置

```yaml
search:
  path: search.json
  field: post
  content: true
```

如果要启用 RSS 的话请先安装[hexo-generate-feed]

```bash
$ npm install hexo-generate-feed --save
```

### Enable

将 hexo 项目下 `_config.yml` 中的 `theme` 选项修改为 `xfun`.

### Update

```bash
cd themes/xfun
git pull
```

## Configuration

全部配置如下：

```yaml
# Header
menu:
  首页:
    icon: icon-home # 字体图标类名，见下方说明
    link: / # 链接地址
rss: /atom.xml # 配合hexo-generator-feed插件
logo: # logo地址
# Content
excerpt_link: 阅读全文>>
fancybox: true

# Sidebar
sidebar: right
widgets:
  - personal
  # - category
  # - tag
  # - tagcloud
  # - archive
  # - recent_posts

personal: #个人信息栏设置
  avatar: /images/upload/avatar.png #头像地址
  name: JJ Xie # 作者名
  description: XFun. #描述

lines: #个人信息栏下方的链接
  标签: #名称
    icon: icon-tags #图标类名
    link: /tags
  分类:
    icon: icon-category
    link: /categorys
  XFun:
    icon: icon-github
    link: https://github.com/jianjunx/hexo-theme-xfun

icons: #个人信息栏下方的图标按钮
  GitHub:
    icon: icon-github
    link: https://github.com/jianjunx
  微博:
    icon: icon-weibo
    link:
  知乎:
    icon: icon-zhihu
    link: /
  掘金:
    icon: icon-juejin
    link: /

valine: # 参考下面的valine配置
  appId: #valine leanClode appId
  appKey: #valine leanClode appKey

# widget behavior
archive_type: "monthly"
show_count: true
ribbon_flow: true
# Miscellaneous
favicon: #favicon.ico地址
```

### 配置中的 icon

配置中的 icon 合法的值是在主题中 css/\_partial/icons.styl 文件中定义的类名，具体方法如下：

1. 去[FontAwesome](https://fontawesome.dashgame.com/)找到心仪的图标,选中按 F12 打开控制台。
1. 在 Element(元素)那里找到对应图标的 i 标签，如下：

![get-icon.png](/images/post/1598668538741-74816168-2800-469f-806a-a3f175577342.png)

3. 在 css/\_partial/icons.styl 中新增类名

```css
.icon-weibo
  font-style: normal
  &:before
    content: "\f18a"; // 把上图2那里的一串放到这
    font-family: FontAwesome;
    font-size: 12px; // 调整图标大小
```

4. 在配置文件中使用

```yaml
微博:
  icon: icon-weibo
  link:
```

### valine 配置

主题中自带了 valine 评论，这里只需要获取 LeanCloud 账号便可。

#### 获取 APPID 和 APPKEY

请先[登录](https://leancloud.cn/dashboard/login.html#/signin)或[注册](https://leancloud.cn/dashboard/login.html#/signup) `LeanCloud`, 进入[控制台](https://leancloud.cn/dashboard/applist.html#/apps)后点击左下角[创建应用](https://leancloud.cn/dashboard/applist.html#/newapp)：
![](/images/post/1598669037918-9cecd486-2b10-4c8a-a714-02550121ea7d.jpeg)
应用创建好以后，进入刚刚创建的应用，选择左下角的设置>应用 Key，然后就能看到你的 APP ID 和 APP Key 了：
![](/images/post/1598669070281-1098abe2-decc-4db0-b0cf-9f1e5988e534.jpeg)

更多配置请参考[valine](https://valine.js.org/quickstart.html)

### ribbon_flow 背景彩带

这里是在网上找的一段代码，可以在\_config.yml 中选择开启或关闭。

#### 调整背景色和图

如果启用了 ribbon_flow 选项预想自定义背景颜色和图片就需要到主题中的 source/js/ribbons.js 文件中第 151 行左右，添加如下代码：

```javascript
this._canvas.style["background-color"] = "#f5f7f9"; // 背景颜色
this._canvas.style["background-image"] = "url(./你的图片地址.png)"; //自定义背景图
```

## 其他

欢迎各大神帮助一起优化 XFun 主题，GitHub 仓库地址：[https://github.com/jianjunx/hexo-theme-xfun](https://github.com/jianjunx/hexo-theme-xfun)。
如果你用上了 XFun 主题记得在下方评论丢个链接展示一下。
