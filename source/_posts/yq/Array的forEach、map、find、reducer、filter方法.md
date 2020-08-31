---
title: Array的forEach、map、find、reducer、filter方法
urlname: vr6tod
date: 2020-08-21 10:09:15 +0000
tags: [js]
categories: [JavaScript]
---

![](/images/post/1598004565773-757d16e0-5e58-4893-be22-f85506043dec.png)
JavaScript 数组 Array.prototype 提供了几个非常方便的迭代方法，这里用图解的方式来理解这些方法。:::\_

## Array.forEach

forEach() 方法对数组的每个元素执行一次提供的函数。

```javascript
var array1 = ["a", "b", "c"];

array1.forEach(function (element) {
  console.log(element);
});

// expected output: "a"
// expected output: "b"
// expected output: "c"
```

![](/images/post/1598004565779-1e6d1668-7acd-4f97-a660-459176fd18f3.png)

## Array.map

map() 方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。

```javascript
var array1 = [1, 4, 9, 16];

// pass a function to map
const map1 = array1.map((x) => x * 2);

console.log(map1);
// expected output: Array [2, 8, 18, 32]
```

![](/images/post/1598004565796-a6c1ebc9-8edb-4e55-83a5-65225318780a.png)

## Array.filter

filter() 方法创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。

```javascript
var words = ["spray", "limit", "elite", "exuberant", "destruction", "present"];

const result = words.filter((word) => word.length > 6);

console.log(result);
// expected output: Array ["exuberant", "destruction", "present"]
```

![](/images/post/1598004565773-757d16e0-5e58-4893-be22-f85506043dec.png)

## Array.find

find() 方法返回数组中满足提供的测试函数的第一个元素的值。否则返回 undefined。

```javascript
var array1 = [5, 6, 8, 130, 44];

var found = array1.find(function (element) {
  return element > 10;
});

console.log(found);
// expected output: 130
```

![](/images/post/1598004565795-35a85862-b97e-4e05-82a8-a432c731c505.png)

## Array.reduce

reduce() 方法对数组中的每个元素执行一个由您提供的 reducer 函数(升序执行)，将其结果汇总为单个返回值。

```javascript
const array1 = [1, 2, 3, 4];
const reducer = (acc, cur) => acc + cur;

// 1 + 2 + 3 + 4
console.log(array1.reduce(reducer));
// expected output: 10

// 5 + 1 + 2 + 3 + 4
console.log(array1.reduce(reducer, 5));
// expected output: 15
```

![](/images/post/1598004565793-a1fb018e-4e35-4f93-8d11-152032895e3c.png)
