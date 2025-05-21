<template>
  <div class="post-detail">
    <div v-if="post && post.author" class="post-container">
      <div class="post-header">
        <img :src="post.author.avatar" alt="author avatar" class="avatar" @error="onImageError" />
        <div class="author-info">
          <h4>{{ post.author.name }}</h4>
          <span class="timestamp">{{ formattedTimestamp }}</span>
        </div>
      </div>
      <h1 class="post-title">{{ post.title }}</h1>
      <div class="post-content">
        <p>{{ post.content }}</p>
        <div v-if="post.image" class="post-image-container">
          <img :src="post.image" alt="post image" class="post-image" @click="viewFullImage(post.image)" @error="onImageError" />
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <h3>评论 ({{ post.comments.length }})</h3>
        <div class="comment-input">
          <textarea v-model="newComment" placeholder="写下你的评论..." rows=3></textarea>
          <button @click="submitComment" :disabled="!newComment.trim()" class="submit-button">发布</button>
        </div>
        <div class="comments-list">
          <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <img :src="comment.author.avatar" alt="comment avatar" class="comment-avatar" @error="onImageError" />
              <div class="comment-author-info">
                <span class="comment-author">{{ comment.author.name }}</span>
                <span class="comment-time">{{ formatCommentTime(comment.timestamp) }}</span>
              </div>
              <button @click="deleteComment(comment.id)" class="delete-button">删除</button>
            </div>,asdr5
            <p class="comment-content">{{ comment.content }}</p>
          </div>
          <div v-if="post.comments.length === 0" class="no-comments">暂无评论，快来抢沙发吧！</div>
        </div>
      </div>

      <button @click="$router.back()" class="back-button">返回</button>
    </div>
    <div v-else class="loading">加载中...</div>
  </div>
</template>

<script>
  import { getItem, setItem } from '@/utils/localStorage';

  export default {
    name: 'PostDetail',
    data() {
      return {
        post: null,
        newComment: '',
        currentUser: {
          id: 10086,
          name: '当前用户',
          avatar: '/images/avatar3.jpg'
        } // 示例用户，可替换为实际登录用户数据
      };
    },
    computed: {
      formattedTimestamp() {
        if (!this.post || !this.post.timestamp) return '';
        const date = new Date(this.post.timestamp);
        return date.toLocaleString();
      }
    },
    mounted() {
      const postId = this.$route.params.id;
      this.fetchPostDetail(postId);
    },
    methods: {
      fetchPostDetail(id) {
        const storedPosts = getItem('posts');
        if (storedPosts && storedPosts.length > 0) {
          const foundPost = storedPosts.find(p => p.id === Number(id));
          if (foundPost) {
            if (!foundPost.comments) foundPost.comments = [];
            console.log('Loaded from localStorage:', foundPost);
            this.post = foundPost;
          } else {
            console.error(`Post with id ${id} not found in stored data`);
          }
        } else {
          fetch('/mock-data/posts.json')
            .then(response => {
              if (!response.ok) throw new Error('Failed to fetch posts.json');
              return response.json();
            })
            .then(data => {
              data.forEach(post => {
                if (!post.comments) post.comments = [];
              });
              setItem('posts', data);
              const foundPost = data.find(p => p.id === Number(id));
              if (foundPost) {
                console.log('Loaded from fetch:', foundPost);
                this.post = foundPost;
              } else {
                console.error(`Post with id ${id} not found`);
              }
            })
            .catch(err => console.error('Error fetching posts:', err));
        }
      },
      onImageError(event) {
        console.error('Image failed to load:', event.target.src);
        event.target.src = '/images/default-avatar.jpg'; // 可选：添加默认头像
      },
      viewFullImage(imageSrc) {
        window.open(imageSrc, '_blank');
      },
      submitComment() {
        if (!this.newComment.trim()) return;
        const comment = {
          id: Date.now(),
          author: { ...this.currentUser }, // 使用完整用户信息
          content: this.newComment.trim(),
          timestamp: new Date().toISOString()
        };
        this.post.comments.push(comment);
        this.updateLocalStorage();
        this.newComment = '';
      },
      deleteComment(commentId) {
        this.post.comments = this.post.comments.filter(c => c.id !== commentId);
        this.updateLocalStorage();
      },
      updateLocalStorage() {
        const storedPosts = getItem('posts');
        const updatedPosts = storedPosts.map(p =>
          p.id === this.post.id ? { ...this.post } : p
        );
        setItem('posts', updatedPosts);
      },
      formatCommentTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
      }
    }
  };
</script>

<style scoped>
  .post-detail {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .post-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .post-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-color);
  }

  .author-info h4 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-color);
    font-weight: 600;
  }

  .timestamp {
    color: var(--secondary-color);
    font-size: 0.875rem;
  }

  .post-title {
    font-size: 2rem;
    color: var(--text-color);
    margin: 0;
    font-weight: 700;
    line-height: 1.3;
  }

  .post-content {
    display: flex; /* 明确设置为 Flex 布局 */
    flex-direction: column; /* 垂直排列子元素 */
    gap: 2.5rem; /* 设置间距 */
  }

    .post-content p {
      font-size: 1rem;
      line-height: 1.7;
      color: var(--text-color);
      margin: 0;
    }

  .post-image-container {
    width: 400px; /* 固定容器宽度 */
    height: 300px; /* 固定容器高度 */
    background-color: var(--background-color); /* 添加背景色 */
    border-radius: 8px;
    overflow: hidden; /* 裁剪超出部分 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 添加阴影 */
    border: 1px solid var(--border-color); /* 添加边框 */
    display: flex; /* 使用 flex 控制对齐 */
    justify-content: flex-start; /* 左对齐 */
    align-items: center; /* 垂直居中 */
    transition: transform 0.2s ease, box-shadow 0.2s ease; /* 动画 */
  }

    .post-image-container:hover {
      transform: scale(1.02); /* 悬停放大 */
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1); /* 阴影加深 */
    }

  .post-image {
    width: 100%; /* 充满容器宽度 */
    height: 100%; /* 充满容器高度 */
    object-fit: cover; /* 裁剪并填充 */
    object-position: left center; /* 左对齐裁剪 */
    border-radius: 8px; /* 与容器一致 */
    cursor: pointer;
  }

  /* 评论区样式 */
  .comments-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
  }

    .comments-section h3 {
      font-size: 1.5rem;
      color: var(--primary-color);
      margin-bottom: 1.5rem;
      font-weight: 600;
    }

  .comment-input {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

    .comment-input textarea {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      resize: vertical;
      outline: none;
      background-color: var(--background-color);
      color: var(--text-color);
      transition: border-color 0.2s ease;
    }

      .comment-input textarea:focus {
        border-color: var(--primary-color);
      }

  .submit-button {
    align-self: flex-end;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

    .submit-button:disabled {
      background-color: var(--secondary-color);
      cursor: not-allowed;
    }

    .submit-button:hover:not(:disabled) {
      background-color: var(--primary-hover);
    }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .comment-item {
    background-color: var(--background-color);
    padding: 1.25rem;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    transition: transform 0.2s ease;
  }

    .comment-item:hover {
      transform: translateY(-2px);
    }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--border-color);
  }

  .comment-author-info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .comment-author {
    font-weight: 600;
    color: var(--text-color);
    font-size: 1rem;
  }

  .comment-time {
    color: var(--secondary-color);
    font-size: 0.75rem;
  }

  .delete-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    background-color: #ef4444; /* 红色，与全局风格协调 */
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

    .delete-button:hover {
      background-color: #dc2626;
    }

  .comment-content {
    font-size: 0.9375rem;
    color: var(--text-color);
    margin: 0;
    line-height: 1.6;
  }

  .no-comments {
    text-align: center;
    color: var(--secondary-color);
    font-size: 0.9375rem;
    padding: 2rem;
    background-color: var(--background-color);
    border-radius: 8px;
  }

  .back-button {
    align-self: center;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

    .back-button:hover {
      background-color: var(--primary-hover);
    }

  .loading {
    text-align: center;
    font-size: 1.125rem;
    color: var(--secondary-color);
    padding: 2rem;
  }
</style>
