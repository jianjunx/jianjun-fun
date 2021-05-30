---
title: JS格式化Excel解析的5位日期戳
urlname: ptdm9t
date: 2020-11-25 11:10:00 +0000
tags: [Excel,日期]
categories: [前端]
---

![image.png](https:/jianjun-1251280787.file.myqcloud.com/post/1606302274151-0139b104-c9e5-4485-8eed-174126c91e63.png)
项目中在前端做 Excel 导入时出现一个问题，日期的列没有设置文本格式时输入的日期会自动转换成 2020/2/2 这种斜线格式:::。
在前端 js 解析完后读取的日期变成了 5 位的数字日期戳，如下。

```javascript
43863; // 对应的时 "2020-2-1"
```

这样直接保存到后台会导致报错，所以我们还是要把它转换正标准的日期格式。

```javascript
function formatExcelDate(numb, format = "-") {
  const time = new Date((numb - 1) * 24 * 3600000 + 1);
  time.setYear(time.getFullYear() - 70);
  const year = time.getFullYear() + "";
  const month = time.getMonth() + 1 + "";
  const date = time.getDate() - 1 + "";
  if (format && format.length === 1) {
    return year + format + month + format + date;
  }
  return (
    year + (month < 10 ? "0" + month : month) + (date < 10 ? "0" + date : date)
  );
}

formatExcelDate(43863);
// 得到的结果是 "2020-2-1"
```

这个问题坑了我好长时间，记录一下防止下次遇到又踩一遍坑。
