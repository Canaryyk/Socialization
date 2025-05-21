<template>
  <div id="app">
    <NavBar />
    <main>
      <transition name="fade">
        <router-view />
      </transition>
    </main>
    <Footer />
  </div>
</template>

<script>
  import NavBar from '@/components/layout/NavBar.vue'
  import Footer from '@/components/layout/Footer.vue'

  export default {
    name: 'App',
    components: { NavBar, Footer }
  }
</script>

<style>
  #app {
    background-color: var(--background-color); /* 使用base.css背景色 #f8fafc */
    min-height: 100vh; /* 确保整个应用占满视口 */
    font-family: 'Inter', system-ui, -apple-system, sans-serif; /* 全局字体 */
    color: var(--text-color); /* 默认文字颜色 */
  }

  main {
    min-height: calc(100vh - 120px); /* 动态计算，假设NavBar和Footer各60px */
    padding: 2rem 0; /* 上下内边距，与页面内容协调 */
    background-color: var(--background-color); /* 与全局一致 */
  }

  /* 页面切换动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.75s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    main {
      padding: 1rem 0; /* 小屏幕减小内边距 */
    }
  }
</style>
