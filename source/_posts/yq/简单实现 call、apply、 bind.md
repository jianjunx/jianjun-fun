---
title: 简单实现 call、apply、 bind
urlname: zp4qh8
date: 2020-08-16 16:06:23 +0800
tags: [js, ts, nextjs, Vue, Jsx]
categories: [JavaScript]
---

## call(),apply()

call() 方法调用一个函数, 其具有一个指定的 this 值和分别地提供的参数(参数的列表)。

> call 和 apply 只是接收参数上的不同

## 用法(MDN)

> fun.call(thisArg, arg1, arg2, ...)

### thisArg

在 fun 函数运行时指定的 this 值。需要注意的是，指定的 this 值并不一定是该函数执行时真正的 this 值，如果这个函数处于 non-strict mode，则指定为 null 和 undefined 的 this 值会自动指向全局对象(浏览器中就是 window 对象)，同时值为原始值(数字，字符串，布尔值)的 this 会指向该原始值的自动包装对象。

<!-- more -->

### arg1, arg2, ...

指定的参数列表。

```javascript
function greet() {
  var reply = [this.animal, 'typically sleep between', this.sleepDuration].join(
    ' ',
  );
  console.log(reply);
}
var obj = {
  animal: 'cats',
  sleepDuration: '12 and 16 hours',
};
greet.call(obj); // cats typically sleep between 12 and 16 hours
```

上面例子中当用 call 调用 greet 方法的时候，该方法的 this 值会绑定到 obj 对象。
我们来分析下 call 做了哪些事情：

1. greet 函数执行了；
2. greet 执行上下文中的 this 被改成了 obj
   下面我们来动手实现一下：

```javascript
const obj = {
  name: '111',
  fn: function () {
    console.log(this.name);
  },
};
// 我们知道fn中的this 就是调用它的obj
obj.fn();
// 在Function原型上添加我们的方法
Function.prototype.myCall = function (ctx, ...args) {
  //这里用Symbol以免覆盖了属性
  const key = Symbol('fn');
  /**
   * call的第一个参数如果为null和undefined时this值会自动指向全局对象(浏览器中就是window对象)，
   * 同时值为原始值(数字，字符串，布尔值)的this会指向该原始值的自动包装对象，原生的call会用Object包装一下。
   */
  ctx = ctx ? Object(ctx) : window;
  /**
   * 这里的this就指向调用的调用call的函数，上例中就是greet
   * 所以我们在实现的时候只要将call的第一个参数挂到greet中的某一个属性中去就可以了
   */
  ctx[key] = this;
  // 这里调用并将参数传给 this函数
  const result = ctx[key](...args);
  // 调用完成后将刚刚挂在的属性删除
  delete ctx[key];
  return result;
};
// 测试一下
greet.myCall(obj); // cats typically sleep between 12 and 16 hours
```

# bind()

bind 和 call 的区别是 call 会被立即调用执行，而 bind 则返回的是一个改变了执行上下文的函数。

```javascript
function greet() {
  var reply = [this.animal, 'typically sleep between', this.sleepDuration].join(
    ' ',
  );
  console.log(reply);
}
var obj = {
  animal: 'cats',
  sleepDuration: '12 and 16 hours',
};
greet.call(obj); // cats typically sleep between 12 and 16 hours
greet.bind(obj)(); // cats typically sleep between 12 and 16 hours
```

我们用 call 来实现

```javascript
Function.prototype.myBind = function (ctx, ...args) {
  const self = this;
  // 返回一个函数
  return function () {
    // 用call去调用并返回结果
    return self.call(ctx, ...args);
  };
};
```
