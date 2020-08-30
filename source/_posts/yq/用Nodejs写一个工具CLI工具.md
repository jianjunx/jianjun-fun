---
title: 用Nodejs写一个工具CLI工具
urlname: plfuhf
date: 2020-08-30 03:11:23 +0000
tags: [cli,Nodejs]
categories: [前端,工具]
---

![截屏2020-08-30 上午11.16.21.png](/images/post/1598757500590-56b8396d-9b16-4406-84bf-0eb865b81612.png)
在前端开发中，或多或少都会接触各种 CLI 工具，比如 vue-cli、react-create-app、angular-cli 等，在开发阶段帮助我们初始化项目、初始化配置、创建文件等，是不是感觉很高端、很强大？不要羡慕，我们自己也能写一个。

## 目标

我们要完成一下几个小目标

1. 在命令行中输入自定义的指令(我这里叫 shanx) 会给出命令提示
1. 在命令行中输入 shanx init demo 会自动创建 demo 目录，并自动从 github 上下载指定的模板文件

## 前期准备

1. 创建一个空目录并执行 npm init -y 初始化项目
1. 安装下面几个 npm 依赖包：

[chalk - 给命令行输出文字加背景色的](https://github.com/chalk/chalk#readme)
[clear - 清空命令行信息](https://github.com/bahamas10/node-clear#readme)
[commander - 完整的 nodejs 命令行解决方案](https://github.com/tj/commander.js#readme)
[download-git-repo - 从 GitHub 上下载项目到本地](https://gitlab.com/flippidippi/download-git-repo#readme)
[figlet - 在命令行中打印超大的字](https://github.com/patorjk/figlet.js#readme)
[ora - 给终端加上一个旋转动画](https://github.com/sindresorhus/ora#readme)

## 写我们的 CLI

### 简单的命令处理

在项目中新建 bin 目录，创建 shanx.js 文件，代码如下

```javascript
#!/usr/bin/env node
const program = require("commander");
const { version } = require("../package.json");

// 设置版本信息
program.version(version);

program
  .command("init <name>") // 定义命令
  .description("init project") // 命令描述信息
  .action((name) => conso.log(name)); // 处理指令 回调函数中的name 就是命令第三个参数的值 如：shanx init demo 那么name就等于demo

program.parse(process.argv); // 通过program.parse(arguments)方法处理参数，没有被使用的选项会存放在program.args数组中。
```

### 测试命令

1. 在 package.json 中添加 bin 属性：

```json
"bin": {
    "shanx": "./bin/shanx.js"
  }
```

2. 接下来执行

```bash
npm link
```

第一步的意思是，输入命令行指令 shanx 后执行./bin/shanx.js 文件，这里注意./bin/shanx.js 顶部要添加 *#!/usr/bin/env node *就是告诉系统可以在 PATH 目录中查找指令。
第二步 npm link 是将当前这个 npm 包链接到全局，相当于 npm install xpack -g ，这样就可以在命令行使用 xpack 指令了。

3. 在命令行中分别输入：

```bash
$ shanx
Usage: shanx [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  init <name>     init project
  help [command]  display help for command

$ shanx --version
1.0.0

$ shanx init demo
demo
```

命令正常执行了，我们第一个任务完成了。

### 下载模板到本地

在项目中新建 lib 文件夹，并新增 init.js 处理 init 命令的逻辑和 download.js 用来下载 GitHub 项目到本地。
这里直接贴上代码

#### init.js

```javascript
const { promisify } = require("util");
const figlet = promisify(require("figlet"));
const clear = require("clear");
const chalk = require("chalk");
const { clone } = require("./download");

// 用chalk包自定义log函数，使最终打印在命令行上的提示文字为蓝色
const log = (content) => console.log(chalk.blue(content));

/**
 * 使用node子进程去执行命令
 * @param  {...any} args 类似命令行指令
 */
const spawn = (...args) => {
  /**
   * spawn - child_process.spawn 使用指定的命令行参数创建新进程。
   * spawn 会返回一个带有stdout和stderr流的对象。你可以通过stdout流来读取子进程返回给Node.js的数据。s
   * tdout拥有’data’,’end’以及一般流所具有的事件。当你想要子进程返回大量数据给Node时，比如说图像处理，读取二进制数据等等，你最好使用spawn方法。
   */
  const { spawn } = require("child_process");
  return new Promise((resolve) => {
    // 创建并执行spawn
    const childProcess = spawn(...args);
    // 将子进程的标准输出接到主进程，以便能在命令行中输出信息，因为你的终端命令是运行在主进程中的，所以子进程的输出信息是看不到的
    childProcess.stdout.pipe(process.stdout);
    // 将子进程的错误流接到主进程
    childProcess.stderr.pipe(process.stderr);
    childProcess.on("close", resolve);
  });
};

/**
 * 处理命令逻辑，如在命令行输入了shanx init demo 回车就会调用这里，name就等于demo
 * @param {*} name
 */
module.exports = async (name) => {
  clear(); // 清空屏幕信息
  const data = await figlet("Hello shanx"); // 生成大号欢迎信息
  log(data); // 换个颜色打印

  // clone
  log("🚀创建项目：" + name);
  // 克隆存放在github中的仓库，并把项目名称传入
  await clone("github:jianjunx/my-cli", name);
  log("🔨开始安装依赖");
  // 这一步是执行以来安装，第一个参数代表指令名，第二个是参数例如：npm i -g npm 后面三个参数都要放到这个数组中，第三个对象中的cwd代表命令进到哪个目录中执行
  await spawn("npm", ["i"], { cwd: `./${name}` });
  // 安装完成 打印信息
  log(`
  ==========================
  👌安装完成
  cd ${name}
  npm run serve
  ==========================
  `);
};
```

#### download.js

```javascript
const { promisify } = require("util");

/**
 * 从GitHub仓库下载代码到本地
 * @param {*} repo GitHub仓库名，规则请参考download-git-repo文档
 * @param {*} desc 本地存放的目录
 */
exports.clone = async (repo, desc) => {
  const dowonlad = promisify(require("download-git-repo"));
  const ora = require("ora");
  const process = ora(`下载...${repo}`);
  // 在命令行显示下载中 并加上旋转动画
  process.start();
  // 开始下载GitHub项目中的代码到本地
  await dowonlad(repo, desc);
  // 下载完成结束旋转动画
  process.succeed();
};
```

接下来更新 bin/shanx.js

```javascript
#!/usr/bin/env node
const program = require("commander");
const { version } = require("../package.json");
const init = require("../lib/init");

// 设置版本信息
program.version(version);

program
  .command("init <name>") // 定义命令
  .description("init project") // 命令描述信息
  .action((name) => init(name)); // 处理指令 回调函数中的name 就是命令第三个参数的值 如：shanx init demo 那么name就等于demo

program.parse(process.argv); // 通过program.parse(arguments)方法处理参数，没有被使用的选项会存放在program.args数组中。
```

## 最终测试

我们在命令行中输入如下命令：

```bash
$ shanx init demo
```

![截屏2020-08-30 下午3.46.36.png](/images/post/1598773613685-2508e7d4-a315-4e2b-93e8-1cb731117c99.png)
正确输出了信息，本地也多出了 demo 的目录和文件，到这里我们的第二个目标也完成了，CLI 是不是也没想象中的那么高端。
