// App.vue
<template>
  <div id="app-container">
    <!-- 最好给外层 div 一个更具体的 id 或 class，避免与 #app 冲突 -->
    <NavBar />
    <main class="app-main-content">
      <!-- 已有的 class -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup>
  // 改为 <script setup>
  import { onMounted } from 'vue';
  import { useAuthStore } from '@/stores/authStore';
  import NavBar from '@/components/layout/NavBar.vue';
  import Footer from '@/components/layout/Footer.vue';

  // 在 <script setup> 顶层调用是正确的
  const authStore = useAuthStore();

  onMounted(() => {
    authStore.fetchCurrentUser();
  });

  // 不需要显式的 components 注册和 export default
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
    transition: opacity 0.2s ease;
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
