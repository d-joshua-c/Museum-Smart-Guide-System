<!-- src/views/ExhibitViewer.vue -->
<template>
  <div class="exhibit-viewer-container">
    <!--
      1. 将展品数据 'exhibits' 通过 :items="exhibits" prop 传递给 SectionScroller。
    -->
    <SectionScroller :items="exhibits">
      <!--
        2. 使用 v-slot 指令来接收作用域插槽暴露出来的数据。
        v-slot:default="{ item }" 表示我们正在定义默认插槽的内容，
        并从插槽获取名为 'item' 的变量。
      -->
      <template #default="{ item }">
        <!--
          这里是每个 slide 的具体内容。
          我们使用来自插槽的 'item' 变量。
          背景图现在也在这里设置。
        -->
        <div
          class="exhibit-slide"
          :style="{ backgroundImage: `url(${item.imageUrl})` }"
        >
          <div class="d-flex fill-height justify-center align-end">
            <v-card class="exhibit-card ma-4" elevation="8">
              <v-card-title>{{ item.title }}</v-card-title>
              <v-card-text>{{ item.description }}</v-card-text>
            </v-card>
          </div>
        </div>
      </template>
    </SectionScroller>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import SectionScroller from '../components/SectionScroller.vue' // 路径保持正确

  // 展品数据保持不变
  const exhibits = ref(
    [
      {
        id: 1,
        title: '奥古斯都皇帝肖像',
        description: '罗马帝国时期皇帝肖像，理想化年轻形象，可能原为坐像一部分。',
        imageUrl: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/247993/1419520/main-image',
      },
      {
        id: 3,
        title: '溪山行旅图',
        description: '清初吴历仿王蒙山水，笔墨生动，墨色丰富，气韵独特。',
        imageUrl: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/41485/150607/main-image',
      },
      {
        id: 7,
        title: '舞蹈教室',
        description: '德加以芭蕾舞课程为题，描绘舞者与母亲等候考试，细腻生动。',
        imageUrl: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/438817/2007191/main-image',
      },
    ],
  )
</script>

<style scoped>
.exhibit-viewer-container {
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
}

/* 这个样式现在定义在父组件中，因为它属于 slide 的内容 */
.exhibit-slide {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.exhibit-card {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 12px !important;
}
</style>
