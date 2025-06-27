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
  import { ref } from 'vue'
  import ChatMessageRenderer from '@/components/ChatMessageRenderer.vue'
  import { useAppStore } from '@/stores/app'
  import { useUserStore } from '@/stores/userStore'

  const appStore = useAppStore() // 仅用于测试功能，不影响现有逻辑
  const userStore = useUserStore()
  const isLoading = ref(false)
  const userInput = ref('')
  const userDialog = ref(false)

  // 1. 定义你的自定义系统提示词
  const systemPrompt = ref(`
你是一个博物馆导游，游客的游览路线中中有以下展品
 你的任务是基于我提供的展品信息和产品的位置，用生动、有趣且富有知识性的语言回答用户的问题。
 请不要编造信息，如果不知道答案，就礼貌地表示不清楚。你的回答应该简洁明了，并能激发用户对艺术的兴趣.
溪山行旅
**完整介绍（中文翻译）：**
吴历是清初正统画派六大家之一，他最初通过王时敏（1592-1680）收藏的《小中见大》画册学习古画。该画册收录了王氏所藏宋元名作的小幅摹本。
《溪山行旅》约作于1670年代，吴历细致摹写了元末画家王蒙的构图，但通过生动自如的笔法赋予作品新生命。在笔、墨、纸与对象的互动中，吴历的笔触和构图随“势”而生，充满表现力。
除了精湛的笔法，吴历还善于用墨，通过不同层次的灰色，营造出明亮的空间氛围，这也是他的标志之一。这幅画的位置在您右后方
奥古斯都皇帝大理石肖像
标签：古罗马 西方
完整介绍：
这件大于真人尺寸的雕像残片，可能原为一尊奥古斯都皇帝坐像的一部分，制作于其继子兼继任者提比略在位时期。目前已知有两百五十多件奥古斯都的肖像，包括许多全身雕像。古代时，青铜雕像数量可能与大理石雕像相当，但现存青铜雕像极少。奥古斯都本人曾声称，仅在罗马城内就拆除了八十尊以他为名的银像。
尽管奥古斯都的面容具有个性特征，但雕像表现为理想化、永葆青春的形象。他公元14年去世时已77岁，但没有任何晚年肖像流传下来。这副作品的位置在您右后方。
舞蹈课
标签： 西方 现代
完整介绍：
这幅作品及其巴黎奥赛美术馆的变体，是德加关于舞蹈主题最宏大的绘画。约有二十四位女性——芭蕾舞者及其母亲——在一旁等待，一名舞者正在接受考核，展示“姿态”动作。著名芭蕾大师朱尔斯·佩罗主持课程。虚构场景设在刚被烧毁的巴黎歌剧院排练厅。镜子旁墙上贴有罗西尼歌剧《威廉·退尔》的海报，致敬委托此画并借展1876年印象派展览的歌手让-巴蒂斯特·福尔。这副作品的位置在您右后方。


`)

  // 2. 初始化消息历史
  //    - 将系统提示作为第一条消息（但不在界面上显示）。
  //    - 将初始的 AI 欢迎语作为第二条消息（在界面上显示）。
  const messages = ref([
    // 这是显示在界面上的消息
    { id: Date.now(), role: 'assistant', content: '你好！我是AI导览员，你可以问我任何关于展品的问题。' },
  ])

  async function sendMessage () {
    if (!userInput.value.trim() || isLoading.value) return

    const userMessageContent = userInput.value
    // 将用户消息添加到界面
    messages.value.push({ id: Date.now(), role: 'user', content: userMessageContent })
    userInput.value = ''
    isLoading.value = true

    // 添加一个空的 AI 消息占位符，用于填充流式数据
    const aiMessageId = Date.now() + 1
    messages.value.push({ id: aiMessageId, role: 'assistant', content: '' })

    // 3. 构造发送给 DeepSeek API 的消息历史
    //    - DeepSeek 需要 'assistant' 角色，而不是 'ai'。
    //    - 我们需要包含系统提示、历史对话和当前用户提问。
    const apiMessages = [
      { role: 'system', content: systemPrompt.value },
      // 包含历史对话，最多取最近的几条以防止 token 超出限制（例如最近10条）
      ...messages.value.slice(-11, -1).map(msg => ({
        role: msg.role, // 'user' or 'assistant'
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
            model: 'deepseek-chat', // 或其他你选择的模型
            messages: apiMessages,
            stream: true,
            // 其他可选参数，如 temperature, max_tokens 等
            temperature: 0.7,
          }),
        },
      )

      if (!response.body) {
        throw new Error('Response body is null.')
      }

      // 4. 解析 DeepSeek 的流式响应
      //    - 格式与 OpenAI 兼容，与 Dify 类似。
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
              // 流结束的标志
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
      // 测试功能：AI消息发送完成后触发事件（不影响现有逻辑）
      appStore.triggerFirstAiMessage()
    }
  }

// 注意：由于我们直接调用了外部 API，Vite 的代理就不再需要了。
// 但在生产环境中，为了安全，仍然推荐使用后端代理来隐藏 API Key。
// 在本地开发阶段，当前做法是可行的。
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
