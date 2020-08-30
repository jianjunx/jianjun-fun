---
title: 学习webpack 写一个js代码打包工具
urlname: ing0x6
date: 2020-08-29 09:32:53 +0000
tags: [webpack,Nodejs]
categories: [前端,工具]
---

![截屏2020-08-29 下午9.40.11.png](/images/post/1598709499271-e0ec778d-1fe5-4987-819f-706e603283f8.png)

webpack 是一个用 nodejs 写的前端打包工具，从官网上的图片可以看出，可以将不同类型和总错复杂的依赖关系的文件打包成简单的浏览器可以认识的文件。
<--! more -->

## 核心概念

webpack 有入口、输出、loader、插件等几个重要的概念

### 入口（entry）

webpack 打包的起点，用来分析依赖的入口。

### 输出（output）

output 属性告诉 webpack 在哪里输出它所创建的 bundle，以及如何命名这些文件。主要输出文件的默认值是 ./dist/main.js，其他生成文件默认放置在 ./dist 文件夹中。

### loader

webpack 默认只能理解 JavaScript 和 JSON 文件。loader 可以让 webpack 能够去处理其他类型的文件，并将它们转换为有效模块，例如 vue-loader 可以让 webpack 去处理.vue 文件。

### 插件

loader 用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。包括：打包优化，资源管理，注入环境变量。

## 分析打包后的文件

我把一个简单的文件引用打包后的文件精简如下：

```javascript
(function (modules) {
  // 存储执行过的模块
  let installModules = {};
  /**
   * 自定义require方法，打包时会把所有的require替换为__webpack_require__
   * @param {*} moduleId 就是模块的相对路径名
   */
  function __webpack_require__(moduleId) {
    if (installModules[moduleId]) {
      return installModules[moduleId].exports;
    }
    // 初始化module对象
    const module = (installModules[moduleId] = {
      exports: {},
    });
    // 根据传入的模块id调用模块
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );

    return module.exports;
  }

  return __webpack_require__("./src/index.js" /** 这里一般是入口文件 */);
})(
  {
    "./src/index.js": function (module, exports, __webpack_require__) {
      eval(
        "const home = __webpack_require__('./src/home.js');\n\nfunction getHome() {\n  return home;\n}\n\nconsole.log(getHome());\n\nmodule.exports = {\n  getHome,\n  name: 'test webpack',\n};\n"
      );
    },
    "./src/home.js": function (module, exports, __webpack_require__) {
      eval(
        "const { hey } = __webpack_require__('./src/test.js');\n\nmodule.exports = { home: 'hell-home', hey };\n"
      );
    },
    "./src/test.js": function (module, exports, __webpack_require__) {
      eval("exports.hey = function () {\n  return 'hey 哥们';\n};\n");
    },
  } /** 被替换成每个模块的内容，格式为一个对象key为路径，值为匿名函数里面使用eval包裹的文件代码 */
);
```

可以看到打包后的文件中有一个自执行函数，传入的是一个对象，对象的 key 为文件被 require 的路径，值为一个函数 里面有一个 eval 方法，我们的模块内容被打包成字符串放在了 eval 中。
自执行函数中有一个**webpack_require**方法，仔细看我们模块代码中的 require 方法都被替换成了**webpack_require**。

## 自己写一个打包工具

分析了 webpack 打包后的文件后，现在我们开始尝试自己写一个简单的打包工具。

### 初始化项目

在本地新建一个目录，我这里取名叫 xpack，进入 xpack 目录执行如下命令初始化 npm

```bash
npm init -y
```

新增文件 src 目录，并创建 index.js 和 template.js
完整目录如下：
src

- index.js // 主逻辑
- template.js // 打包模板文件

package.json

### index.js

我这里就直接贴代码了，里面有详细的注释

```javascript
#!/usr/bin/env node
const path = require("path");
const fs = require("fs");

// 默认配置
const defuaultConf = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
  },
};
// 合并配置文件
const config = Object.assign(
  defuaultConf,
  require(path.resolve("./xpack.config.js"))
);

class Xpack {
  constructor(config) {
    this.config = config; // 保存配置项
    this.entry = config.entry; // 保存配置项中的入口文件地址
    this.root = process.cwd(); // 获取命令执行的目录
    this.modules = {};
  }
  /**
   * 代码解析和依赖分析
   * @param {*} code 模块代码
   * @param {*} parent 模块路径
   */
  parse(code, parent) {
    const deps = []; // 依赖模块的路径
    const r = /require\('(.*)'\)/g; // 正则匹配依赖模块
    code = code.replace(r, function (match, arg) {
      const retpath = path.join(parent, arg.replace(/'|"/g), "");
      deps.push(retpath);
      return `__xpack__require__('./${retpath}')`;
    });

    return { deps, code };
  }
  generateMoudle() {
    const temp = [];
    // 将modules转成字符串
    for (const [key, val] of Object.entries(this.modules)) {
      temp.push(`'${key}' : ${val}`);
    }
    return `{${temp.join(",")}}`;
  }
  generateFile() {
    // 读取模板文件
    const template = fs.readFileSync(
      path.resolve(__dirname, "./template.js"),
      "utf-8"
    );
    // 替换__modules_content__和__entry__
    this.template = template
      .replace("__entry__", this.entry)
      .replace("__modules_content__", this.generateMoudle());

    // 生成打包后的文件
    fs.writeFileSync(
      path.join("./dist", this.config.output.filename),
      this.template
    );
  }
  /**
   * 递归解析模块并按引入路径保存到modules
   * @param {*} modulePath 模块的真实路径
   * @param {*} name 模块地址
   */
  createModule(modulePath, name) {
    // 读取模块文件内容，入口文件和require的文件
    const moduleContent = fs.readFileSync(modulePath, "utf-8");
    // 解析读取的模块内容
    const { code, deps } = this.parse(moduleContent, path.dirname(name));
    /**
     * 将模块代码存放到modules中，模块引入路径为key，模块中的代码用eval包裹
     * eval可以将字符串当成js来执行，外面包裹的函数中传入了定义好的module, exports, __webpack_require__
     * 当遇到commonjs模块导出时就换调用对应的参数
     */
    this.modules[name] = `function (module, exports, __webpack_require__) {
      eval("${code.replace(/\n/g, "\\n")}")
    }`;
    // 循环依赖项，并调用this.createModule继续解析
    deps.forEach((dep) => {
      this.createModule(path.join(this.root, dep), `./${dep}`);
    });
  }
  // 开始函数
  start() {
    const entryPath = path.resolve(this.root, this.entry);
    this.createModule(entryPath, this.entry);
    // console.log(this.modules);
    this.generateFile();
  }
}

// 初始化，并传入配置项
const xpack = new Xpack(config);

xpack.start();
```

### template.js

一样直接贴代码

```javascript
(function (modules) {
  // 存储执行过的模块
  let installModules = {};
  /**
   * 自定义require方法，打包时会把所有的require替换为__xpack_require__
   * @param {*} moduleId 就是模块的相对路径名
   */
  function __xpack_require__(moduleId) {
    if (installModules[moduleId]) {
      return installModules[moduleId].exports;
    }
    // 初始化module对象
    const module = (installModules[moduleId] = {
      exports: {},
    });
    // 根据传入的模块id调用模块
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __xpack_require__
    );

    return module.exports;
  }

  return __xpack_require__(
    "__entry__" /** 被替换成this.entry 配置项中的入口文件地址 */
  );
})(
  __modules_content__ /** 被替换成每个模块的内容，格式为一个对象key为路径，值为匿名函数里面使用eval包裹的文件代码 */
);
```

## 试用

以上代码逻辑写好以后我们就可以看一下新打包工具的威力了，在这之前我们先做一些处理。

### package.json

在 package.json 中添加如下选项

```json
"bin": {
    "xpack": "./src/index.js"
  }
```

然后执行

```bash
npm link
```

第一步的意思是，输入命令行指令 xpack 后执行./src/index.js 文件，这里注意 index.js 顶部要添加  *#!/usr/bin/env node *就是告诉系统可以在 PATH 目录中查找指令。

第二步 npm link 是将当前这个 npm 包链接到全局，相当于 npm install xpack -g ，这样就可以在命令行使用 xpack 指令了。

### 打包

我们新建一个测试项目，结构如下
src

- index.js
- test.js

xpack.config.js
package.json

随便写一些测试代码，然后执行 xpack 指令打包，不出意外就能正常打包了，完整的代码在[jianjunx/my-pack](https://github.com/jianjunx/my-pack)。
