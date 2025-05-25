<template>
  <div class="post-detail-page">
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="error" class="error-state">加载帖子失败: {{ error }}</div>
    <div v-else-if="post" class="post-container">
      <!-- Post Header -->
      <div class="post-header" v-if="post.user">
        <img :src="userAvatarSrc(post.user)" alt="author avatar" class="avatar" @error="onImageError" />
        <div class="author-info">
          <h4>{{ post.user.username }}</h4>
          <span class="timestamp">{{ formattedTimestamp(post.createdAt) }}</span>
        </div>
      </div>

      <h1 class="post-title">{{ post.title }}</h1>

      <!-- Post Images -->
      <div v-if="post.images && post.images.length > 0" class="post-images-gallery">
        <img v-for="(image, index) in post.images" :key="index" :src="postImageSrc(image)" alt="post image" class="gallery-image" @click="viewFullImage(postImageSrc(image))" @error="onImageError" />
      </div>

      <!-- Post Content -->
      <div class="post-content-full" v-html="post.content"></div>

      <!-- Actions (Likes, etc.) -->
      <div class="post-actions">
        <button @click="toggleLikePost" class="like-button" :class="{ 'liked':isPostLikedByCurrentUser }">
          ❤️ {{ post.likes ? post.likes.length : 0 }}
        </button>
        <!-- Add other actions here if needed -->
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <div class="comments-header-controls">
          <h3>评论 ({{ post.comments ? post.comments.length : 0 }})</h3>
          <div class="comment-sort-options">
            <label for="comment-sort">排序方式: </label>
            <select id="comment-sort" v-model="commentSortOrder" @change="fetchPostData">
              <option value="time">最新</option>
              <option value="likes">最热</option>
            </select>
          </div>
        </div>
        <div class="comment-input" v-if="currentUser">
          <textarea v-model="newCommentText" placeholder="写下你的评论..." rows="3"></textarea>
          <button @click="submitNewComment" :disabled="!newCommentText.trim() || submittingComment" class="submit-button">
            {{ submittingComment ? '发布中...' : '发布评论' }}
          </button>
        </div>
        <div v-else class="comment-login-prompt">
          请 <router-link to="/login">登录</router-link> 后发表评论。
        </div>
        <div class="comments-list">
          <div v-if="sortedComments && sortedComments.length > 0">
            <div v-for="comment in sortedComments" :key="comment._id" class="comment-item">
              <div class="comment-header">
                <img :src="userAvatarSrc(comment.user)" alt="comment avatar" class="comment-avatar" @error="onImageError" />
                <div class="comment-author-info">
                  <span class="comment-author">{{ comment.user ? comment.user.username : '匿名用户' }}</span>
                  <span class="comment-time">{{ formattedTimestamp(comment.createdAt) }}</span>
                </div>
                <div class="comment-actions">
                  <button @click="toggleLikeComment(comment._id)" class="like-button comment-like-button" :class="{ 'liked': isCommentLikedByCurrentUser(comment) }">
                    ❤️ {{ comment.likes ? comment.likes.length : 0 }}
                  </button>
                  <button v-if="canDeleteComment(comment)" @click="deleteExistingComment(comment._id)" class="delete-button" title="删除评论">×</button>
                </div>
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
import api from '@/services/api';

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
      currentUser: null,
      baseUrl: BASE_URL,
      commentSortOrder: 'time', // 'time' or 'likes'
    };
  },
  computed: {
    isPostLikedByCurrentUser() {
      if (!this.post || !this.post.likes || !this.currentUser) return false;
      return this.post.likes.some(like => like === this.currentUser._id || (typeof like === 'object' && like._id === this.currentUser._id));
    },
    sortedComments() {
        if (!this.post || !this.post.comments) return [];
        // The backend for getPostById already sorts the comments based on the `sortByComment` query parameter.
        // So, this.post.comments should already be sorted.
        return this.post.comments;
    }
  },
  created() {
    this.getCurrentUser();
    this.fetchPostData(); // Initial fetch
     // Watch for route changes to refetch data if a new post ID is navigated to
    this.$watch('$route.params.id', this.fetchPostDataIfNeeded);
  },
  methods: {
    fetchPostDataIfNeeded(newPostId, oldPostId) {
      if (newPostId && newPostId !== oldPostId) {
        this.fetchPostData();
      }
    },
    userAvatarSrc(user) {
      if (user && user.avatar) {
        if (user.avatar.startsWith('http')) {
          return user.avatar;
        } else if (user.avatar !== 'default_avatar.png') {
          return `${this.baseUrl}${user.avatar}`;
        }
      }
      return '/images/default_avatar.jpg';
    },
    postImageSrc(imagePath) {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      return `${this.baseUrl}${imagePath}`;
    },
    getCurrentUser() {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
            this.currentUser = JSON.parse(userInfo);
        } catch (e) {
            console.error("Error parsing user info from localStorage", e);
            localStorage.removeItem('userInfo');
        }
      }
    },
    async fetchPostData() {
      this.loading = true;
      this.error = null;
      const postId = this.$route.params.id;
      try {
        // Pass the comment sort order to the API
        const response = await api.getPostById(postId, this.commentSortOrder);
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
      return date.toLocaleString();
    },
    onImageError(event) {
      event.target.src = '/images/default_avatar.jpg';
    },
    viewFullImage(imageSrc) {
      window.open(imageSrc, '_blank');
    },
    canDeleteComment(comment) {
      if (!this.currentUser) return false;
      if (comment.user && comment.user._id === this.currentUser._id) return true;
      if (this.post.user && this.post.user._id === this.currentUser._id) return true;
      return false;
    },
    async submitNewComment() {
      if (!this.newCommentText.trim() || !this.currentUser) return;
      this.submittingComment = true;
      try {
        const response = await api.addCommentToPost(this.post._id, { text: this.newCommentText });
        // Backend returns the newly created comment, which includes populated user info
        // Add to the beginning of the list
        this.post.comments.unshift(response.data);
        // If sorting by time, this new comment is already at the correct place.
        // If sorting by likes, it will have 0 likes and appear accordingly.
        // Or, refetch to ensure correct order if backend handles complex sort on add.
        // For simplicity, unshift and assume client sort or next fetch will correct if needed.
        this.newCommentText = '';
        // alert('评论已发布！'); // Consider a less disruptive notification
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
        // alert('评论已删除！');
      } catch (error) {
        console.error('Failed to delete comment:', error);
        alert(`删除评论失败: ${error.response ? error.response.data.message : error.message}`);
      }
    },
    async toggleLikePost() {
      if (!this.currentUser) {
        alert('请先登录后再点赞！');
        this.$router.push('/login');
        return;
      }
      try {
        const response = await api.likePost(this.post._id);
        this.post.likes = response.data.likes; // Update likes from response
      } catch (error) {
        console.error('Failed to like/unlike post:', error);
        alert(`操作失败: ${error.response ? error.response.data.message : error.message}`);
      }
    },
    isCommentLikedByCurrentUser(comment) {
      if (!comment || !comment.likes || !this.currentUser) return false;
      return comment.likes.some(like => like === this.currentUser._id || (typeof like === 'object' && like._id === this.currentUser._id));
    },
    async toggleLikeComment(commentId) {
      if (!this.currentUser) {
        alert('请先登录后再点赞！');
        this.$router.push('/login');
        return;
      }
      try {
        const response = await api.likeComment(this.post._id, commentId);
        const updatedComment = this.post.comments.find(c => c._id === commentId);
        if (updatedComment) {
          updatedComment.likes = response.data.likes;
        }
        // If sorting by likes, re-sort or re-fetch
        if (this.commentSortOrder === 'likes') {
           // The backend sorts, so refetching will get the new order
           this.fetchPostData();
        }

      } catch (error) {
        console.error('Failed to like/unlike comment:', error);
        alert(`操作评论点赞失败: ${error.response ? error.response.data.message : error.message}`);
      }
    }
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
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.like-button {
  background: none;
  border: 1px solid #ccc;
  color: #555;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.like-button:hover {
  background-color: #f0f0f0;
  border-color: #bbb;
}

.like-button.liked {
  background-color: #ffe0e0; /* Light red for liked state */
  border-color: #ffaaaa;
  color: #d00000; /* Darker red text */
}

.like-button.liked:hover {
  background-color: #ffd0d0;
}

.comments-section {
  margin-top: 2rem;
}

.comments-header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comment-sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-sort-options label {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0; /* Override default label margin if any */
}

.comment-sort-options select {
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
}

.comment-input {
  margin-bottom: 1.5rem;
}

.comment-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  resize: vertical;
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-button:not(:disabled):hover {
  background-color: var(--primary-hover);
}

.comment-login-prompt {
  margin-bottom: 1.5rem;
  color: #555;
}

.comments-list {
  margin-top: 1rem;
}

.comment-item {
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
}

.comment-header {
  display: flex;
  align-items: flex-start; /* Align items to the start for better layout with actions */
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-author-info {
  flex-grow: 1; /* Allow author info to take available space */
}

.comment-author {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-color);
}

.comment-time {
  font-size: 0.8rem;
  color: #777;
  display: block;
  margin-top: 0.1rem;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto; /* Push actions to the right */
}

.comment-like-button {
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
}

.delete-button {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
}

.delete-button:hover {
  color: #d00000;
}

.comment-content {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.6;
  padding-left: calc(40px + 0.75rem); /* Align with author text, considering avatar and gap */
  margin-top: -0.5rem; /* Adjust spacing if needed */
}

.no-comments {
  text-align: center;
  color: #888;
  padding: 1rem;
}

.back-button {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.7rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #5a6268;
}

/* Ensure post image and avatar functions are defined or use direct paths */
.avatar, .comment-avatar {
  border: 1px solid #ddd; /* Add a subtle border to avatars */
}
.gallery-image {
    border: 1px solid #eee; /* Add a subtle border to gallery images */
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .post-container {
    padding: 1rem;
  }
  .post-title {
    font-size: 1.5rem;
  }
  .comments-header-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .comment-sort-options {
    margin-top: 0.5rem;
    width: 100%;
  }
  .comment-sort-options select {
    flex-grow: 1;
  }
  .comment-header {
    flex-wrap: wrap; /* Allow header items to wrap on small screens */
  }
  .comment-actions {
    margin-left: 0; /* Reset margin for wrapped layout */
    width: 100%;
    justify-content: flex-end; /* Align actions to the end */
    margin-top: 0.5rem;
  }
  .comment-content {
    padding-left: 0; /* Reset padding for smaller screens */
  }
}

</style>
