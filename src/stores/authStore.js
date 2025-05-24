// src/stores/authStore.js
import { defineStore } from 'pinia';
import api from '@/services/api';
import router from '@/router'; // 引入 router 实例

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('userInfo')) || null, // 从 localStorage 初始化用户信息
    token: localStorage.getItem('userToken') || null,        // 从 localStorage 初始化 token
    status: { // 用于跟踪 API 请求状态，例如注册/登录时的加载状态
      isLoading: false,
      error: null,
    },
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
    getToken: (state) => state.token,
    authStatus: (state) => state.status,
  },
  actions: {
    setStatus(loading, error = null) {
      this.status.isLoading = loading;
      this.status.error = error;
    },
    async register(userData) {
      this.setStatus(true);
      try {
        const response = await api.register(userData);
        const { token, ...userInfo } = response.data; // 后端返回的数据结构可能包含 token 和用户信息

        this.token = token;
        this.user = userInfo; // 存储用户信息（不含密码）

        localStorage.setItem('userToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        this.setStatus(false);
        router.push('/'); // 注册成功后跳转到首页
        return true; // 表示成功
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Registration failed';
        this.setStatus(false, errorMessage);
        console.error('Registration error:', error.response?.data || error);
        return false; // 表示失败
      }
    },
    async login(credentials) {
      this.setStatus(true);
      try {
        const response = await api.login(credentials);
        const { token, ...userInfo } = response.data;

        this.token = token;
        this.user = userInfo;

        localStorage.setItem('userToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        this.setStatus(false);
        router.push('/'); // 登录成功后跳转到首页
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Login failed';
        this.setStatus(false, errorMessage);
        console.error('Login error:', error.response?.data || error);
        return false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      this.setStatus(false);
      router.push('/login'); // 登出后跳转到登录页 (假设有 /login 路由)
    },
    // 应用启动时，尝试从后端获取用户信息 (如果token存在)
    // 这有助于验证 token 是否仍然有效，并获取最新的用户信息
    async fetchCurrentUser() {
      if (this.token) { // 只有当 state 中有 token (从 localStorage 加载) 时才尝试
        this.setStatus(true);
        try {
          const response = await api.getMe();
          this.user = response.data;
          localStorage.setItem('userInfo', JSON.stringify(response.data)); // 更新本地存储的用户信息
          this.setStatus(false);
        } catch (error) {
          // Token 可能已过期或无效
          console.warn('Failed to fetch current user, possibly invalid token:', error);
          this.logout(); // 如果获取失败，则登出用户
          this.setStatus(false, 'Failed to fetch user data');
        }
      } else {
        this.status.error = null; // 如果没有token，重置错误状态
      }
    },
    async updateUserProfile(userData) {
      if (!this.isLoggedIn) return false;
      this.setStatus(true);
      try {
        const response = await api.updateUserProfile(userData);
        const { token, ...updatedUserInfo } = response.data; // 后端可能返回新token和更新后的用户信息

        this.user = updatedUserInfo;
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

        if (token && token !== this.token) { // 如果后端返回了新的token
          this.token = token;
          localStorage.setItem('userToken', token);
        }

        this.setStatus(false);
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Profile update failed';
        this.setStatus(false, errorMessage);
        console.error('Update profile error:', error.response?.data || error);
        return false;
      }
    }
  },
});
