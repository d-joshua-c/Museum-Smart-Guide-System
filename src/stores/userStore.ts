// stores/userStore.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '游客',
    avatar: 'https://cdn.vuetifyjs.com/images/john.jpg', // 默认头像
    id: 'user_' + Date.now(), // 简单生成一个用户ID
  }),
  actions: {
    updateUserInfo ({ name, avatar }) {
      if (name) {
        this.name = name
      }
      if (avatar) {
        this.avatar = avatar
      }
    },
  },
  persist: true, // 使用 pinia-plugin-persistedstate 可以方便地持久化
})
