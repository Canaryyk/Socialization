<template>
  <div class="post-card" @click="goToDetail">
    <div class="post-header">
      <img :src="post.author.avatar" alt="avatar" class="avatar" />
      <div class="author-info">
        <h4>{{ post.author.name }}</h4>
        <span class="timestamp">{{ formattedTimestamp }}</span>
      </div>
    </div>
    <h3>{{ post.title }}</h3> <!-- 只展示标题 -->
    <div v-if="post.image" class="post-image-container">
      <img :src="post.image" alt="post image" class="post-image" />
    </div>
  </div>
</template>

<script>
  import { useRouter } from 'vue-router'
  export default {
    name: 'PostCard',
    props: {
      post: {
        type: Object,
        required: true
      }
    },
    computed: {
      formattedTimestamp() {
        const date = new Date(this.post.timestamp);
        return date.toLocaleString();
      }
    },
    setup(props) {
      const router = useRouter()
      const goToDetail = () => {
        router.push({
          name: 'PostDetail',
          params: { id: props.post.id }
        })
      }
      return { goToDetail }
    }
  }
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
</style>
