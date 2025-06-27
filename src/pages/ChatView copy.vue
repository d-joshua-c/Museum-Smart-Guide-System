<template>
  <!-- 使用 v-layout 作为根布局容器 -->
  <v-layout class="chat-page-container">
    <!-- 使用 v-app-bar 替换 header, 并添加 app 属性 -->
    <v-app-bar
      app
      color="transparent"
      density="compact"
      flat
      style="backdrop-filter: blur(10px);"
    >
      <v-toolbar-title class="header-title">旁征博引</v-toolbar-title>
      <v-spacer />
      <v-btn
        class="avatar-button"
        icon
        variant="elevated"
        @click="userDialog = true"
      >
        <v-avatar :image="userStore.avatar" size="36" />
      </v-btn>
    </v-app-bar>

    <!-- v-main 会自动填充 v-app-bar 和 v-footer 之间的剩余空间 -->
    <v-main class="chat-main">
      <div class="messages-container">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message-wrapper', { 'user-message': msg.role === 'user' }]"
        >
          <div class="message-bubble">
            <ChatMessageRenderer :content="msg.content" />
          </div>
        </div>
        <!-- Scroll to bottom anchor -->
        <div ref="messagesEnd" />
      </div>
    </v-main>

    <!-- 使用 v-footer 替换 footer, 并添加 app 属性 -->
    <v-footer app class="chat-input-section" style="backdrop-filter: blur(10px);">
      <v-text-field
        v-model="userInput"
        class="chat-input"
        density="comfortable"
        :disabled="isLoading"
        hide-details
        :loading="isLoading"
        placeholder="向我提问..."
        variant="outlined"
        @keyup.enter="sendMessage"
      >
        <template #append-inner>
          <v-btn
            color="primary"
            :disabled="!userInput.trim() || isLoading"
            icon="mdi-send"
            size="small"
            variant="flat"
            @click="sendMessage"
          />
        </template>
      </v-text-field>
    </v-footer>

    <!-- User info dialog 保持不变, 放置在 v-layout 内部是没问题的 -->
    <v-dialog v-model="userDialog" max-width="500px">
      <v-card>
        <!-- ... card content ... -->
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
  </v-layout>
</template>

<script setup>
  import { nextTick, ref } from 'vue'
  import ChatMessageRenderer from '@/components/ChatMessageRenderer.vue'
  import { useUserStore } from '@/stores/userStore'

  const userStore = useUserStore()
  const messages = ref([
    { id: 1, role: 'ai', content: '你好！我是AI导览员，你可以问我任何关于展品的问题。' },
  ])
  const userInput = ref('')
  const isLoading = ref(false)
  const userDialog = ref(false)
  const tempName = ref(userStore.name)
  const messagesEnd = ref(null)

  function saveUserInfo () {
    userStore.setName(tempName.value)
    userDialog.value = false
  }

  async function sendMessage () {
    if (!userInput.value.trim() || isLoading.value) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userInput.value,
    }

    messages.value.push(userMessage)
    const query = userInput.value
    userInput.value = ''
    isLoading.value = true

    try {
      // 模拟AI回复
      await new Promise(resolve => setTimeout(resolve, 1000))

      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: `感谢您的问题："${query}"。我是AI导览员，很高兴为您介绍博物馆的展品信息。`,
      }

      messages.value.push(aiMessage)

      // 滚动到底部
      await nextTick()
      if (messagesEnd.value) {
        messagesEnd.value.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      isLoading.value = false
    }
  }
</script>

<style scoped>
/* 主容器 - v-layout 现在处理布局，这里主要设置背景和高度 */
.chat-page-container {
  height: 100dvh;
  overflow: hidden;
}

/* 头部区域的样式已不再需要，v-app-bar 会自行处理 */
/* .chat-header, .header-content { ... } */

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
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

/* 主聊天区域 - v-main 会自动处理其位置和大小，无需 flex 属性 */
.chat-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
  /* 自定义滚动条 */
  scrollbar-width: thin;
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  border-radius: 2px;
}

/* 消息样式 */
.message-wrapper {
  display: flex;
  margin-bottom: 16px;
  animation: fadeInUp 0.3s ease-out;
}

.message-wrapper.user-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(67, 67, 67, 0.9);
  backdrop-filter: blur(10px);
  margin: 0 8px;
  word-wrap: break-word;
  transition: all 0.3s ease;
}

.user-message .message-bubble {
  background: #4a90e2;
  color: white;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 输入区域 - v-footer 的样式 */
.chat-input-section {
  padding: 16px;
  width: 100dvw;
}

.chat-input {
  transition: all 0.3s ease;
}

.chat-input:focus-within {
  transform: translateY(-2px);
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .header-content {
    padding: 10px 12px;
  }

  .header-title {
    font-size: 1.1rem;
  }

  .messages-container {
    padding: 12px;
  }

  .message-bubble {
    max-width: 85%;
    padding: 10px 14px;
    margin: 0 4px;
  }

  .chat-input-section {
    padding: 12px;
  }
}

/* 移动端浏览器导航栏适配 */
@supports (-webkit-touch-callout: none) {
  /* iOS Safari 特殊处理 */
  .chat-page-container {
    height: -webkit-fill-available;
    min-height: -webkit-fill-available;
  }
}

/* 更进一步的移动端适配 */
@media screen and (max-width: 768px) {
  .chat-page-container {
    /* 使用动态视口高度 */
    height: 100dvh;
    min-height: 100svh; /* 小视口高度作为最小值 */
    max-height: 100lvh; /* 大视口高度作为最大值 */
  }

  /* 强制隐藏任何可能的滚动 */
  body {
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
  }

  /* 确保头部不被状态栏遮挡 */
  .chat-header {
    padding-top: env(safe-area-inset-top, 0);
    background: rgba(0, 0, 0, 0.9);
  }

  /* 确保输入区域不被虚拟键盘遮挡 */
  .chat-input-section {
    padding-bottom: max(12px, env(safe-area-inset-bottom, 0));
    background: rgba(0, 0, 0, 0.95);
  }

  /* 当虚拟键盘出现时调整布局 */
  @media (max-height: 500px) {
    .chat-header {
      padding: 8px 12px;
    }

    .chat-input-section {
      padding: 8px 12px;
    }

    .message-bubble {
      padding: 8px 12px;
      margin: 0 2px;
    }
  }
}

/* 保持对话框样式不变 */
.v-dialog .v-card {
  border-radius: 16px;
}
</style>
