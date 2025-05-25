<template>
  <div class="user-profile-page" v-if="profile">
    <!-- 背景横幅区域 -->
    <div class="profile-banner">
      <div class="banner-background"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="profile-content">
      <!-- 头像和基本信息区域 -->
      <div class="profile-main">
        <div class="avatar-section">
          <img :src="effectiveAvatarSrc" alt="用户头像" class="avatar">
        </div>

        <div class="profile-info">
          <div class="name-and-actions">
            <div class="user-name">
              <h1>{{ profile.username }}</h1>
              <p class="user-handle">@{{ profile.username }}</p>
            </div>

            <!-- 操作按钮区域 -->
            <div class="action-buttons">
              <router-link
                v-if="currentUser && currentUser._id === profile._id"
                to="/settings/profile"
                class="btn btn-edit">
                编辑个人资料
              </router-link>
              <button v-else class="btn btn-follow">关注</button>
            </div>
          </div>

          <!-- 个人简介 -->
          <div class="bio-section" v-if="profile.bio">
            <p class="bio">{{ profile.bio }}</p>
          </div>

          <!-- 元信息 -->
          <div class="meta-info">
            <div class="meta-item">
              <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <span>注册于 {{ formatDate(profile.createdAt) }}</span>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="stats-section">
            <div class="stat-item">
              <span class="stat-number">0</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">0</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">0</span>
              <span class="stat-label">动态</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 导航标签 -->
      <div class="profile-nav">
        <div class="nav-tabs">
          <button class="nav-tab active">动态</button>
          <button class="nav-tab">回复</button>
          <button class="nav-tab">媒体</button>
          <button class="nav-tab">喜欢</button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="user-content">
        <div class="content-placeholder">
          <p>这里将来会显示用户的动态列表...</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载状态 -->
  <div v-else-if="isLoading" class="loading-state">
    <div class="loading-spinner"></div>
    <p>正在加载用户资料...</p>
  </div>

  <!-- 错误状态 -->
  <div v-else class="error-state">
    <div class="error-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
    <h3>找不到用户</h3>
    <p>未能加载用户资料，或用户不存在。</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import defaultAvatarPath from '/images/default_avatar.jpg';

const route = useRoute();
const authStore = useAuthStore();

const profile = computed(() => authStore.getViewedProfile);
const isLoading = computed(() => authStore.authStatus.isLoading);
const currentUser = computed(() => authStore.currentUser);
const defaultAvatar = ref(defaultAvatarPath);

const effectiveAvatarSrc = computed(() => {
  if (profile.value && profile.value.avatar && profile.value.avatar !== 'default_avatar.png') {
    if (profile.value.avatar.startsWith('http://') || profile.value.avatar.startsWith('https://')) {
        return profile.value.avatar;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    return `${baseUrl}${profile.value.avatar}`;
  }
  return defaultAvatar.value;
});

const loadProfile = async () => {
  const username = route.params.username;
  const userId = route.params.id;

  if (username) {
    await authStore.fetchPublicProfile(username, 'username');
  } else if (userId) {
    await authStore.fetchPublicProfile(userId, 'id');
  } else {
    console.error('No user identifier (username or id) found in route params.');
  }
};

watch(() => route.params, (newParams, oldParams) => {
  if (newParams.username !== oldParams.username || newParams.id !== oldParams.id) {
    loadProfile();
  }
}, { deep: true });

onMounted(() => {
  loadProfile();
});

onBeforeUnmount(() => {
  authStore.clearViewedProfile();
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('zh-CN', options);
};
</script>

<style scoped>
.user-profile-page {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--card-background, #ffffff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* 背景横幅 */
.profile-banner {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.banner-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--secondary-color, #8b5cf6) 100%);
}

/* 主要内容区域 */
.profile-content {
  position: relative;
  background: var(--card-background, #ffffff);
}

/* 头像和信息区域 */
.profile-main {
  padding: 0 24px;
  padding-bottom: 24px;
}

.avatar-section {
  position: relative;
  margin-top: -66px;
  margin-bottom: 16px;
}

.avatar {
  width: 132px;
  height: 132px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--card-background, #ffffff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 姓名和操作按钮 */
.name-and-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-name h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--text-color, #1f2937);
  line-height: 1.2;
}

.user-handle {
  font-size: 16px;
  color: var(--text-secondary, #6b7280);
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.action-buttons {
  flex-shrink: 0;
  margin-left: 16px;
}

.btn {
  min-height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  border: 1px solid;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-edit {
  background-color: transparent;
  border-color: var(--border-color, #d1d5db);
  color: var(--text-color, #1f2937);
}

.btn-edit:hover {
  background-color: var(--background-color, #f8fafc);
  border-color: var(--primary-color, #3b82f6);
}

.btn-follow {
  background-color: var(--primary-color, #3b82f6);
  border-color: var(--primary-color, #3b82f6);
  color: white;
}

.btn-follow:hover {
  background-color: var(--primary-hover, #2563eb);
  border-color: var(--primary-hover, #2563eb);
}

/* 个人简介 */
.bio-section {
  margin-bottom: 16px;
}

.bio {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-color, #1f2937);
  margin: 0;
  white-space: pre-wrap;
}

/* 元信息 */
.meta-info {
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 6px;
}

.icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  fill: currentColor;
}

/* 统计信息 */
.stats-section {
  display: flex;
  gap: 24px;
}

.stat-item {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 0;
}

.stat-item:hover .stat-label {
  text-decoration: underline;
  color: var(--primary-color, #3b82f6);
}

.stat-number {
  font-weight: 700;
  font-size: 18px;
  color: var(--text-color, #1f2937);
  margin-right: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

/* 导航标签 */
.profile-nav {
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  position: sticky;
  top: 0;
  background: var(--card-background, #ffffff);
  z-index: 10;
}

.nav-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 24px;
}

.nav-tab {
  flex: 1;
  min-width: 80px;
  height: 48px;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  font-family: inherit;
}

.nav-tab:hover {
  background-color: var(--background-color, #f8fafc);
  color: var(--text-color, #1f2937);
}

.nav-tab.active {
  color: var(--primary-color, #3b82f6);
  font-weight: 600;
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 2px;
  background-color: var(--primary-color, #3b82f6);
  border-radius: 1px;
}

/* 内容区域 */
.user-content {
  min-height: 400px;
  background: var(--card-background, #ffffff);
}

.content-placeholder {
  padding: 48px 24px;
  text-align: center;
  color: var(--text-secondary, #6b7280);
  font-size: 16px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  font-family: inherit;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color, #e5e7eb);
  border-top: 3px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state p {
  color: var(--text-secondary, #6b7280);
  font-size: 16px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 48px 24px;
  text-align: center;
  font-family: inherit;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 20px;
}

.error-state h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  margin: 0 0 12px 0;
}

.error-state p {
  font-size: 16px;
  color: var(--text-secondary, #6b7280);
  margin: 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile-page {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .profile-banner {
    height: 160px;
  }

  .profile-main {
    padding: 0 16px 20px;
  }

  .avatar-section {
    margin-top: -50px;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .user-name h1 {
    font-size: 20px;
  }

  .name-and-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .action-buttons {
    margin-left: 0;
    align-self: stretch;
  }

  .btn {
    width: 100%;
  }

  .stats-section {
    gap: 16px;
  }

  .nav-tabs {
    padding: 0 16px;
  }

  .content-placeholder {
    padding: 32px 16px;
  }
}

@media (max-width: 480px) {
  .profile-main {
    padding: 0 12px 16px;
  }

  .stats-section {
    gap: 12px;
  }

  .stat-number {
    font-size: 16px;
  }

  .nav-tabs {
    padding: 0 12px;
  }

  .content-placeholder {
    padding: 24px 12px;
  }
}
</style>
