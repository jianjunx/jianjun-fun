---
title: 深入响应式原理，实现一个简易版的vue
urlname: gpve1b
date: 2020-08-27 16:00:06 +0800
tags: [源码,vue]
categories: [前端,VUE]
---

![data.png](https:/jianjun-1251280787.file.myqcloud.com/post/1598578798979-f2509ca1-b07d-4f65-88f2-bce50ecda8c9.png)
最近研究了一下 Vue 的响应式原理，如上图，在初始化 Vue 对象时会对 data 对象做循环遍历，用 ES6 中的  [`Object.defineProperty`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 为每个属性添加 getter/seeter，在模板使用某属性时就会触发 getter，在为 data 中属性赋值时会触发 setter 从而达到数据劫持的效果。:::
光有有数据劫持还不行，还需要一个 Watcher 进行依赖收集，通过 Dep 实现发布订阅(发布订阅者设计模式)，当触发 setter 时会去通知 Watcher 进行更新。\_

# 准备开始

只知道还不行，咱要动手写一个简单版的 就命名为 Mvvm，把文件结构拆分如下：

## 目录结构

[index.js](https://github.com/jianjunx/mvvm/blob/master/src/index.js) #Mvvm 主类逻辑 初始化 options 钩子函数等都在这里
[compile.js](https://github.com/jianjunx/mvvm/blob/master/src/compile.js) #模板解析部分 八字胡插值语法
[compile.directive.js](https://github.com/jianjunx/mvvm/blob/master/src/compile.directive.js) #处理模板指令 v-modal v-on 等
[obsever.js](https://github.com/jianjunx/mvvm/blob/master/src/obsever.js) #这里时数据劫持部分
[dep.js](https://github.com/jianjunx/mvvm/blob/master/src/dep.js) #简单的实现发布订阅这模式
[watcher.js](https://github.com/jianjunx/mvvm/blob/master/src/watcher.js) #实现依赖收集，主要是用来获取最新的值更新模板的
[utils](https://github.com/jianjunx/mvvm/tree/master/src/utils) #为了简洁把一部分方法放到这里

- [compile.utils.js](https://github.com/jianjunx/mvvm/blob/master/src/utils/compile.utils.js) #模板解析的一些方法
- [mvvm.utils.js](https://github.com/jianjunx/mvvm/blob/master/src/utils/mvvm.utils.js) #其他的一些方法

## 代码实现

代码都放在[MVVM](https://github.com/jianjunx/mvvm)仓库里，部分逻辑做了注释，这里贴出主要逻辑。

### index.js

```javascript
import { dataAgent, methodsAgent, computedAgent } from "./utils/mvvm.utils";
import Compile from "./compile";
import Observer from "./obsever";

class Mvvm {
  constructor(option = {}) {
    this.$option = option;
    this.$el = option.el;
    const data = (this._data = option.data);
    // data代理到this上
    dataAgent(this, data || {});
    // methods代理到this上
    methodsAgent(this, this.$option.methods || {});
    // 计算属性
    computedAgent(this, this.$option.computed || {});
    // Observer
    new Observer(this._data);
    // created
    this.$option.created && this.$option.created.call(this);
    // Compile
    new Compile(this, this.$el);
    // mounted
    this.$option.mounted && this.$option.mounted.call(this);
  }
}

export default Mvvm;
```

\*\*

### compile.js

```javascript
import {
  nodeToArray,
  isEleNode,
  replaceMoustache,
  isDirective,
  getDirective,
} from "./utils/compile.utils";
import CompileDirective from "./compile.directive";
import Watcher from "./watcher";

// Compile 处理HTML上的指令和插值语法
class Compile extends CompileDirective {
  constructor(vm, el) {
    super();
    this.vm = vm;
    this.init(el);
  }
  init(el) {
    // 获取#app
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    // 替换后的子节点添加到el
    this.el.appendChild(this.nodeLikeFragment(this.el));
  }
  nodeLikeFragment(el) {
    const childes = nodeToArray(el.childNodes);
    // 在内存中创建dom
    const fragment = document.createDocumentFragment();
    for (const node of childes) {
      // 元素节点进行替换
      isEleNode(node) && this.replace(node);
      // 递归处理子节点
      if (node.childNodes && node.childNodes.length) {
        node.appendChild(this.nodeLikeFragment(node));
      }
      // 将node添加到fragment
      fragment.appendChild(node);
    }
    return fragment;
  }
  replace(node) {
    // 处理八字胡插值语法
    this.moustache(node);
    const attrs = nodeToArray(node.attributes); // node上的获取属性
    for (const attr of attrs) {
      const { nodeName, nodeValue } = attr; // 解构属性名和属性值
      // 判断如果是v-开头的就是需要的指令
      if (isDirective(nodeName)) {
        const dir = getDirective(nodeName); // v-text 去掉v- 返回 text
        this[dir] && this[dir](node, nodeValue); // 判断CompileDirective中的 对应方法存在就直接调用
        dir.includes("on:") && this.on(node, dir.split(":")[1], nodeValue); // 处理v-on
        dir.includes("bind:") && this.bind(node, dir.split(":")[1], nodeValue); // 处理v-bind
      }
      nodeName.startsWith("@") && this.on(node, nodeName.slice(1), nodeValue); // 如果是@开头的话直接调用 CompileDirective中的on方法
      nodeName.startsWith(":") && this.bind(node, nodeName.slice(1), nodeValue); // 如果是:开头的话直接调用 CompileDirective中的bind方法
    }
  }
  // 处理插值语法{{}}
  moustache(node) {
    const text = node.textContent;
    if (!text) return;
    const reg = /\{\{((?:.|\n)+?)\}\}/g;
    // 正则匹配到{{}} 去到里面的值进行替换
    node.textContent = replaceMoustache(text, reg, this.vm, (expr) => {
      // 创建Watcher实例 数据发生变化进行实时更新
      new Watcher(this.vm, expr, (value) => {
        node.textContent = replaceMoustache(text, reg, this.vm);
      });
    });
  }
}

export default Compile;
```

### compile.directive.js

```javascript
import { setValue, getValue } from "./utils/compile.utils";
import Watcher from "./watcher";

class CompileDirective {
  constructor() {}
  // v-text
  text(node, expr) {
    node.textContent = getValue(this.vm, expr);
    new Watcher(this.vm, expr, (value) => {
      node.textContent = value;
    });
  }
  // v-html
  html(node, expr) {
    node.innerHTML = getValue(this.vm, expr);
    new Watcher(this.vm, expr, (value) => {
      node.innerHTML = value;
    });
  }
  // v-model
  model(node, expr) {
    node.value = getValue(this.vm, expr);
    new Watcher(this.vm, expr, (value) => {
      node.value = value;
    });
    node.addEventListener("input", (event) => {
      const val = event.target.value;
      setValue(this.vm, expr, val);
    });
  }
  // v-on
  on(node, type, expr) {
    const method = getValue(this.vm, expr);
    node.addEventListener(type, method);
  }
  // v-bind
  bind(node, type, expr) {
    node.setAttribute(type, getValue(this.vm, expr) || expr);
    node.removeAttribute(":" + type);
  }
}

export default CompileDirective;
```

### obsever.js

```javascript
import Dep from "./dep";

class Obsever {
  constructor(data) {
    this.data = data;
    // 执行walk为对象的每个属性添加get\set
    this.walk(data);
  }
  walk(data) {
    // 判断data是否为对象，是对象的话再劫持
    if (data && typeof data == "object") {
      for (const key in data) {
        // 调用defineRactive添加get set
        this.defineRactive(data, key, data[key]);
        // 递归处理
        this.walk(data[key]);
      }
    }
  }
  defineRactive(obj, key, value) {
    const self = this;
    // 初始化一个Dep实例
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        /**
				 * 当创建new Watcher实例的时候Watcher中会执行入下代码
				 * 把Watcher实例的 this 赋值给Dep.target
				 * Dep.target = this;
				 * 这里再去获取劫持的属性值，就会进入当前这个get函数内，这时下方的Dep.target 就等于html方法里的那个new Watcher实例
				 * html(node, expr) {
						node.innerHTML = getValue(this.vm, expr);
						new Watcher(this.vm, expr, value => {
							node.innerHTML = value;
						});
					}
				 * getValue(this.vm, this.expr);
				 */
        Dep.target && dep.addSubs(Dep.target); // Dep.target 等于Watcher实例，这里就把Watcher实例添加到dep里的subs数组中
        /**
         * 上面执行完这里再把Dep.target = null 一面无限制的网dep.subs 添加watcher
         * Dep.target = null;
         */
        return value;
      },
      set(newVal) {
        // debugger
        if (value === newVal) return;
        value = newVal;
        // 如果新值是对象这里继续调用walk劫持
        self.walk(value);
        // 值发生改变调用dep.notify方法 通知变化
        dep.notify();
      },
    });
  }
}

export default Obsever;
```

### dep.js

```javascript
class Dep {
  constructor() {
    this.subs = [];
  }
  addSubs(sub) {
    // 把watcher实例添加到subs
    this.subs.push(sub);
  }
  notify() {
    // 循环并执行watcher实例中的update方法 刷新页面
    this.subs.forEach((sub) => sub.update());
  }
}

export default Dep;
```

### watcher.js

```javascript
import { getValue } from "./utils/compile.utils";
import Dep from "./dep";

class Watcher {
  constructor(vm, expr, fn) {
    this.vm = vm;
    this.expr = expr;
    this.fn = fn;
    this.init();
  }
  init() {
    // 初始化时将this(就是new Watcher的实例)临时赋给Dep.target
    Dep.target = this;
    // 这里获取下监控的值，这是会进入到observe里的get函数中 把Dep.target添加到dep实例中的subs里
    getValue(this.vm, this.expr);
    // 这里在清空 防止无限制的添加依赖
    Dep.target = null;
  }
  update() {
    // 当值发生改变在set函数中会执行dep实例的notify方法，在init步骤中我们已经把this添加到了dep实例的subs中
    // 这时dep.notify方法会循环执行sub.update() sub就是this update就是当前这个方法
    // 这里在执行fn 并把新值放到第一个参数中
    // fn实在new Watcher中传进来的
    this.fn(getValue(this.vm, this.expr));
  }
}

export default Watcher;
```

### compile.utils.js

```javascript
// nodes转换为array
export const nodeToArray = (nodes) => {
  return Array.from(nodes);
};
// 是否是元素节点
export const isEleNode = (node) => {
  return node.nodeType === 1;
};
// 从vm中取值
export const getValue = (vm, expr) => {
  return expr.split(".").reduce((pv, cv) => {
    return pv[cv];
  }, vm);
};
// 递归替换匹配到的{{}}
export const replaceMoustache = (text, reg, vm, fn) => {
  const newText = text.replace(reg, (placeholder, expr) => {
    fn && fn(expr);
    return getValue(vm, expr);
  });
  if (!reg.test(newText)) return newText;
  replaceMoustache(newText, reg, vm, fn);
};
// 判断是不是v-开头
export const isDirective = (dir) => {
  return dir.startsWith("v-");
};
// 截取v-开头的指令名
export const getDirective = (dir) => {
  return dir.slice(2);
};
// v-modal中设置val，把最后一个key去除，循环拿到最后一个值的上级对象再进行赋值
export const setValue = (vm, expr, value) => {
  const keyList = expr.split("."),
    popKey = keyList.pop();
  const data = keyList.reduce((item, key) => {
    return item[key];
  }, vm);
  data[popKey] = value;
};
```

### mvvm.utils.js

```javascript
// 将数据代理到vm
export const dataAgent = (vm, data) => {
  for (const key in data) {
    Object.defineProperty(vm, key, {
      configurable: true,
      get() {
        return data[key];
      },
      set(val) {
        data[key] = val;
      },
    });
  }
};
// 把methods代理到this 例如 this.sayHi()
export const methodsAgent = (vm, mth) => {
  for (const key in mth) {
    Object.defineProperty(vm, key, {
      configurable: true,
      get() {
        // 把methods中的函数绑定到vm上并改变this
        return typeof mth[key] === "function" && mth[key].bind(vm);
      },
      set() {},
    });
  }
};
// 把计算属性代理到this
export const computedAgent = (vm, cmp) => {
  for (const key in cmp) {
    Object.defineProperty(vm, key, {
      configurable: true,
      // 判断cmp[key]是函数的话get就直接等于计算属性内的函数，取值的话调用get等于直接调用计算属性里的函数
      // 如果是对象的话则调用对象的get
      get: typeof cmp[key] === "function" ? cmp[key] : cmp[key].get,
      set() {},
    });
  }
};
```
