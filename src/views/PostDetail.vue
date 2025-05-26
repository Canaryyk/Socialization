<template>
  <div class="post-detail-page">
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="error" class="error-state">加载帖子失败: {{ error }}</div>
    <div v-else-if="post" class="post-container">
      <!-- Post Header -->
      <div class="post-header" v-if="post.user">
        <div class="user-info-container">
          <div @click="goToUserProfile(post.user)" class="user-info-clickable">
            <img :src="userAvatarSrc(post.user)" alt="author avatar" class="avatar" @error="onImageError" />
            <div class="author-info">
              <h4>{{ post.user.username }}</h4>
              <span class="timestamp">{{ formattedTimestamp(post.createdAt) }}</span>
            </div>
          </div>
          <!-- Follow Button -->
          <button
            v-if="currentUser && post.user && currentUser._id !== post.user._id"
            @click="toggleFollowAuthor"
            :disabled="followingInProgress"
            class="follow-button"
            :class="{ 'following': isFollowingAuthor }"
          >
            {{ followingInProgress ? '处理中...' : (isFollowingAuthor ? '取消关注' : '关注') }}
          </button>
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
        <button @click="toggleLikePost" class="like-button" :class="{ 'liked': isPostLikedByCurrentUser }">
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
                <div @click="goToUserProfile(comment.user)" class="user-info-clickable">
                  <img :src="userAvatarSrc(comment.user)" alt="comment avatar" class="comment-avatar" @error="onImageError" />
                  <div class="comment-author-info">
                    <span class="comment-author">{{ comment.user ? comment.user.username : '匿名用户' }}</span>
                    <span class="comment-time">{{ formattedTimestamp(comment.createdAt) }}</span>
                  </div>
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { computed, ref, onMounted, watch, toRefs } from 'vue';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default {
  name: 'PostDetail',
  props: {
    id: String,
  },
  setup(props) {
    const router = useRouter();
    const authStore = useAuthStore();

    const post = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const newCommentText = ref('');
    const submittingComment = ref(false);
    const commentSortOrder = ref('time');
    const followingInProgress = ref(false);

    const currentUser = computed(() => authStore.currentUser);

    const isFollowingAuthor = computed(() => {
      if (!currentUser.value || !post.value || !post.value.user || !currentUser.value.following) {
        return false;
      }
      return currentUser.value.following.some(id => id === post.value.user._id);
    });

    const fetchPostData = async () => {
      loading.value = true;
      error.value = null;
      const postId = props.id || router.currentRoute.value.params.id;
      try {
        const response = await api.getPostById(postId, commentSortOrder.value);
        post.value = response.data;
      } catch (err) {
        console.error('Failed to fetch post:', err);
        error.value = err.response ? err.response.data.message : err.message;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
        fetchPostData();
    });

    watch(() => props.id, (newId, oldId) => {
        if (newId && newId !== oldId) {
            fetchPostData();
        }
    });
     watch(() => router.currentRoute.value.params.id, (newId, oldId) => {
        if (newId && newId !== oldId && !props.id) {
            fetchPostData();
        }
    });
     watch(commentSortOrder, () => fetchPostData());

    const toggleFollowAuthor = async () => {
      if (!currentUser.value || !post.value || !post.value.user || followingInProgress.value) {
        return;
      }
      followingInProgress.value = true;
      const targetUserId = post.value.user._id;

      try {
        if (isFollowingAuthor.value) {
          await authStore.unfollowUser(targetUserId);
        } else {
          await authStore.followUser(targetUserId);
        }
      } catch (err) {
        console.error('Error toggling follow status:', err);
        alert(`操作失败: ${err.response?.data?.message || err.message}`);
      } finally {
        followingInProgress.value = false;
      }
    };

    const userAvatarSrc = (user) => {
      if (user && user.avatar) {
        if (user.avatar.startsWith('http')) {
          return user.avatar;
        } else if (user.avatar !== 'default_avatar.png') {
          return `${BASE_URL}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`;
        }
      }
      return '/images/default_avatar.jpg';
    };

    const postImageSrc = (imagePath) => {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const formattedTimestamp = (dateTimeString) => {
      if (!dateTimeString) return '未知时间';
      const date = new Date(dateTimeString);
      return date.toLocaleString();
    };

    const onImageError = (event) => {
      event.target.src = '/images/default_avatar.jpg';
    };

    const viewFullImage = (imageSrc) => {
      window.open(imageSrc, '_blank');
    };

    const goToUserProfile = (user) => {
      if (user && user._id) {
        router.push({ name: 'UserProfileById', params: { id: user._id } });
      } else if (user && user.username) {
        router.push({ name: 'UserProfileByUsername', params: { username: user.username } });
      }
    };

    const isPostLikedByCurrentUser = computed(() => {
      if (!post.value || !post.value.likes || !currentUser.value) return false;
      return post.value.likes.some(like => like === currentUser.value._id || (typeof like === 'object' && like._id === currentUser.value._id));
    });

    const toggleLikePost = async () => {
      if (!currentUser.value) {
        alert('请先登录后再点赞！');
        router.push('/login');
        return;
      }
      try {
        const response = await api.likePost(post.value._id);
        if (post.value) post.value.likes = response.data.likes;
      } catch (err) {
        console.error('Failed to like/unlike post:', err);
        alert(`操作失败: ${err.response?.data?.message || err.message}`);
      }
    };

    const submitNewComment = async () => {
      if (!newCommentText.value.trim() || !currentUser.value) return;
      submittingComment.value = true;
      try {
        const response = await api.addCommentToPost(post.value._id, { text: newCommentText.value });
        if (post.value && post.value.comments) {
            post.value.comments.unshift(response.data);
        } else if (post.value) {
            post.value.comments = [response.data];
        }
        newCommentText.value = '';
      } catch (error) {
        console.error('Failed to submit comment:', error);
        alert(`发布评论失败: ${error.response?.data?.message || error.message}`);
      } finally {
        submittingComment.value = false;
      }
    };

    const deleteExistingComment = async (commentId) => {
      if (!currentUser.value) return;
      if (!confirm('确定要删除这条评论吗？')) return;
      try {
        await api.deleteCommentFromPost(post.value._id, commentId);
        if (post.value && post.value.comments) {
            post.value.comments = post.value.comments.filter(c => c._id !== commentId);
        }
      } catch (error) {
        console.error('Failed to delete comment:', error);
        alert(`删除评论失败: ${error.response?.data?.message || error.message}`);
      }
    };

    const isCommentLikedByCurrentUser = (comment) => {
      if (!comment || !comment.likes || !currentUser.value) return false;
      return comment.likes.some(like => like === currentUser.value._id || (typeof like === 'object' && like._id === currentUser.value._id));
    };

    const toggleLikeComment = async (commentId) => {
      if (!currentUser.value) {
        alert('请先登录后再点赞！');
        router.push('/login');
        return;
      }
      try {
        const response = await api.likeComment(post.value._id, commentId);
        if (post.value && post.value.comments) {
            const updatedComment = post.value.comments.find(c => c._id === commentId);
            if (updatedComment) {
              updatedComment.likes = response.data.likes;
            }
        }
        if (commentSortOrder.value === 'likes') {
           fetchPostData();
        }
      } catch (error) {
        console.error('Failed to like/unlike comment:', error);
        alert(`操作评论点赞失败: ${error.response?.data?.message || error.message}`);
      }
    };

    const canDeleteComment = (comment) => {
      if (!currentUser.value) return false;
      if (comment.user && comment.user._id === currentUser.value._id) return true;
      if (post.value && post.value.user && post.value.user._id === currentUser.value._id) return true;
      return false;
    };

    const sortedComments = computed(() => {
        if (!post.value || !post.value.comments) return [];
        return post.value.comments;
    });

    return {
      post,
      loading,
      error,
      newCommentText,
      submittingComment,
      currentUser,
      commentSortOrder,
      followingInProgress,
      isFollowingAuthor,
      toggleFollowAuthor,
      fetchPostData,
      userAvatarSrc,
      postImageSrc,
      formattedTimestamp,
      onImageError,
      viewFullImage,
      goToUserProfile,
      isPostLikedByCurrentUser,
      toggleLikePost,
      submitNewComment,
      deleteExistingComment,
      isCommentLikedByCurrentUser,
      toggleLikeComment,
      canDeleteComment,
      sortedComments,
      router
    };
  },
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
  max-height: 200px;
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
  white-space: pre-wrap;
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
  background-color: #ffe0e0;
  border-color: #ffaaaa;
  color: #d00000;
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
  margin-bottom: 0;
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
  align-items: flex-start;
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
  flex-grow: 1;
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
  margin-left: auto;
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
  padding-left: calc(40px + 0.75rem);
  margin-top: -0.5rem;
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

.avatar, .comment-avatar {
  border: 1px solid #ddd;
}
.gallery-image {
    border: 1px solid #eee;
}

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
    flex-wrap: wrap;
  }
  .comment-actions {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
  .comment-content {
    padding-left: 0;
  }
  .user-info-clickable {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}

.follow-button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9em;
  margin-left: auto;
}

.follow-button.following {
  background-color: #e0e0e0;
  color: #333;
  border-color: #bbb;
}

.follow-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

</style>
