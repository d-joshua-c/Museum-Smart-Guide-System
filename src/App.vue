<template>
  <v-app>
    <!-- 全局应用栏, 添加了背景图和移动的缩放的功能 -->
    <v-app-bar
      app
      color="transparent"
      elevation="2"
      image="https://picsum.photos/1920/1080?random"
      scroll-behavior="hide fade-image"
      scroll-threshold="100"
      style="backdrop-filter: blur(10px);"
    >
      <template #prepend>
        <v-app-bar-nav-icon />
      </template>
      <v-toolbar-title class="header-title">旁征博引</v-toolbar-title>
      <template #append>
        <v-btn
          class="avatar-button"
          icon
          variant="elevated"
          @click="userDialog = true"
        >
          <v-avatar :image="userStore.avatar" size="36" />
        </v-btn>

        <v-btn icon="mdi-magnify" />

        <v-btn icon="mdi-dots-vertical" />
      </template>
    </v-app-bar>

    <!-- 主内容区域 - 页面切换在这里进行 -->
    <v-main class="app-main">
      <div class="app-container">
        <PageSwiper :pages="pages" />
      </div>
    </v-main>

    <!-- 用户信息对话框 -->
    <v-dialog v-model="userDialog" max-width="500px">
      <v-card>
        <v-card-title>用户信息</v-card-title>
        <v-card-text>
          <v-text-field v-model="tempName" label="昵称" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue-darken-1" variant="text" @click="userDialog = false">取消</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveUserInfo">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
  import { markRaw, ref } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  import PageSwiper from './components/PageSwiper.vue'
  import ChatView from './pages/ChatView.vue'
  import ExhibitionView from './pages/ExhibitionView.vue'

  const userStore = useUserStore()
  const userDialog = ref(false)
  const tempName = ref(userStore.name)
  const activePageIndex = ref(0)

  // 页面配置
  const pages = ref([
    { id: 'chat', component: markRaw(ChatView) },
    { id: 'exhibit', component: markRaw(ExhibitionView) },
  ])

  // 处理页面切换
  function handlePageChange (newIndex) {
    // 这里可以添加页面切换的逻辑
    // PageSwiper 组件需要支持程序化切换
    console.log('切换到页面:', newIndex)
  }

  // 保存用户信息
  function saveUserInfo () {
    userStore.setName(tempName.value)
    userDialog.value = false
  }

</script>

<style>
/* 引入 Google 字体，使用 Noto Serif SC 和 Zhi Mang Xing 字体 */
/* Noto Serif SC 用于中文AI聊天，Zhi Mang Xing 用于艺术风格 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&family=Zhi+Mang+Xing&display=swap');

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
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.app-container {
  height: 100%;
  width: 100%;
  position: relative;
}

/* 标题样式 - 使用更具体的选择器 */
.v-app-bar .v-toolbar-title.header-title {
  font-family: "Zhi Mang Xing", cursive;
  font-style: normal;
  font-size: 2.0rem;
  font-weight: 500;
  margin: 0;
}

.avatar-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.avatar-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* 移动端优化 */
@media screen and (max-width: 768px) {
  .app-main {
    height: calc(var(--vh, 1vh) * 100);
    min-height: -webkit-fill-available;
  }

  body {
    -webkit-overflow-scrolling: touch;
    overflow: hidden;
    position: fixed;
    width: 100%;
  }

  .v-application {
    height: calc(var(--vh, 1vh) * 100);
    min-height: -webkit-fill-available;
  }

  .header-title {
    font-size: 1.5rem;
  }

  .bottom-navigation {
    padding: 8px 12px;
    padding-bottom: max(8px, env(safe-area-inset-bottom, 0));
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
