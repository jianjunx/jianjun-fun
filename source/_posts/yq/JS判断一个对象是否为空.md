---
title: JS判断一个对象是否为空
urlname: wzc5rm
date: 2020-08-18 14:58:19 +0800
tags: [Js, Jsx, Vue, React]
categories: [JavaScript]
---

## 用 for..in 循环

用 for in 循环对象，如果进入循环返回 false 没进入循环就返回 true

```javascript
function isEmpty(obj) {
  for (const key in obj) {
    // 判断自身的属性
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}
```

## 用 ES6 的 Object.keys()

用 ES6 的 Object.keys()会返回对象的所有 key 组成的数组，再通过判断 keys 是否为空来判断对象是否为空

```javascript
function isEmpty(obj) {
  const keys = Object.keys(obj);
  // 判断数组是否为空
  return keys == false;
}
```

## 转换成 JSON 判断

用 JSON.stringify 转成 json 字符串来判断

```javascript
function isEmpty(obj) {
  return JSON.stringify(obj) === "{}";
}
```
