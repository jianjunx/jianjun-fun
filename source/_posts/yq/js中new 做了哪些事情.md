---
title: js中new 做了哪些事情?
urlname: wakxqm
date: 2020-08-21 18:07:06 +0800
tags: [js]
categories: [JavaScript]
---

我们在初始化一个构造函数实例时，需要用 new 操作符去初始化实例，那么我们在 new 一个构造函数的时候 new 到底为我们做了什么呢？

```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {
  console.log(this.name);
};
const jayken = new Person("Jayken");

// Person {name: "Jayken"}
//   name: "Jayken"
//   __proto__:
//     sayHi: ƒ ()
//     constructor: ƒ Person(name)
//     __proto__: Object
```

从上面的例子可以看出 new 为我们做了以下事情：

1. 创建一个新的对象；
1. 将新对象的**proto** 指向构造函数的 prototype；
1. 用指定的参数通过 call/apply 调用构造函数，改变构造函数的 this 指向新创建的对象；
1. 返回新创建的对象；

知道 new 做了什么后，我们来动手实现一个

```javascript
/**
 *
 * @param Fn 传入的构造函数
 * @param args 需要传给构造函数的参数
 */
function creater(Fn, ...args) {
  // Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。 （MDN）
  const obj = Object.create(Fn.prototype);
  // 使用apply调用Fn构造函数，将Fn的this指向obj
  Fn.apply(obj, args);
  return obj;
}
```

实现完成后我们用 Person 函数来验证一下：

```javascript
const jayken = creater(Person, "Jayken");

// Person {name: "Jayken"}
//   name: "Jayken"
//   __proto__:
//     sayHi: ƒ ()
//     constructor: ƒ Person(name)
//     __proto__: Object
```

OK 结果完全一样！
