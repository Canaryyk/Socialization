// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'; // 你的后端 API 地址

const apiClient = axios.create({
  baseURL: API_URL,
  // headers: { // 移除全局 Content-Type 设置，让 Axios 自动处理
  //   'Content-Type': 'application/json',
  // },
});

// 请求拦截器：在每个请求发送前，检查 localStorage 中是否有 token，如果有就添加到请求头
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken'); // 我们将 token 存储在 localStorage 中，名为 'userToken'
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // 注意 'Bearer ' 前缀
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 (可选，但有用)：可以统一处理错误，例如 token 失效跳转到登录页
apiClient.interceptors.response.use(
  (response) => response, // 直接返回成功的响应
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token 无效或过期
      console.error("Unauthorized or Token expired, redirecting to login...");
      localStorage.removeItem('userToken'); // 清除无效token
      localStorage.removeItem('userInfo'); // 清除用户信息
      // 这里可以触发一个全局事件或直接用 router 跳转到登录页
      // import router from '@/router'; // 确保可以访问 router 实例
      // router.push('/login'); // 假设你的登录页路由是 /login
      // 注意：在JS模块中直接使用router实例可能需要特殊处理，通常在 Vue 组件或 Pinia action 中更容易
      // 暂时先打印日志，后续再完善跳转逻辑
    }
    return Promise.reject(error);
  }
);

export default {
  // --- Auth Service ---
  register(userData) {
    return apiClient.post('/auth/register', userData);
  },
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  // 如果有登出 API (后端通常不需要专门的登出 API，因为 JWT 是无状态的，前端清除 token 即可)
  // logout() { /* 通常是前端操作 */ }

  // --- User Service ---
  getMe() { // 获取当前登录用户信息
    return apiClient.get('/users/me');
  },
  updateUserProfile(userData) {
    return apiClient.put('/users/me/update', userData);
  },
  getUserProfileById(userId) {
    return apiClient.get(`/users/${userId}`);
  },
  getUserProfileByUsername(username) {
    return apiClient.get(`/users/username/${username}`);
  },

  // --- Post Service (你已经有的) ---
  createPost(postData) {
    return apiClient.post('/posts', postData);
  },
  getAllPosts(sortBy = 'createdAt') { // 默认按帖子创建时间排序，评论默认按时间
    return apiClient.get('/posts', { params: { sortBy } });
  },
  getPostById(postId, sortByComment = 'time') { // 默认按评论时间排序
    return apiClient.get(`/posts/${postId}`, { params: { sortByComment } });
  },
  getPostsByUser(userId) {
    return apiClient.get(`/posts/user/${userId}`);
  },

  // --- Comment Service for Posts ---
  addCommentToPost(postId, commentData) { // commentData should be an object like { text: "..." }
    return apiClient.post(`/posts/${postId}/comments`, commentData);
  },
  deleteCommentFromPost(postId, commentId) {
    return apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  },

  // --- Like Service ---
  likePost(postId) {
    return apiClient.post(`/posts/${postId}/like`);
  },

  likeComment(postId, commentId) {
    return apiClient.post(`/posts/${postId}/comments/${commentId}/like`);
  },

  // ... 其他 API 方法
};
