---
title: V2RAY一键带deception方案
urlname: daetgu
date: 2020-09-12 09:41:53 +0000
tags: [v2ray]
categories: [技巧]
---

![image.png](https:/jianjun-1251280787.file.myqcloud.com/post/1599904973131-a16d23f0-29ce-4955-9231-73d384c57b86.png)
这是一个教你一键安装 V2RAY 的教程，网上有很多类似的教程，这里只是收藏一份，防走丢。:::

## 使用教程

1. 如果 vps 运营商默认开启了防火墙（阿里云、google 云等默认开启，搬瓦工/hostdare/vultr 默认放行所有端口），请先登录 vps 管理后台放行 80 和 443 端口，否则可能无法正确获得证书导致脚本失败；
2. 登录到服务器，在终端（黑框框）输入如下命令：

```bash
bash <(curl -sL https://raw.githubusercontent.com/hijkpw/scripts/master/ubuntu_install_v2ray2.sh)
```

按回车键，屏幕上开始滚动各种看得懂看不懂的东西。紧盯着屏幕，直到屏幕出现“**确认满足按 y，按其他退出脚本：**”，确认条件满足，按 y 回车，然后**输入你域名的主机名**（注意是主机名，比如www.hijk.pw，**最好不要填裸域名**hijk.pw！），以及设置一个**伪装路径（不能是/）**，例如/abcedf（强烈建议设置一个复杂的、别人猜不到的路径，**除 “数字、字母、/、-、\_” 外不能有其他特殊字符！**）。
接下来脚本会自动疯狂运行，直到屏幕上出现安装成功的提示。**如果安装过程卡住，请耐心等待几分钟；**如果期间网络断开（windows 上表现为黑框框中或者顶部标题出现 disconnected 字样，mac 表现为终端出现“closed by remote host”或”broken pipe”），请重新连接后再次执行命令。脚本运行成功会输出配置信息，截图如下：
![WX20200912-174853@2x.png](https:/jianjun-1251280787.file.myqcloud.com/post/1599904224625-e69085ae-f92f-475c-ab62-73eab31a97d4.png)
**到此服务端配置完毕**，服务器可能会自动重启，windows 终端出现“disconnected”，mac 出现“closed by remote host”说明服务器成功重启了，**如果没提示重启则不需要\*\*。

## 可能出现的问题

1. 多次运行一键脚本，安装过程中会出现如下提示：

```bash
What would you like to do?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: Keep the existing certificate for now
2: Renew & replace the cert (limit ~5 per 7 days)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel):
```

**输入 1，回车即可。** 2. 如果提示证书失败，终端出现如下提示：

```bash
An unexpected error occurred:
There were too many requests of a given type :: Error creating new order :: too many certificates already issued for exact set of domains:test2.hijk.pw:
see https://letsencrypt.org/docs/rate-limits/
```

说明这个主机名近期申请过太多次免费证书，请换一个主机名尝试，例如 test2.hijk.pw 换成 test3.hijk.pw（需要到 dns 控制台添加解析）。

## 如何判断服务端已经正常运行？

操作如下：

1. 浏览器输入域名，打开是一个随机小说网站。注意：小说网站是本人在网上随机找的，如果出现下面的错误也是正常的：
   ![WX20200912-175111@2x.png](https:/jianjun-1251280787.file.myqcloud.com/post/1599904293657-75d8da4e-311d-41ae-8f05-4239cfc9f695.png)
2. 输入域名加伪装路径，出现”bad request”。
   如果这两个现象都是预期的，说明服务端一切正常，有问题请检查客户端配置。**注意：**某些系统因为一些原因，打开域名显示”403 forbidden”，但是打开域名加伪装路径出现“bad request”，这也说明服务端是正常的。

## 客户端下载

接下来是**最后一步**：下载客户端：
[V2RAY 各版本客户端](https://jianjun.fun/p/hvryle.html)
下载客户端配置好后，就可以愉快的上网了！

## 其他

1. 查看 v2ray 运行状态/配置：

```bash
bash <(curl -sL https://raw.githubusercontent.com/hijkpw/scripts/master/ubuntu_install_v2ray2.sh) info
```

2. v2ray 管理命令
   启动：

```bash
systemctl start v2ray
```

停止：

```bash
systemctl stop v2ray
```

重启：

```bash
systemctl restart v2ray
```

3. nginx 管理命令

- 测试配置文件有无错误：

```bash
nginx -t
```

- 启动：

```bash
systemctl start nginx
```

- 停止：

```bash
systemct stop nginx
```

- 重启：

```bash
systemctl restart nginx
```

4. 更新 v2ray 到最新版：重新运行一键脚本
5. 卸载命令：

```bash
bash <(curl -sL https://raw.githubusercontent.com/hijkpw/scripts/master/ubuntu_install_v2ray2.sh) uninstall
```
