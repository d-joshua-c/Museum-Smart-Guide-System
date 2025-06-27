// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 简单的事件系统用于测试功能
    firstAiMessageReceived: false,
  }),
  actions: {
    // 触发AI回复完成事件（测试功能）
    triggerFirstAiMessage () {
      if (!this.firstAiMessageReceived) {
        this.firstAiMessageReceived = true
        // 发射自定义事件
        window.dispatchEvent(new CustomEvent('ai-first-message-received'))
      }
    },
  },
})
