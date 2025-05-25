<template>
  <div class="post-card" @click="goToDetail">
    <div class="post-header">
      <img :src="userAvatarSrc"
           alt="avatar"
           class="avatar"
           @error="handleAvatarError" />
      <div class="author-info" v-if="post.user">
        <h4>{{ post.user.username }}</h4>
        <span class="timestamp">{{ formattedTimestamp }}</span>
      </div>
      <div class="author-info" v-else>
        <h4>匿名用户</h4>
        <span class="timestamp">{{ formattedTimestamp }}</span>
      </div>
    </div>
    <h3>{{ post.title }}</h3>
    <p class="post-content-preview">{{ truncatedContent }}</p>
    <div v-if="post.images && post.images.length > 0 && postImageSrc" class="post-image-container">
      <img :src="postImageSrc" alt="post image" class="post-image" />
    </div>
    <div class="post-stats">
      <span class="stat-item">
        ❤️ {{ post.likes ? post.likes.length : 0 }}
      </span>
      <span class="stat-item">
        💬 {{ post.comments ? post.comments.length : 0 }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'; // 定义 baseUrl

const userAvatarSrc = computed(() => {
  if (props.post.user && props.post.user.avatar && props.post.user.avatar !== 'default_avatar.png') {
    if (props.post.user.avatar.startsWith('http')) {
      return props.post.user.avatar;
    }
    // return `http://localhost:3000/${props.post.user.avatar}`; // 旧的硬编码URL
    return `${baseUrl}${props.post.user.avatar}`; // 使用 baseUrl
  }
  return '/images/default_avatar.jpg'; // 前端默认头像
});

const postImageSrc = computed(() => {
  if (props.post.images && props.post.images.length > 0) {
    if (props.post.images[0].startsWith('http')) {
      return props.post.images[0];
    }
    // return `http://localhost:3000/${props.post.images[0]}`; // 旧的硬编码URL
    return `${baseUrl}${props.post.images[0]}`; // 使用 baseUrl
  }
  return null; // 或者一个占位图
});

const formattedTimestamp = computed(() => {
  // 4. 使用 post.createdAt
  if (!props.post || !props.post.createdAt) return '未知时间';
  const date = new Date(props.post.createdAt);
  return date.toLocaleString(); // 你可以根据需要格式化，例如 date.toLocaleDateString()
});

const truncatedContent = computed(() => {
  if (!props.post || !props.post.content) return '';
  const maxLength = 100;
  return props.post.content.length > maxLength
    ? props.post.content.substring(0, maxLength) + '...'
    : props.post.content;
});

const goToDetail = () => {
  // 6. 确保路由参数与后端 ID 匹配：props.post._id (字符串)
  //    并且你的 PostDetail 路由期望的参数是 props.post._id
  if (props.post && props.post._id) {
    router.push({
      name: 'PostDetail', // 确保你的路由名称是 'PostDetail'
      params: { id: props.post._id } // 将 props.post.id 改为 props.post._id
    });
  } else {
    console.error('Post ID is missing, cannot navigate to detail.', props.post);
  }
};

const handleAvatarError = (event) => { // 可选：处理头像加载失败
  event.target.src = '/images/default_avatar.jpg'; // 替换为你的默认头像路径
};
</script>

<style scoped>
  .post-card {
    border: 1px solid var(--border-color); /* 使用基础边框色 */
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
    max-width: 100%; /* 防止卡片过宽 */
    overflow: hidden; /* 防止内容溢出 */
  }

    .post-card:hover {
      transform: translateY(-5px); /* 悬停效果 */
    }

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 1rem;
    border: 2px solid #eee; /* 使用主色调边框 */
  }

  .author-info h4 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-color); /* 深色文字 */
  }

  .timestamp {
    font-size: 0.85rem;
    color: var(--secondary-color); /* 次要文本颜色 */
    margin-top: 0.2rem;
  }

  .post-content {
    margin-bottom: 1rem;
  }

    .post-content p {
      margin-bottom: 1rem;
      line-height: 1.6;
      color: var(--text-color); /* 文字颜色 */
    }

  /* 图片容器，固定宽高比 */
  .post-image-container {
    position: relative;
    width: 100%;
    padding-top: 56.25%; /* 16:9 宽高比 */
    overflow: hidden;
    border-radius: 8px;
    margin-top: 1rem;
  }

  .post-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* 裁剪填充容器 */
    border-radius: 8px;
  }

  .post-content-preview {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
    max-height: 4.5em; /* approx 3 lines */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .post-stats {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color-light, #eee);
    font-size: 0.9rem;
    color: var(--text-secondary-color, #555);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
</style>
