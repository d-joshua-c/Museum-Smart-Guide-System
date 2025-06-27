<!-- src/components/SectionScroller.vue -->
<template>
  <div ref="swiperContainer" class="swiper section-scroller">
    <div class="swiper-wrapper">
      <!--
        1. 直接在组件内部使用 v-for 循环 props 传入的 items 数组。
        2. 每个循环项依然是 Swiper.js 需要的 swiper-slide。
      -->
      <div v-for="(item, index) in items" :key="item.id || index" class="swiper-slide">
        <!--
          3. 使用作用域插槽 <slot>。
          这将允许父组件自定义每个 slide 内部的内容。
          我们把循环中的 'item' 和 'index' 变量传递出去。
        -->
        <slot :index="index" :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import Swiper from 'swiper'
  import { Autoplay, Mousewheel } from 'swiper/modules' // 导入 Autoplay 和 Mousewheel 模块
  import { onMounted, ref, watch } from 'vue'
  import 'swiper/css'

  // 1. 定义 props，接收父组件传递过来的数据数组
  const props = defineProps({
    items: {
      type: Array,
      required: true,
    },
  })

  const swiperContainer = ref(null)
  const swiperInstance = ref(null)

  onMounted(() => {
    // 确保在 DOM 准备好后初始化
    swiperInstance.value = new Swiper(swiperContainer.value, {
      modules: [Autoplay, Mousewheel], // 注册模块
      direction: 'vertical',
      mousewheel: true,
      slidesPerView: 1,
      // loop: true 现在可以正常工作了！
      loop: true,
      // 新增：自动轮播选项
      // autoplay: {
      //   delay: 10_000, // 3秒切换一次
      //   disableOnInteraction: false, // 用户操作后不停止自动轮播
      // },
    })
  })

  // (可选但推荐) 监听 items 数组的变化，如果数据动态更新，则更新 Swiper
  watch(() => props.items, _newVal => {
    if (swiperInstance.value) {
      // nextTick 确保 DOM 已经根据新数据更新完毕
      // Vue.nextTick(() => { ... }) 在 Vue 3 中通常用异步函数或 import { nextTick } from 'vue'
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          swiperInstance.value.update() // 更新 Swiper
          // 对于循环模式，最好是销毁并重建 loop
          swiperInstance.value.loopDestroy()
          swiperInstance.value.loopCreate()
        })
      })
    }
  }, { deep: true })

</script>

<style scoped>
.section-scroller, .swiper-slide {
  width: 100%;
  height: 100%;
}
</style>
