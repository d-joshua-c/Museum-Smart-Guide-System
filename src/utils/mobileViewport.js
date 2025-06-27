// src/utils/mobileViewport.js
// 移动端视口适配工具

/**
 * 处理移动端浏览器导航栏动态变化的工具类
 */
export class MobileViewportHandler {
  constructor () {
    this.setupViewportHeight()
    this.setupEventListeners()
  }

  /**
   * 设置CSS自定义属性来处理动态视口高度
   */
  setupViewportHeight () {
    const setViewportHeight = () => {
      // 获取真实的视口高度
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)

      // 设置安全区域
      const safeAreaTop = this.getSafeAreaInset('top')
      const safeAreaBottom = this.getSafeAreaInset('bottom')

      document.documentElement.style.setProperty('--safe-area-top', `${safeAreaTop}px`)
      document.documentElement.style.setProperty('--safe-area-bottom', `${safeAreaBottom}px`)
    }

    // 初始设置
    setViewportHeight()

    // 监听窗口大小变化
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100) // 延迟执行以确保获取正确的值
    })
  }

  /**
   * 获取安全区域内边距
   */
  getSafeAreaInset (position) {
    const element = document.createElement('div')
    element.style.position = 'fixed'
    element.style[position] = '0'
    element.style.width = '1px'
    element.style.height = '1px'
    element.style.visibility = 'hidden'
    document.body.append(element)

    const inset = element.getBoundingClientRect()[position]
    element.remove()

    return Math.max(0, inset)
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners () {
    // 监听软键盘弹出
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', this.handleVisualViewportChange.bind(this))
    } else {
      // 回退方案：监听窗口高度变化
      let previousHeight = window.innerHeight
      window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight
        const heightDifference = previousHeight - currentHeight

        if (heightDifference > 150) { // 判断为软键盘弹出
          document.documentElement.classList.add('keyboard-open')
        } else if (heightDifference < -150) { // 判断为软键盘收起
          document.documentElement.classList.remove('keyboard-open')
        }

        previousHeight = currentHeight
      })
    }
  }

  /**
   * 处理视觉视口变化（主要用于软键盘）
   */
  handleVisualViewportChange () {
    const viewport = window.visualViewport
    const heightDifference = window.innerHeight - viewport.height

    if (heightDifference > 150) {
      document.documentElement.classList.add('keyboard-open')
      document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`)
    } else {
      document.documentElement.classList.remove('keyboard-open')
      document.documentElement.style.setProperty('--keyboard-height', '0px')
    }
  }

  /**
   * 强制全屏模式（PWA）
   */
  enableFullscreen () {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  /**
   * 防止页面缩放
   */
  preventZoom () {
    document.addEventListener('gesturestart', e => {
      e.preventDefault()
    })

    document.addEventListener('gesturechange', e => {
      e.preventDefault()
    })

    document.addEventListener('gestureend', e => {
      e.preventDefault()
    })
  }
}

// 创建全局实例
export const mobileViewport = new MobileViewportHandler()
