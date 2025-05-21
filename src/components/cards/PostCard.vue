<template>
  <div class="post-card" @click="goToDetail">
    <div class="post-header">
      <img :src="post.user && post.user.avatar ? post.user.avatar : '/images/default-avatar.jpg'"
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
    <div v-if="post.images && post.images.length > 0" class="post-image-container">
      <img :src="post.images[0]" alt="post image" class="post-image" />
    </div>
  </div>
</template>

<script>
  import { useRouter } from 'vue-router'; // 确保已安装和正确导入

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
        // 4. 使用 post.createdAt
        if (!this.post || !this.post.createdAt) return '未知时间';
        const date = new Date(this.post.createdAt);
        return date.toLocaleString(); // 你可以根据需要格式化，例如 date.toLocaleDateString()
      },
      // 可选：如果想截断内容预览
      /*
      truncatedContent() {
        if (!this.post || !this.post.content) return '';
        const maxLength = 100; // 设置预览字数
        return this.post.content.length > maxLength
          ? this.post.content.substring(0, maxLength) + '...'
          : this.post.content;
      }
      */
    },
    setup(props) {
      const router = useRouter();
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
        event.target.src = '/images/default-avatar.jpg'; // 替换为你的默认头像路径
      };

      return {
        goToDetail,
        handleAvatarError
      };
    }
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
</style>
