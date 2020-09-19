---
title: Vue3 Composition API使用感受
urlname: gnhbf3
date: 2020-09-19 08:01:36 +0000
tags: [:vue3.0,vue]
categories: [前端,Vue]
---

![image.png](https:/jianjun-1251280787.file.myqcloud.com/post/1600502571326-ef8129fb-eaca-479b-ad56-36bcdd6fa431.png)
昨天晚上 Vue 正式发布了 3.0 版本，其中做大的更新要数 Composition API 了，虽说昨天才发布正式版，但是我在项目中用了也有一段时间了，这里说一些感受。:::

## 概述

Vue3.0 的 Composition API 主要灵感来源于 React Hooks，目的是通过一组低侵入式的、函数式的 API，使得我们能够更灵活地「 组合 」组件的逻辑，文档：[Composition API](https://vue-composition-api-rfc.netlify.app/zh/)。
一个简单的示例：

```javascript
<template>
  <button @click="increment">
    Count is: {{ state.count }}, double is: {{ state.double }}
  </button>
</template>

<script>
import { reactive, computed } from 'vue'

export default {
  setup() {
    const state = reactive({
      count: 0,
      double: computed(() => state.count * 2)
    })

    function increment() {
      state.count++
    }

    return {
      state,
      increment
    }
  }
}
</script>
```

## setup 函数

setup 函数是一个跟 methods、data 同级的新的组件选项，是作为在组件内使用 Composition API 的入口点。需要注意的是 setup 函数在组件初始化时只会执行一次，所以千万不要把 props 中的属性结构出来，不然你会发先即使父组件的参数发生改变但是传入子组件的 props 还是初始化时候的值。
refs 推荐这么使用:

```vue
<template>
  <div ref="testRefs" @click="clickHandler">test</div>
</template>
<script>
export default {
  setup() {
    const testRefs = ref(null);

    const clickHandler = () => {
      console.log(testRefs.value);
    };
    // 其他逻辑...
    return { testRefs, clickHandler };
  },
};
</script>
```

这里唯一觉得麻烦的一点就是 setup 函数需要将所有模板中用到的属性和方法都要 return 出去，当一个组件逻辑复杂且很大的时候就很难看了，希望后期官方出一些更好的解决方案。

## 代码组织

原始 API 是将响应式数据放入 data、方法都放入 methods 对象中，当写一个逻辑复杂代码量大的组件时就会导致修改一个逻辑时在代码中跳来跳去、不同逻辑混杂在 methods 中很难区分，而 Composition API 解决了这个问题，使我们能够将相同逻辑关注点的代码并列在一起。
例如下面这样写：

```javascript
export default {
  setup() {
    // ...
  },
};

function useCurrentFolderData(networkState) {
  // ...
}

function useFolderNavigation({ networkState, currentFolderData }) {
  // ...
}

function useFavoriteFolder(currentFolderData) {
  // ...
}

function useHiddenFolders() {
  // ...
}

function useCreateFolder(openFolder) {
  // ...
}
```

将同一个组件中不同的逻辑拆分到对应的 use 开头的函数（组合式函数），而 setup 函数只当做使用组合式函数的入口，这就是逻辑隔离。当我们在组件间提取并复用逻辑时，组合式 API 是十分灵活的。一个组合函数仅依赖它的参数和 Vue 全局导出的 API，而不是依赖其微妙的 this 上下文。你可以将组件内的任何一段逻辑导出为函数以复

```javascript
import { ref, onMounted, onUnmounted } from "vue";

export function useMousePosition() {
  const x = ref(0);
  const y = ref(0);

  function update(e) {
    x.value = e.pageX;
    y.value = e.pageY;
  }

  onMounted(() => {
    window.addEventListener("mousemove", update);
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", update);
  });

  return { x, y };
}
```

以下是一个组件如何利用该函数的展示:

```javascript
import { useMousePosition } from "./mouse";

export default {
  setup() {
    const { x, y } = useMousePosition();
    // 其他逻辑...
    return { x, y };
  },
};
```

但是在实际开发中这种方式组织代码造成很多麻烦，很多逻辑点并不是那么独立，组合函数之间互相引用某个响应式变量和方法，就我目前是通过传参的方式来使用，这就造成了很多使用上的心智负担。

## 类型推导

官方用 typescript 重构了 vue3.0，使其对 typescript 的支持非常好，由于 Composition API 基本都是以函数的形式来写，所以用的做多的是 typescript 中的接口、泛型、枚举这些，像类、装饰器这些很少会用到，不得不说 Typescript 配合 vscode 的提示真是一种享受。
