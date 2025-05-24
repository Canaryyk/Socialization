<template>
  <div class="user-profile-page" v-if="profile">
    <div class="profile-header">
      <img :src="effectiveAvatarSrc" alt="用户头像" class="avatar">
      <h1>{{ profile.username }}</h1>
      <p class="bio">{{ profile.bio || '该用户暂未填写简介。' }}</p>
      <p class="member-since">注册于: {{ formatDate(profile.createdAt) }}</p>

      <!-- 如果是当前用户自己的主页，可以显示编辑按钮 -->
      <router-link v-if="currentUser && currentUser._id === profile._id" to="/settings/profile" class="btn btn-secondary">
        编辑个人资料
      </router-link>
    </div>

    <div class="user-content">
      <h2>{{ profile.username }} 的动态</h2>
      <!-- 这里未来可以集成用户帖子列表组件 -->
      <p>这里将来会显示用户的动态列表...</p>
    </div>
  </div>
  <div v-else-if="isLoading" class="loading-placeholder">
    <p>正在加载用户资料...</p>
  </div>
  <div v-else class="error-placeholder">
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
    return profile.value.avatar; // 使用用户特定的头像
  }
  return defaultAvatar.value; // 回退到前端的默认头像 (.jpg)
});

const loadProfile = async () => {
  const username = route.params.username;
  const userId = route.params.id;

  if (username) {
    await authStore.fetchPublicProfile(username, 'username');
  } else if (userId) {
    await authStore.fetchPublicProfile(userId, 'id');
  } else {
    // Handle error or redirect if no identifier is provided
    console.error('No user identifier (username or id) found in route params.');
    // Potentially redirect to a 404 page or home
  }
};

// Watch for route param changes to reload profile if navigating between user pages
watch(() => route.params, (newParams, oldParams) => {
  if (newParams.username !== oldParams.username || newParams.id !== oldParams.id) {
    loadProfile();
  }
}, { deep: true });

onMounted(() => {
  loadProfile();
});

onBeforeUnmount(() => {
  authStore.clearViewedProfile(); // 清除数据，避免在其他地方意外显示
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

</script>

<style scoped>
.user-profile-page {
  max-width: 768px; /* 稍微增加宽度 */
  margin: 30px auto; /* 增加上下边距 */
  padding: 25px; /* 增加内边距 */
  background-color: #ffffff; /* 使用纯白背景 */
  border-radius: 12px; /* 更大的圆角 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* 更柔和的阴影 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.profile-header {
  text-align: center;
  margin-bottom: 35px; /* 增加底部边距 */
}

.avatar {
  width: 120px; /* 保持尺寸 */
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px; /* 增加头像下方边距 */
  border: 4px solid #f0f0f0; /* 更精致的边框 */
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

h1 {
  font-size: 2.2em; /* 稍微增大字体 */
  font-weight: 600; /* 字体加粗 */
  margin-bottom: 12px;
  color: #333;
}

.bio {
  font-size: 1.05em; /* 稍微增大字体 */
  color: #555;
  margin-bottom: 18px;
  line-height: 1.6;
}

.member-since {
  font-size: 0.95em;
  color: #777;
  margin-bottom: 25px;
}

.btn-secondary {
  padding: 10px 20px; /* 调整内边距 */
  background-color: #007bff; /* 使用主色调 */
  color: white;
  border: none;
  border-radius: 6px; /* 调整圆角 */
  text-decoration: none;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-secondary:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.user-content {
  margin-top: 30px; /* 与头部增加间距 */
}

.user-content h2 {
  font-size: 1.6em; /* 调整字体大小 */
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 1px solid #e9e9e9;
  padding-bottom: 12px;
}

.user-content p {
  font-size: 1em;
  color: #666;
}

/* 加载和错误提示样式 */
.loading-placeholder,
.error-placeholder {
  text-align: center;
  padding: 40px 20px;
  font-size: 1.1em;
  color: #777;
}
</style>
