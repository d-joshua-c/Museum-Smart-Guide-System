<template>
  <div class="chat-page-container">
    <!-- 消息区域 -->
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

    <!-- 输入区域 -->
    <div class="chat-input-section">
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
    </div>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import ChatMessageRenderer from '@/components/ChatMessageRenderer.vue'
  import { useAppStore } from '@/stores/app'
  import { useUserStore } from '@/stores/userStore'
  import { defaultWelcomeMessage, museumGuidePrompt } from '@/utils/prompts'

  const appStore = useAppStore()
  const userStore = useUserStore()
  const isLoading = ref(false)
  const userInput = ref('')

  // 系统提示词
  const systemPrompt = ref(museumGuidePrompt)

  // 初始化消息历史
  const messages = ref([
    { id: Date.now(), role: 'assistant', content: defaultWelcomeMessage },
  ])

  async function sendMessage () {
    if (!userInput.value.trim() || isLoading.value) return

    const userMessageContent = userInput.value
    messages.value.push({ id: Date.now(), role: 'user', content: userMessageContent })
    userInput.value = ''
    isLoading.value = true

    const aiMessageId = Date.now() + 1
    messages.value.push({ id: aiMessageId, role: 'assistant', content: '' })

    const apiMessages = [
      { role: 'system', content: systemPrompt.value },
      ...messages.value.slice(-11, -1).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    try {
      const response = await fetch(
        'https://api.deepseek.com/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: apiMessages,
            stream: true,
            temperature: 0.7,
          }),
        },
      )

      if (!response.body) {
        throw new Error('Response body is null.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf8')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data.trim() === '[DONE]') {
              break
            }
            try {
              const jsonData = JSON.parse(data)
              const deltaContent = jsonData.choices[0]?.delta?.content

              if (deltaContent) {
                const aiMessage = messages.value.find(m => m.id === aiMessageId)
                if (aiMessage) {
                  aiMessage.content += deltaContent
                }
              }
            } catch (error) {
              console.error('Error parsing stream chunk:', error, 'Chunk:', data)
            }
          }
        }
      }
    } catch (error) {
      console.error('Fetch error:', error)
      const aiMessage = messages.value.find(m => m.id === aiMessageId)
      if (aiMessage) {
        aiMessage.content = '抱歉，连接模型时出错，请稍后再试。'
      }
    } finally {
      isLoading.value = false
      appStore.triggerFirstAiMessage()
    }
  }

</script>

<style scoped>

/* 聊天页面的主容器，采用纵向布局并隐藏溢出内容 */
.chat-page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 消息列表容器，支持滚动，内边距和滚动条样式优化 */
.messages-container {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

/* 优化消息列表滚动条样式，仅在 Webkit 内核浏览器生效 */
.messages-container::-webkit-scrollbar {
  width: 4px; /* 设置滚动条宽度为4px，更加细致美观 */
}
.messages-container::-webkit-scrollbar-track {
  background: transparent; /* 滚动条轨道设置为透明，减少视觉干扰 */
}
.messages-container::-webkit-scrollbar-thumb {
  border-radius: 2px; /* 滚动条滑块圆角处理，提升手感和观感 */
}

/* 单条消息的外层包裹，带有动画和间距 */
.message-wrapper {
  display: flex;
  margin-bottom: 16px;
  animation: fadeInUp 0.3s ease-out;
}

/* 消息气泡样式，圆角、背景模糊和内边距 */
.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(67, 67, 67, 0.9);
  backdrop-filter: blur(10px);
  margin: 0 8px;
  word-wrap: break-word;
  transition: all 0.3s ease;
  /* 字体设置 */
  font-family: "Noto Serif SC", serif;
  /* 根据字号的光学优化 */
  font-optical-sizing: auto;
  font-weight: 0.8rem;
  font-style: normal;
}

/* 用户消息靠右对齐 */
.message-wrapper.user-message {
  justify-content: flex-end;
}

/* 用户消息气泡的专属样式，蓝色背景和白色字体 */
.user-message .message-bubble {
  background: #4a90e2;
  color: white;
}

/* 鼠标悬停时气泡的浮起和阴影效果 */
.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 接下来是输入框的样式部分 */
/* 输入区域的样式，带有背景模糊和内边距 */
.chat-input-section {
  padding: 16px;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

/* 输入框的过渡动画 */
.chat-input {
  transition: all 0.3s ease;
}

/* 输入框聚焦时的上移效果 */
.chat-input:focus-within {
  transform: translateY(-2px);
}

/* 手机端的样式优化 */
@media (max-width: 600px) {
  .messages-container {
    padding: 3%;
  }

  .message-bubble {
    max-width: 80%;
    padding: 3% 3% 3% 6%;
    margin: 0 4px;
  }

  .chat-input-section {
    padding: 12px;
  }
}

/**
 * @description
 * 这个动画作用于所有的消息, 定义了一个名为 fadeInUp 的关键帧动画。
 * 动画效果：元素从下方（Y轴正方向20px）逐渐上移到原位，并且透明度从0变为1，实现“向上淡入”的动画效果。
 * 常用于页面元素的进入动画，提升用户体验。
 */
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

</style>
