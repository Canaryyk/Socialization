<template>
  <div class="user-list-page">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ loadingText || '正在加载列表...' }}</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ errorText || '加载列表失败:' }} {{ error }}</p>
    </div>
    <div v-else>
      <h1 class="page-title">{{ title }}</h1>
      <div v-if="users && users.length > 0" class="user-list-container">
        <div v-for="user in users" :key="user._id" class="user-list-item" @click="onUserClick(user)">
          <img :src="resolveAvatar(user.avatar)" :alt="`${user.username}的头像`" class="avatar">
          <div class="user-info">
            <span class="username">{{ user.username }}</span>
            <span class="user-handle">@{{ user.username }}</span>
            <p v-if="user.bio" class="bio">{{ user.bio }}</p>
          </div>
          <!-- Slot for additional actions like follow/unfollow button -->
          <div class="actions-slot">
            <slot name="userActions" :user="user"></slot>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>{{ emptyListText || '列表为空。' }}</p>
      </div>
    </div>
    <button @click="goBack" class="btn btn-back">返回</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import defaultAvatarPath from '/images/default_avatar.jpg';

const props = defineProps({
  users: Array,
  isLoading: Boolean,
  error: [String, null],
  title: String,
  loadingText: String,
  errorText: String,
  emptyListText: String,
});

const router = useRouter();

const resolveAvatar = (avatarPath) => {
  if (!avatarPath || avatarPath === 'default_avatar.png' || avatarPath.includes('default_avatar.jpg')) {
    return defaultAvatarPath;
  }
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  return `${baseUrl}${avatarPath.startsWith('/') ? avatarPath : '/' + avatarPath}`;
};

const onUserClick = (user) => {
  if (user.username) {
    router.push({ name: 'UserProfileByUsername', params: { username: user.username } });
  } else if (user._id) {
    // Assuming you have a route named 'UserProfileById' for ID-based navigation
    router.push({ name: 'UserProfileById', params: { id: user._id } });
  }
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.user-list-page {
  max-width: 700px;
  margin: 20px auto;
  padding: 20px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  margin-bottom: 24px;
  text-align: center;
}

.user-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Reduced gap a bit */
}

.user-list-item {
  display: flex;
  align-items: flex-start; /* Changed to flex-start for better bio alignment */
  padding: 16px;
  background-color: var(--card-background, #ffffff);
  border: 1px solid var(--border-color-light, #e5e7eb);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.user-list-item:hover {
  background-color: var(--background-color, #f8fafc);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.avatar {
  width: 50px; /* Slightly smaller avatar */
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 16px;
  border: 2px solid var(--border-color, #e5e7eb);
  flex-shrink: 0; /* Prevent avatar from shrinking */
}

.user-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allow user info to take available space */
  min-width: 0; /* Important for text overflow */
}

.username {
  font-size: 17px; /* Adjusted size */
  font-weight: 600;
  color: var(--text-color, #1f2937);
}

.user-handle {
  font-size: 14px; /* Adjusted size */
  color: var(--text-secondary, #6b7280);
  margin-bottom: 4px; /* Adjusted margin */
}

.bio {
  font-size: 14px;
  color: var(--text-color-muted, #4b5563);
  line-height: 1.4; /* Adjusted line height */
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word; /* Help with long non-breaking words */
}

.actions-slot {
  margin-left: auto; /* Pushes slot to the right */
  padding-left: 10px; /* Space before slot content */
  flex-shrink: 0; /* Prevent slot from shrinking */
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary, #6b7280);
}

.loading-spinner {
  width: 36px; /* Adjusted size */
  height: 36px;
  border: 3px solid var(--border-color, #e5e7eb);
  border-top: 3px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px; /* Adjusted margin */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-back {
  display: block;
  margin: 24px auto 0; /* Adjusted margin */
  padding: 9px 18px; /* Adjusted padding */
  border-radius: 8px;
  font-weight: 500; /* Adjusted font weight */
  font-size: 14px; /* Adjusted font size */
  border: 1px solid var(--border-color, #d1d5db);
  background-color: transparent;
  color: var(--text-color, #1f2937);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background-color: var(--background-color, #f8fafc);
  border-color: var(--primary-color, #3b82f6);
}
</style>
