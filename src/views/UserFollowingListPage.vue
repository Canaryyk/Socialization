<template>
  <GenericUserListPage
    :users="users"
    :isLoading="status.isLoading"
    :error="status.error"
    :title="pageTitle"
    loadingText="正在加载关注列表..."
    emptyListText="此用户还没有关注任何人。"
  />
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import defaultAvatarPath from '/images/default_avatar.jpg'; // 确保路径正确
import GenericUserListPage from '@/components/GenericUserListPage.vue'; // 导入通用组件

const props = defineProps({
  username: String, // 从路由参数接收 username
  id: String        // 从路由参数接收 id
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const users = computed(() => authStore.getUserList);
const status = computed(() => authStore.getUserListStatus);

const pageTitle = computed(() => {
  if (status.value.profileUser) {
    const name = status.value.profileUser.username || status.value.profileUser.identifier;
    return name ? `${name} 的关注列表` : '关注列表';
  }
  return '关注列表';
});

const fetchData = () => {
  const identifier = props.username || props.id;
  const type = props.username ? 'username' : 'id';
  if (identifier) {
    authStore.fetchFollowingList(identifier, type);
  } else {
    console.error("UserFollowingListPage: Missing identifier (username or id) to fetch list.");
    // authStore.userList.error = "无法确定要为哪个用户加载列表。"; // 可以设置错误状态
  }
};

onMounted(() => {
  fetchData();
});

onBeforeUnmount(() => {
  authStore.clearUserList(); // 清理列表数据和状态
});

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

const navigateToUser = (user) => {
  if (user.username) {
    router.push({ name: 'UserProfileByUsername', params: { username: user.username } });
  } else if (user._id) {
    router.push({ name: 'UserProfileById', params: { id: user._id } });
  }
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
/* Specific styles for this page can go here if needed,
   otherwise, GenericUserListPage styles will apply. */
</style>
