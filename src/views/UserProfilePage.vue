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
              <button
                v-else-if="currentUser && profile"
                @click="toggleFollow"
                :class="['btn', isFollowingProfile ? 'btn-unfollow' : 'btn-follow']"
                :disabled="authStore.authStatus.isLoading">
                {{ isFollowingProfile ? '取消关注' : '关注' }}
                <span v-if="authStore.authStatus.isLoading && targetedAction" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              </button>
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
            <div class="stat-item" @click="navigateToFollowing">
              <span class="stat-number">{{ profile.following ? profile.following.length : 0 }}</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="stat-item" @click="navigateToFollowers">
              <span class="stat-number">{{ profile.followers ? profile.followers.length : 0 }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ profile.likesCount || 0 }}</span>
              <span class="stat-label">获赞</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 导航标签 -->
      <div class="profile-nav">
        <div class="nav-tabs">
          <button class="nav-tab" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">
            动态 {{ profile.postsCount || 0 }}
          </button>
          <button class="nav-tab" :class="{ active: activeTab === 'replies' }" @click="activeTab = 'replies'">
            回复
          </button>
          <button class="nav-tab" :class="{ active: activeTab === 'media' }" @click="activeTab = 'media'">
            媒体
          </button>
          <button class="nav-tab" :class="{ active: activeTab === 'likes' }" @click="activeTab = 'likes'">
            喜欢
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="user-content">
        <!-- 动态 Tab -->
        <div v-if="activeTab === 'posts'">
          <div v-if="contentStatus.isLoadingPosts" class="loading-content">正在加载动态...</div>
          <div v-else-if="contentStatus.errorPosts" class="error-content">加载动态失败: {{ contentStatus.errorPosts }}</div>
          <div v-else-if="posts && posts.length > 0">
            <!-- 假设你有一个 PostItem 组件来显示单个帖子 -->
            <!-- <PostItem v-for="post in posts" :key="post._id" :post="post" /> -->
            <div v-for="post in posts" :key="post._id" class="mock-post-item">
              <h4>{{ post.title || '帖子标题' }}</h4>
              <p>{{ post.content || '这是帖子的内容...' }}</p>
            </div>
          </div>
          <div v-else class="content-placeholder">该用户还没有发布动态。</div>
        </div>

        <!-- 回复 Tab -->
        <div v-if="activeTab === 'replies'">
          <div v-if="contentStatus.isLoadingReplies" class="loading-content">正在加载回复...</div>
          <div v-else-if="contentStatus.errorReplies" class="error-content">加载回复失败: {{ contentStatus.errorReplies }}</div>
          <div v-else-if="replies && replies.length > 0">
            <!-- 假设你有一个 ReplyItem 组件来显示单个回复 -->
            <!-- <ReplyItem v-for="reply in replies" :key="reply._id" :reply="reply" /> -->
            <div v-for="reply in replies" :key="reply._id" class="mock-reply-item">
              <p>{{ reply.text || '这是回复的内容...' }} (回复于: {{ reply.postId?.title || '某帖子' }})</p>
            </div>
          </div>
          <div v-else class="content-placeholder">该用户还没有发布回复。</div>
        </div>

        <!-- 媒体 Tab -->
        <div v-if="activeTab === 'media'">
          <div v-if="contentStatus.isLoadingMedia" class="loading-content">正在加载媒体...</div>
          <div v-else-if="contentStatus.errorMedia" class="error-content">加载媒体失败: {{ contentStatus.errorMedia }}</div>
          <div v-else-if="media && media.length > 0">
            <!-- 假设你有一个 MediaItem 组件来显示单个媒体项 -->
            <!-- <MediaItem v-for="item in media" :key="item._id" :media="item" /> -->
            <div v-for="item in media" :key="item._id" class="mock-media-item">
              <p>媒体内容: {{ item.url || '媒体链接' }} (类型: {{ item.type || '未知' }})</p>
            </div>
          </div>
          <div v-else class="content-placeholder">该用户还没有发布媒体。</div>
        </div>

        <!-- 喜欢 Tab -->
        <div v-if="activeTab === 'likes'">
          <div v-if="contentStatus.isLoadingLikes" class="loading-content">正在加载喜欢的内容...</div>
          <div v-else-if="contentStatus.errorLikes" class="error-content">加载喜欢的列表失败: {{ contentStatus.errorLikes }}</div>
          <div v-else-if="likedItems && likedItems.length > 0">
            <!-- 假设你有一个 LikedItem 组件来显示单个喜欢的项 -->
            <!-- <LikedItem v-for="item in likedItems" :key="item._id" :item="item" /> -->
            <div v-for="item in likedItems" :key="item._id" class="mock-liked-item">
              <h4>{{ item.title || '喜欢的帖子标题' }}</h4>
              <p>{{ item.content || '喜欢帖子的简要内容...' }}</p>
            </div>
          </div>
          <div v-else class="content-placeholder">该用户还没有喜欢过任何内容。</div>
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
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import defaultAvatarPath from '/images/default_avatar.jpg';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const profile = computed(() => authStore.getViewedProfile);
const isLoading = computed(() => authStore.authStatus.isLoading && !targetedAction.value);
const currentUser = computed(() => authStore.currentUser);
const defaultAvatar = ref(defaultAvatarPath);
const activeTab = ref('posts'); // 默认激活"动态"标签页

// 从 store 获取内容和状态
const posts = computed(() => authStore.getViewedProfilePosts);
const replies = computed(() => authStore.getViewedProfileReplies);
const media = computed(() => authStore.getViewedProfileMedia);
const likedItems = computed(() => authStore.getViewedProfileLikes); // 注意 getter 名称可能不同
const contentStatus = computed(() => authStore.getViewedProfileContentStatus);

const isFollowingProfile = computed(() => authStore.isFollowing);

const targetedAction = ref(false);

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

const loadProfileData = async () => {
  targetedAction.value = false;

  // Ensure route.params is available
  if (!route || !route.params) {
    console.warn("UserProfilePage: route.params not available yet. Skipping profile load.");
    // Clear existing profile if params are not valid, to avoid showing stale data
    // if the component is, for example, re-used for a route without params.
    authStore.clearViewedProfile();
    return;
  }

  const usernameFromRoute = route.params.username;
  const userIdFromRoute = route.params.id;

  let identifier = usernameFromRoute || userIdFromRoute;
  let type = usernameFromRoute ? 'username' : 'id';

  if (identifier) {
    await authStore.fetchPublicProfile(identifier, type);
    // profile.value is updated by the store after the await
    if (profile.value && profile.value._id) {
      fetchContentForActiveTab(profile.value._id);
    } else {
      // If fetchPublicProfile fails, profile.value might be null.
      // authStore.fetchPublicProfile already sets viewedProfile to null on error.
      // Content fetching for tabs also relies on profile.value._id so it won't run if profile is null.
    }
  } else {
    console.error('UserProfilePage: No user identifier (username or id) found in route params.');
    authStore.clearViewedProfile(); // Clear profile if no identifier
  }
};

watch(() => route.params, (newParams, oldParams) => {
  // Ensure newParams is an object before trying to access its properties
  const newUsername = newParams ? newParams.username : undefined;
  const oldUsername = oldParams ? oldParams.username : undefined;
  const newId = newParams ? newParams.id : undefined;
  const oldId = oldParams ? oldParams.id : undefined;

  if (newUsername !== oldUsername || newId !== oldId) {
    loadProfileData();
  }
}, { deep: true, immediate: true });

onMounted(() => {
  // loadProfileData is called by the route.params watcher with immediate:true.
  // However, if route.params were already set and didn't change (e.g. direct navigation),
  // the watcher might not re-trigger load if the initial oldParams and newParams were identical.
  // It's safer to ensure it's called if profile isn't loaded yet.
  // But given immediate:true, this specific onMounted logic might be redundant or even cause double load.
  // The watcher with immediate:true should handle the initial load.
  // Let's simplify onMounted or make its condition more robust.

  // If profile is not yet loaded (e.g. initial state from store is null)
  // and route params are available to fetch one.
  if (!profile.value && (route.params.username || route.params.id)) {
     // console.log("UserProfilePage: onMounted triggering loadProfileData because profile is not set.");
     // loadProfileData(); // This might be redundant due to immediate:true on the watcher.
     // The watcher on route.params with immediate:true should cover this.
     // If it's absolutely necessary, ensure it doesn't cause race conditions.
  } else if (profile.value && profile.value._id && activeTab.value === 'posts' && (!posts.value || posts.value.length === 0) && !contentStatus.value.isLoadingPosts) {
    // This condition was for loading content if profile was already there.
    // This should now be handled by the watch(profile, ...) or the loadProfileData -> fetchContentForActiveTab flow.
    // console.log("UserProfilePage: onMounted triggering content for already loaded profile.");
    // fetchContentForActiveTab(profile.value._id);
  }
});

onBeforeUnmount(() => {
  authStore.clearViewedProfile();
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('zh-CN', options);
};

const toggleFollow = async () => {
  if (!currentUser.value || !profile.value) return;
  if (authStore.authStatus.isLoading) return;

  targetedAction.value = true;
  if (isFollowingProfile.value) {
    await authStore.unfollowUser(profile.value._id);
  } else {
    await authStore.followUser(profile.value._id);
  }
  targetedAction.value = false;
};

const navigateToFollowing = () => {
  if (profile.value) {
    // 根据当前页面的路由名称来决定基础路径
    const identifier = route.name === 'UserProfileByUsername' ? profile.value.username : profile.value._id;
    const basePath = route.name === 'UserProfileByUsername' ? `/user/${identifier}` : `/profile/${identifier}`;
    router.push(`${basePath}/following`);
  }
};

const navigateToFollowers = () => {
  if (profile.value) {
    const identifier = route.name === 'UserProfileByUsername' ? profile.value.username : profile.value._id;
    const basePath = route.name === 'UserProfileByUsername' ? `/user/${identifier}` : `/profile/${identifier}`;
    router.push(`${basePath}/followers`);
  }
};

// 根据 activeTab 获取数据的函数
const fetchContentForActiveTab = (userId) => {
  if (!userId) return;

  switch (activeTab.value) {
    case 'posts':
      authStore.fetchViewedProfilePosts(userId);
      break;
    case 'replies':
      authStore.fetchViewedProfileReplies(userId);
      break;
    case 'media':
      authStore.fetchViewedProfileMedia(userId);
      break;
    case 'likes':
      authStore.fetchViewedProfileLikes(userId);
      break;
    default:
      console.warn('Unknown active tab:', activeTab.value);
  }
};

// 监听 activeTab 的变化，以便在用户切换标签时加载新数据
watch(activeTab, (newTab, oldTab) => {
  if (newTab !== oldTab && profile.value && profile.value._id) {
    fetchContentForActiveTab(profile.value._id);
  }
});

// 当 profile 加载或变化时，如果当前 tab 的数据为空，也尝试加载
watch(profile, (newProfile) => {
  if (newProfile && newProfile._id) {
    // 检查当前激活 tab 的数据是否已加载，如果未加载则加载
    if (activeTab.value === 'posts' && (!posts.value || posts.value.length === 0) && !contentStatus.value.isLoadingPosts) {
      authStore.fetchViewedProfilePosts(newProfile._id);
    } else if (activeTab.value === 'replies' && (!replies.value || replies.value.length === 0) && !contentStatus.value.isLoadingReplies) {
      authStore.fetchViewedProfileReplies(newProfile._id);
    } // 为 media 和 likes 添加类似逻辑
    else if (activeTab.value === 'media' && (!media.value || media.value.length === 0) && !contentStatus.value.isLoadingMedia) {
      authStore.fetchViewedProfileMedia(newProfile._id);
    } else if (activeTab.value === 'likes' && (!likedItems.value || likedItems.value.length === 0) && !contentStatus.value.isLoadingLikes) {
      authStore.fetchViewedProfileLikes(newProfile._id);
    }
  }
}, { deep: true });
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
  color: white;
  border-color: var(--primary-color, #3b82f6);
}

.btn-follow:hover {
  background-color: var(--primary-color-dark, #2563eb);
  border-color: var(--primary-color-dark, #2563eb);
}

.btn-unfollow {
  background-color: transparent;
  color: var(--text-color, #1f2937);
  border-color: var(--border-color-light, #d1d5db);
}

.btn-unfollow:hover {
  background-color: var(--hover-background-light, #f3f4f6);
  border-color: var(--border-color-strong, #adb5bd);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-border-sm {
  width: 1em;
  height: 1em;
  border-width: .2em;
  vertical-align: -0.125em;
  margin-left: 0.5em;
}

.btn-follow .spinner-border-sm {
    border-right-color: white;
    border-top-color: white;
    border-left-color: white;
    border-bottom-color: transparent;
}

.btn-unfollow .spinner-border-sm {
    border-right-color: var(--text-color, #1f2937);
    border-top-color: var(--text-color, #1f2937);
    border-left-color: var(--text-color, #1f2937);
    border-bottom-color: transparent;
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
  min-height: 400px; /* 保持最小高度 */
  background: var(--card-background, #ffffff);
  padding: 16px 24px; /* 给内容区域一些内边距 */
}

.loading-content,
.error-content,
.content-placeholder {
  padding: 48px 24px;
  text-align: center;
  color: var(--text-secondary, #6b7280);
  font-size: 16px;
}

.error-content {
  color: var(--error-color, #ef4444); /* 假设有错误颜色变量 */
}

/* 临时的帖子/回复等项目样式 */
.mock-post-item,
.mock-reply-item,
.mock-media-item,
.mock-liked-item {
  border: 1px solid var(--border-color-light, #e5e7eb);
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  background-color: var(--background-color, #f9fafb);
}

.mock-post-item h4,
.mock-liked-item h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.1em;
  color: var(--text-color, #1f2937);
}

.mock-post-item p,
.mock-reply-item p,
.mock-media-item p,
.mock-liked-item p {
  margin: 0;
  font-size: 0.95em;
  color: var(--text-secondary, #6b7280);
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

  .content-placeholder,
  .loading-content,
  .error-content {
    padding: 32px 16px;
  }
  .user-content {
    padding: 16px;
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

  .content-placeholder,
  .loading-content,
  .error-content {
    padding: 24px 12px;
  }
   .user-content {
    padding: 12px;
  }
}
</style>
