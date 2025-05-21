import axios from 'axios';

// 后端 API 的基础 URL
// 在开发环境中，通常是 http://localhost:后端端口号/api
// 确保这里的端口号 (5001) 和你在 server/.env 中设置的 PORT 一致
const API_BASE_URL = 'http://localhost:5001/api';

// 创建一个 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// (可选) 请求拦截器：用于将来添加认证 token
// 目前我们先注释掉，因为还没有登录功能
/*
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // 假设 token 存储在 localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/

// (可选) 响应拦截器：用于统一处理错误等
apiClient.interceptors.response.use(
  (response) => response, // 如果响应成功，直接返回响应
  (error) => {
    // 这里可以添加全局的错误处理逻辑
    // 例如：如果 token 失效 (401)，则跳转到登录页
    console.error('API Error:', error.response || error.message || error);
    // if (error.response && error.response.status === 401) {
    //   // 清除 token，跳转到登录页
    //   localStorage.removeItem('authToken');
    //   // router.push('/login'); // 假设你使用了 Vue Router
    // }
    return Promise.reject(error); // 将错误继续抛出，以便组件中可以捕获
  }
);

// 定义 API 接口方法
export default {
  // --- 帖子相关的 API ---
  getAllPosts() {
    return apiClient.get('/posts'); // 对应后端 GET /api/posts
  },

  getPostById(postId) {
    return apiClient.get(`/posts/${postId}`); // 对应后端 GET /api/posts/:id
  },

  createPost(postData) {
    // postData 应该包含 { title: '...', content: '...', images: ['url1', 'url2'] }
    // 注意：目前这个接口在后端是受保护的 (protect middleware)，
    // 它期望 req.user._id 存在。
    // 在没有登录功能前，调用这个接口会失败，除非暂时移除后端的 protect 中间件，
    // 或者在后端 createPost 控制器中硬编码一个 user ID。
    // 为了演示，我们先假设可以调用。
    return apiClient.post('/posts', postData); // 对应后端 POST /api/posts
  },

  getPostsByUserId(userId) {
    return apiClient.get(`/posts/user/${userId}`); // 对应后端 GET /api/posts/user/:userId
  },

  // --- 用户相关的 API (未来使用) ---
  /*
  registerUser(userData) {
    return apiClient.post('/auth/register', userData);
  },

  loginUser(credentials) {
    return apiClient.post('/auth/login', credentials);
  },

  getCurrentUserProfile() {
    return apiClient.get('/users/me');
  },

  getUserProfileById(userId) {
    return apiClient.get(`/users/${userId}`);
  },

  updateUserProfile(profileData) {
      return apiClient.put('/users/me/update', profileData);
  }
  */
};
