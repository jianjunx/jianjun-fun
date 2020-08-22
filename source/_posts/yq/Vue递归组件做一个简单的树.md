---
title: Vue递归组件做一个简单的树
urlname: hh4yw4
date: 2020-08-21 10:47:28 +0800
tags: [Vue, 递归]
categories: [前端, 组件]
---

工作中要开发一个树形菜单翻了翻官网发现 Vue 有递归组件的功能，下面记录下用递归组件实现一个树组件。

## 递归组件

Vue 中组件是可以在模板中调用自身的，不过它必须通过 name 属性来调用：

```html
<template>
  <div>
    <tree-component />
  </div>
</template>
export default { name: 'tree-component', // ... }
```

通过 props 来传递所需的数据，注意稍有不慎，递归组件就可能导致无限循环：

```javascript
name: 'stack-overflow',
template: '<div><stack-overflow></stack-overflow></div>'
```

类似上述的组件将会导致“max stack size exceeded”错误，所以请确保递归调用是条件性的 (例如使用一个最终会得到 false 的 v-if)。

## 构建树

创建一个 tree-component.vue 文件

```html
<template>
  <ul>
    <li v-for="data in datas" :key="data.id">
      <span>{{data.title}}</span>
      <!-- 用v-if判断 避免出现死循环 -->
      <template v-if="Array.isArray(data.chilren)">
        <!-- 使用name属性，递归调用组件本身 -->
        <tree-component :datas="data.chilren" />
      </template>
    </li>
  </ul>
</template>
<script>
  export default {
    name: 'tree-component',
    props: {
      datas: {
        type: Array,
        default: () => [],
      },
    },
  };
</script>
```

在组件中调用

```html
<template>
  <div>
    <TreeComponent :datas="treeData" />
  </div>
</template>
<script>
  import TreeComponent from '../components/tree-component';

  export default {
    components: { TreeComponent },
    data: () => ({
      tags: ['vue', 'js', 'node', 'vue', 'js', 'node'],
      treeData: [
        {
          title: '安徽',
          id: 1,
          chilren: [
            {
              title: '合肥',
              id: 101,
            },
            {
              title: '阜阳',
              id: 102,
              chilren: [
                {
                  title: '颍州区',
                  id: 10201,
                },
              ],
            },
          ],
        },
        {
          title: '广东',
          id: 2,
          chilren: [
            {
              title: '广州',
              id: 201,
            },
            {
              title: '深圳',
              id: 202,
              chilren: [
                {
                  title: '南山区',
                  id: 20201,
                },
              ],
            },
          ],
        },
      ],
    }),
  };
</script>
```

效果图：
![1578201090.png](/images/post/1597978182108-ebf60c9d-07e4-4e37-804c-c1d8b05e7c46.png)
