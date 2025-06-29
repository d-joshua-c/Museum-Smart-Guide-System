<template>
  <div class="exhibit-viewer-container">
    <SectionScroller :items="exhibits">
      <template #default="{ item }">
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
  import SectionScroller from '../components/SectionScroller.vue'
  import { itemsOnDisplay } from '../utils/exhibits.js'

  const exhibits = ref(itemsOnDisplay)
</script>

<style scoped>
.exhibit-viewer-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

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
