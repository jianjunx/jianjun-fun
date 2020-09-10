---
title: JS中a == 1 &amp;&amp; a == 2 &amp;&amp; a == 3 是否为true
urlname: lrlgxg
date: 2020-08-23 13:27:26 +0800
tags: [js]
categories: [JavaScript]
---

今天在逛社区中看到如下一题:

```javascript
var a = ?;
if(a == 1 && a == 2 && a == 3){
  console.log('hello')
}
```

问是否能打印出 hello？

先来分析一下：
if 判断中 a == 1 && a == 2 && a == 3 注意这里使用的是 == 而不是 ===
==在判断的时候会进行类型转换，在转换的时候会用 a 的 toString 方法。
这时我们可以这么写：

```javascript
var a = {
  val: 1,
  toString() {
    console.log(a.val);
    return a.val++;
  },
};
```

还有一种方式是

```javascript
var a = [1, 2, 3];
a.join = a.shift;
```

当 a 为数组的时 进行类型转换时会调用 a 的 join 方法，我们把 join 方法替换为 shift，那么判断就等于 1 == 1 && 2 == 2 && 3 == 3
