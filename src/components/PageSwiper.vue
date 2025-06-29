<!-- src/components/PageSwiper.vue -->
<template>
  <div ref="swiperContainer" class="swiper page-swiper">
    <div class="swiper-wrapper">
      <!--
          Loop through the 'pages' prop.
          Each item in the array should be an object with a component to render.
        -->
      <div v-for="page in pages" :key="page.id" class="swiper-slide">
        <!--
            Use Vue's built-in <component> to dynamically render the correct page view.
          -->
        <!-- 在渲染页面组件时传递事件 -->
        <component
          :is="page.component"
          v-bind="page.props || {}"
        />
      </div>
    </div>
  </div>
</template>

  <script setup>
  import Swiper from 'swiper'
  import { onMounted, onUnmounted, ref } from 'vue'
  import 'swiper/css'

  // Define props to accept an array of page components
  defineProps({
    pages: {
      type: Array,
      required: true,
    },
  })

  const swiperContainer = ref(null)
  let swiperInstance = null // 保存Swiper实例用于测试功能

  // 测试功能：执行页面切换
  function performTestSwipe () {
    if (swiperInstance) {
      // 只滑动到下一页，不切换回来
      swiperInstance.slideNext()
    }
  }

  // 测试功能：监听AI首次回复事件
  function handleFirstAiMessage () {
    performTestSwipe()
  }

  onMounted(() => {
    swiperInstance = new Swiper(swiperContainer.value, {
      // Direction is 'horizontal' by default, so we don't need to specify it.

      // Ensure slide always snaps to the container
      slidesPerView: 1,

      // Enable mousewheel for desktop navigation
      mousewheel: false, // Usually not desired for horizontal page swiping

      // Add loop for continuous swiping, just like v-carousel's 'continuous'
      loop: true,
    })

    // 测试功能：添加事件监听器（不影响现有功能）
    window.addEventListener('ai-first-message-received', handleFirstAiMessage)
  })

  onUnmounted(() => {
    // 测试功能：清理事件监听器
    window.removeEventListener('ai-first-message-received', handleFirstAiMessage)
    // 清理Swiper实例
    if (swiperInstance) {
      swiperInstance.destroy()
      swiperInstance = null
    }
  })

  </script>

  <style scoped>
  /* Ensure the swiper and its slides fill their container */
  .page-swiper,
  .swiper-slide {
    width: 100%;
    height: 100%;
  }
  </style>
