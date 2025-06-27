<!-- src/App.vue -->
<template>
  <v-app>
    <v-main class="app-main" theme="dark">
      <div class="app-container">
        <PageSwiper :pages="pages" />
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
  import { markRaw, ref } from 'vue'
  import PageSwiper from './components/PageSwiper.vue'
  import ChatView from './pages/ChatView.vue'
  import ExhibitionView from './pages/ExhibitionView.vue'

  const pages = ref([
    { id: 'chat', component: markRaw(ChatView) },
    { id: 'exhibit', component: markRaw(ExhibitionView) },
  ])
</script>

<style>
/* 移动端适配 - 处理浏览器导航栏问题 */
html, body, #app, .v-application, .v-application__wrap {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* CSS自定义属性初始化 */
:root {
  --vh: 1vh;
  --safe-area-top: 0px;
  --safe-area-bottom: 0px;
  --keyboard-height: 0px;
}

/* 使用动态视口高度来处理移动端浏览器导航栏 */
.app-main {
  height: 100vh; /* 回退方案 */
  height: calc(var(--vh, 1vh) * 100); /* 使用动态计算的视口高度 */
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.app-container {
  height: 100%;
  width: 100%;
  position: relative;
}

/* 移动端优化 */
@media screen and (max-width: 768px) {
  /* 强制全屏显示 */
  .app-main {
    height: calc(var(--vh, 1vh) * 100);
    min-height: -webkit-fill-available; /* iOS Safari 支持 */
  }

  /* 隐藏可能的滚动条 */
  body {
    -webkit-overflow-scrolling: touch;
    overflow: hidden;
    position: fixed;
    width: 100%;
  }

  /* 防止地址栏影响布局 */
  .v-application {
    height: calc(var(--vh, 1vh) * 100);
    min-height: -webkit-fill-available;
  }
}

/* iOS Safari 特殊处理 */
@supports (-webkit-touch-callout: none) {
  .app-main {
    height: -webkit-fill-available;
    min-height: -webkit-fill-available;
  }
}

/* 软键盘弹出时的处理 */
.keyboard-open .app-main {
  height: calc(100vh - var(--keyboard-height, 0px));
}

/* 确保内容填满可用空间 */
.fill-height {
  height: 100%;
  min-height: 100%;
}

/* 防止页面缩放 */
@viewport {
  width: device-width;
  zoom: 1.0;
}

/* 禁用iOS的弹跳效果 */
body {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
}

/* 禁用文本选择和复制（可选） */
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 允许输入框文本选择 */
input, textarea, [contenteditable] {
  -webkit-user-select: text;
  -khtml-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}
</style>
