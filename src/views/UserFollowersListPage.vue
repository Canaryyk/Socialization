<template>
  <GenericUserListPage
    :users="users"
    :isLoading="status.isLoading"
    :error="status.error"
    :title="pageTitle"
    loadingText="正在加载粉丝列表..."
    emptyListText="此用户还没有粉丝。"
  />
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import GenericUserListPage from '@/components/GenericUserListPage.vue';

const props = defineProps({
  username: String,
  id: String
});

const authStore = useAuthStore();

const users = computed(() => authStore.getUserList);
const status = computed(() => authStore.getUserListStatus);

const pageTitle = computed(() => {
  if (status.value.profileUser) {
    const name = status.value.profileUser.username || status.value.profileUser.identifier;
    return name ? `${name} 的粉丝列表` : '粉丝列表';
  }
  return '粉丝列表';
});

const fetchData = () => {
  const identifier = props.username || props.id;
  const type = props.username ? 'username' : 'id';
  if (identifier) {
    authStore.fetchFollowersList(identifier, type);
  } else {
    console.error("UserFollowersListPage: Missing identifier.");
  }
};

onMounted(() => {
  fetchData();
});

onBeforeUnmount(() => {
  authStore.clearUserList();
});
</script>

<style scoped>
/* Styles can be removed if GenericUserListPage handles all styling */
</style>
