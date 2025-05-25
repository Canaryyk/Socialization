<template>
  <div class="post-detail-page">
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="error" class="error-state">加载帖子失败: {{ error }}</div>
    <div v-else-if="post" class="post-container">
      <!-- Post Header -->
      <div class="post-header" v-if="post.user">
        <img :src="post.user.avatar && post.user.avatar !== 'default_avatar.png' && !post.user.avatar.startsWith('http') ? `${baseUrl}${post.user.avatar}` : (post.user.avatar && post.user.avatar.startsWith('http') ? post.user.avatar : '/images/default_avatar.jpg')" alt="author avatar" class="avatar" @error="onImageError" />
        <div class="author-info">
          <h4>{{ post.user.username }}</h4>
          <span class="timestamp">{{ formattedTimestamp(post.createdAt) }}</span>
        </div>
      </div>

      <h1 class="post-title">{{ post.title }}</h1>

      <!-- Post Images -->
      <div v-if="post.images && post.images.length > 0" class="post-images-gallery">
        <img v-for="(image, index) in post.images" :key="index" :src="image.startsWith('http') ? image : `${baseUrl}${image}`" alt="post image" class="gallery-image" @click="viewFullImage(image.startsWith('http') ? image : `${baseUrl}${image}`)" @error="onImageError" />
      </div>

      <!-- Post Content -->
      <div class="post-content-full" v-html="post.content"></div> <!-- Assuming content can be HTML, or use <p> for plain text -->

      <!-- Actions (Likes, etc. - Placeholder for now) -->
      <div class="post-actions">
        <span>❤️ {{ post.likes ? post.likes.length : 0 }}</span>
        <!-- Add like button here later -->
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <h3>评论 ({{ post.comments ? post.comments.length : 0 }})</h3>
        <div class="comment-input" v-if="currentUser"> <!-- Only show if user is logged in -->
          <textarea v-model="newCommentText" placeholder="写下你的评论..." rows="3"></textarea>
          <button @click="submitNewComment" :disabled="!newCommentText.trim() || submittingComment" class="submit-button">
            {{ submittingComment ? '发布中...' : '发布评论' }}
          </button>
        </div>
        <div v-else class="comment-login-prompt">
          请 <router-link to="/login">登录</router-link> 后发表评论。
        </div>
        <div class="comments-list">
          <div v-if="post.comments && post.comments.length > 0">
            <div v-for="comment in post.comments" :key="comment._id" class="comment-item">
              <div class="comment-header">
                <img :src="comment.user && comment.user.avatar && comment.user.avatar !== 'default_avatar.png' && !comment.user.avatar.startsWith('http') ? `${baseUrl}${comment.user.avatar}` : (comment.user && comment.user.avatar && comment.user.avatar.startsWith('http') ? comment.user.avatar : '/images/default_avatar.jpg')" alt="comment avatar" class="comment-avatar" @error="onImageError" />
                <div class="comment-author-info">
                  <span class="comment-author">{{ comment.user ? comment.user.username : '匿名用户' }}</span>
                  <span class="comment-time">{{ formattedTimestamp(comment.createdAt) }}</span>
                </div>
                <button v-if="canDeleteComment(comment)" @click="deleteExistingComment(comment._id)" class="delete-button" title="删除评论">×</button>
              </div>
              <p class="comment-content">{{ comment.text }}</p>
            </div>
          </div>
          <div v-else class="no-comments">暂无评论，快来抢沙发吧！</div>
        </div>
      </div>

      <button @click="$router.back()" class="back-button">返回</button>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'; // Import API service
// Assuming you have a way to get current user, e.g., from a store or localStorage
// import { useAuthStore } from '@/stores/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default {
  name: 'PostDetail',
  data() {
    return {
      post: null,
      loading: true,
      error: null,
      newCommentText: '',
      submittingComment: false,
      currentUser: null, // Will hold current user info
      baseUrl: BASE_URL, // Make baseUrl available in the template
      // currentUser: null, // Will be fetched from auth store or similar
    };
  },
  computed: {
    // formattedTimestamp is now a method to allow passing argument
  },
  created() {
    // const authStore = useAuthStore(); // Example if using Pinia
    // this.currentUser = authStore.user;
    this.getCurrentUser(); // Fetch current user
    this.fetchPostData();
  },
  methods: {
    getCurrentUser() {
      // Placeholder: Fetch user from localStorage or an auth store
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
            this.currentUser = JSON.parse(userInfo);
        } catch (e) {
            console.error("Error parsing user info from localStorage", e);
            localStorage.removeItem('userInfo'); // Clear corrupted data
        }
      }
      // Example with Pinia store:
      // const authStore = useAuthStore();
      // this.currentUser = authStore.user;
    },
    async fetchPostData() {
      this.loading = true;
      this.error = null;
      const postId = this.$route.params.id;
      try {
        const response = await api.getPostById(postId);
        this.post = response.data;
      } catch (err) {
        console.error('Failed to fetch post:', err);
        this.error = err.response ? err.response.data.message : err.message;
      } finally {
        this.loading = false;
      }
    },
    formattedTimestamp(dateTimeString) {
      if (!dateTimeString) return '未知时间';
      const date = new Date(dateTimeString);
      return date.toLocaleString(); // Or any other format you prefer
    },
    onImageError(event) {
      event.target.src = '/images/default-avatar.jpg'; // Default avatar/image
    },
    viewFullImage(imageSrc) {
      window.open(imageSrc, '_blank');
    },
    canDeleteComment(comment) {
      if (!this.currentUser) return false;
      // Check if current user is the author of the comment
      if (comment.user && comment.user._id === this.currentUser._id) return true;
      // Check if current user is the author of the post
      if (this.post.user && this.post.user._id === this.currentUser._id) return true;
      return false;
    },
    async submitNewComment() {
      if (!this.newCommentText.trim() || !this.currentUser) return;
      this.submittingComment = true;
      try {
        const response = await api.addCommentToPost(this.post._id, { text: this.newCommentText });
        // Backend returns the newly created comment, which includes populated user info
        this.post.comments.unshift(response.data);
        this.newCommentText = '';
        alert('评论已发布！');
      } catch (error) {
        console.error('Failed to submit comment:', error);
        alert(`发布评论失败: ${error.response ? error.response.data.message : error.message}`);
      } finally {
        this.submittingComment = false;
      }
    },
    async deleteExistingComment(commentId) {
      if (!this.currentUser) return;
      if (!confirm('确定要删除这条评论吗？')) return;

      try {
        await api.deleteCommentFromPost(this.post._id, commentId);
        this.post.comments = this.post.comments.filter(c => c._id !== commentId);
        alert('评论已删除！');
      } catch (error) {
        console.error('Failed to delete comment:', error);
        alert(`删除评论失败: ${error.response ? error.response.data.message : error.message}`);
      }
    },
  }
};
</script>

<style scoped>
.post-detail-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

.loading-state, .error-state {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.post-container {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.timestamp {
  font-size: 0.85rem;
  color: #777;
}

.post-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.post-images-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 1.5rem;
}

.gallery-image {
  width: 100%;
  height: auto;
  max-height: 200px; /* Limit height for gallery view */
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.gallery-image:hover {
  transform: scale(1.05);
}

.post-content-full {
  line-height: 1.7;
  margin-bottom: 2rem;
  white-space: pre-wrap; /* Preserve whitespace and newlines */
}

.post-actions {
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.comments-section h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.comment-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  resize: vertical;
}

.comment-input .submit-button {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.comment-input .submit-button:disabled {
  background-color: #ccc;
}

.comments-list {
  margin-top: 1.5rem;
}

.comment-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  position: relative;
}

.comment-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-author-info .comment-author {
  font-weight: 600;
  font-size: 0.95rem;
}
.comment-author-info .comment-time {
  font-size: 0.8rem;
  color: #888;
  display: block;
}

.comment-content {
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.delete-button {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 0.8rem;
}
.delete-button:hover {
  color: red;
}

.no-comments {
  text-align: center;
  color: #888;
  padding: 1rem 0;
}

.back-button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.6rem 1.2rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.comment-login-prompt {
  padding: 1rem;
  text-align: center;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin: 1rem 0;
}
</style>
