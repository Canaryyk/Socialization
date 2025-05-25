<template>
  <header class="nav-bar">
    <div class="nav-container">
      <!-- 左侧：Logo 与菜单 -->
      <div class="nav-left">
        <router-link to="/" class="logo">趣动社区</router-link>
        <nav class="menu-container">
          <ul class="nav-menu">
            <li>
              <router-link to="/" class="nav-menu-item" active-class="is-active" exact-active-class="is-exact-active">首页</router-link>
            </li>
            <li>
              <router-link to="/circle" class="nav-menu-item" active-class="is-active">圈子</router-link>
            </li>
            <li>
              <router-link to="/chat" class="nav-menu-item" active-class="is-active">聊天</router-link>
            </li>
          </ul>
        </nav>
      </div>
      <!-- 右侧：发布动态按钮 -->
      <div class="nav-right">
        <template v-if="isLoggedIn">
          <router-link to="/post" class="action-button publish-button">
            发布动态
          </router-link>
          <div class="user-avatar" @click="goToProfile">
            <img :src="userAvatar" alt="用户头像" />
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="action-button login-button">
            登录
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import defaultFrontendAvatarPath from '/images/default_avatar.jpg'; // 重命名以示区分

const router = useRouter();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const currentUser = computed(() => authStore.currentUser);

const userAvatar = computed(() => {
  const user = currentUser.value;
  if (user && user.avatar && user.avatar !== 'default_avatar.png') {
    // 如果 avatar 已经是完整的 URL (例如旧数据或外部存储)，则直接使用
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
        return user.avatar;
    }
    // 否则，假定是服务器相对路径，需要拼接基础 URL
    // 与 EditProfilePage 和 UserProfilePage 保持一致
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    return `${baseUrl}/public${user.avatar}`; // 例如 http://localhost:5001/public/uploads/avatars/xxxx.jpg
  }
  return defaultFrontendAvatarPath; // 回退到前端的默认头像
});

const goToProfile = () => {
  if (currentUser.value && currentUser.value.username) {
    router.push(`/user/${currentUser.value.username}`);
  } else {
    console.warn('Current user or username not found, redirecting to settings as fallback.');
    router.push('/settings/profile');
  }
};
</script>

<style scoped>
  /* ========== 全局样式变量 ========== */
  /* :root 应该在全局样式表如 base.css 中定义，这里作为参考保留 */
  /*
  :root {
    --text-color: #333;
    --nav-bg: rgba(255, 255, 255, 0.98);
    --transition-fast: 0.3s ease;
    --primary-color: #f7937c;
    --primary-hover: #f25933;
  }
  */

  /* ========== 导航栏容器 ========== */
  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 1000;
    height: 64px;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 0 2rem;
  }

  /* ========== 导航容器布局 ========== */
  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
  }

  /* ========== 左侧导航区域 ========== */
  .nav-left {
    display: flex;
    align-items: center;
    gap: 3rem;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color, #333);
    text-decoration: none; /* 确保 router-link 没有下划线 */
    transition: color 0.3s ease; /* var(--transition-fast) */
  }

  .logo:hover {
    color: var(--primary-color, #f7937c);
  }

  /* ========== 菜单容器 ========== */
  .menu-container {
    flex: 1;
  }

  .nav-menu {
    display: flex;
    list-style: none; /* 移除ul的默认列表样式 */
    padding: 0;
    margin: 0;
    gap: 1.5rem;
  }

  .nav-menu-item {
    display: block; /* 让router-link表现得像块级元素，以便应用padding和高度 */
    height: 64px;
    line-height: 64px; /* 垂直居中文本 */
    padding: 0 1rem;
    font-size: 1rem;
    color: var(--text-color, #333);
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
  }

  .nav-menu-item:hover {
    color: var(--primary-color, #f7937c);
  }

  .nav-menu-item.is-active, /* for /circle, /chat */
  .nav-menu-item.is-exact-active { /* for / */
    color: var(--primary-color, #f7937c);
    font-weight: 500;
  }

  .nav-menu-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--primary-color, #f7937c);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  .nav-menu-item:hover::after,
  .nav-menu-item.is-active::after,
  .nav-menu-item.is-exact-active::after {
    width: 100%;
  }

  /* ========== 右侧导航区域 (如果需要特定样式) ========== */
  .nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  /* ========== 发布按钮 ========== */
  .action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 1.5rem;
    font-weight: 500;
    text-decoration: none;
    border-radius: 20px;
    transition: all 0.3s ease;
  }

  .publish-button {
    background: var(--primary-color, #f7937c);
    color: white;
    box-shadow: 0 2px 8px rgba(247, 147, 124, 0.3);
  }

  .publish-button:hover {
    background: var(--primary-hover, #f25933);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(247, 147, 124, 0.4);
  }

  .login-button {
    background: transparent;
    color: var(--primary-color, #f7937c);
    border: 2px solid var(--primary-color, #f7937c);
  }

  .login-button:hover {
    background: var(--primary-color, #f7937c);
    color: white;
    transform: translateY(-2px);
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;
    border: 2px solid var(--primary-color, #f7937c);
  }

  .user-avatar:hover {
    transform: scale(1.1);
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
