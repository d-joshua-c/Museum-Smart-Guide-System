<template>
  <div>
    <!-- 如果是JSON列表，则渲染列表 -->
    <template v-if="isJsonList">
      <v-list bg-color="transparent" density="compact">
        <v-list-item
          v-for="(item, index) in jsonData"
          :key="index"
          :subtitle="item.description"
          :title="item.title"
        />
      </v-list>
    </template>
    <!-- 否则，渲染Markdown -->
    <template v-else>
      <div v-html="parsedMarkdown" />
    </template>
  </div>
</template>

  <script setup>
  import { marked } from 'marked'
  import { computed } from 'vue'

  const props = defineProps({
    content: {
      type: String,
      required: true,
    },
  })

  // 解析JSON
  const jsonData = computed(() => {
    // 尝试从 markdown 代码块中提取 JSON
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/
    const match = props.content.match(jsonRegex)
    if (match && match[1]) {
      try {
        return JSON.parse(match[1])
      } catch {
        return null
      }
    }
    return null
  })

  const isJsonList = computed(() => {
    return Array.isArray(jsonData.value) && jsonData.value.every(item => 'title' in item)
  })

  // 解析Markdown
  const parsedMarkdown = computed(() => {
    // 如果是JSON列表，我们不渲染原始文本
    if (isJsonList.value) return ''
    // 配置 marked，例如启用 GFM (GitHub Flavored Markdown)
    return marked.parse(props.content, { gfm: true, breaks: true })
  })

  </script>
