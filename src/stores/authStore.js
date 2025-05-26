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
    viewedProfile: null, // 用于存储正在查看的他人用户信息
    // 新增：存储被查看用户的内容，例如动态、回复等
    viewedProfileContent: {
      posts: [],
      replies: [],
      media: [],
      likes: [],
      isLoadingPosts: false,
      isLoadingReplies: false,
      isLoadingMedia: false,
      isLoadingLikes: false,
      errorPosts: null,
      errorReplies: null,
      errorMedia: null,
      errorLikes: null,
    },
    // 新增：存储关注/粉丝列表
    userList: {
      users: [],
      isLoading: false,
      error: null,
      listType: null, // 'following' or 'followers'
      profileUser: null // 列表所属的用户信息，用于显示标题等
    }
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
    getToken: (state) => state.token,
    authStatus: (state) => state.status,
    getViewedProfile: (state) => state.viewedProfile, // Getter for viewed profile
    getViewedProfilePosts: (state) => state.viewedProfileContent.posts,
    getViewedProfileReplies: (state) => state.viewedProfileContent.replies,
    getViewedProfileMedia: (state) => state.viewedProfileContent.media,
    getViewedProfileLikes: (state) => state.viewedProfileContent.likes,
    getViewedProfileContentStatus: (state) => ({
      isLoadingPosts: state.viewedProfileContent.isLoadingPosts,
      isLoadingReplies: state.viewedProfileContent.isLoadingReplies,
      isLoadingMedia: state.viewedProfileContent.isLoadingMedia,
      isLoadingLikes: state.viewedProfileContent.isLoadingLikes,
      errorPosts: state.viewedProfileContent.errorPosts,
      errorReplies: state.viewedProfileContent.errorReplies,
      errorMedia: state.viewedProfileContent.errorMedia,
      errorLikes: state.viewedProfileContent.errorLikes,
    }),
    getUserList: (state) => state.userList.users,
    getUserListStatus: (state) => ({
      isLoading: state.userList.isLoading,
      error: state.userList.error,
      listType: state.userList.listType,
      profileUser: state.userList.profileUser,
    }),
    isFollowing: (state) => {
      if (!state.user || !state.user.following || !state.viewedProfile) {
        return false;
      }
      return state.user.following.some(followedUser => followedUser === state.viewedProfile._id || (typeof followedUser === 'object' && followedUser._id === state.viewedProfile._id));
    },
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
      this.viewedProfile = null; // 清除正在查看的用户信息
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
    async updateUserProfile(profileData) { // profileData is now expected to be FormData
      if (!this.isLoggedIn) return false;
      this.setStatus(true);
      try {
        // api.updateUserProfile 需要能够发送 FormData
        // 确保 api service 中的对应方法设置了正确的 Content-Type header
        // (通常 Axios 会在传入 FormData 时自动设置 multipart/form-data)
        const response = await api.updateUserProfile(profileData);
        const { token, ...updatedUserInfo } = response.data;

        this.user = updatedUserInfo;
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

        if (token && token !== this.token) {
          this.token = token;
          localStorage.setItem('userToken', token);
        }

        this.setStatus(false);
        return true;
      } catch (error) {
        let errorMessage = 'Profile update failed';
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        this.setStatus(false, errorMessage);
        console.error('Update profile error:', error.response?.data || error);
        return false;
      }
    },
    // 获取指定用户的公开信息
    async fetchPublicProfile(identifier, type = 'id') { // type can be 'id' or 'username'
      this.setStatus(true);
      this.viewedProfile = null; // Reset before fetching new profile
      // 重置相关内容
      this.clearViewedProfileContent();
      try {
        let response;
        if (type === 'username') {
          response = await api.getUserProfileByUsername(identifier);
        } else {
          response = await api.getUserProfileById(identifier);
        }
        // Ensure followers and following arrays exist, even if empty
        // 假设后端返回的数据中会包含 postsCount 和 likesCount
        this.viewedProfile = {
          ...response.data,
          followers: response.data.followers || [],
          following: response.data.following || [],
          postsCount: response.data.postsCount || 0, // 确保有默认值
          likesCount: response.data.likesCount || 0, // 确保有默认值
        };
        this.setStatus(false);
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch user profile';
        this.setStatus(false, errorMessage);
        console.error('Fetch public profile error:', error.response?.data || error);
        this.viewedProfile = null; // Ensure it's null on error
        return false;
      }
    },
    clearViewedProfile() {
      this.viewedProfile = null;
      this.clearViewedProfileContent(); // 同时清除内容
    },

    // 清除被查看用户的内容
    clearViewedProfileContent() {
      this.viewedProfileContent = {
        posts: [],
        replies: [],
        media: [],
        likes: [],
        isLoadingPosts: false,
        isLoadingReplies: false,
        isLoadingMedia: false,
        isLoadingLikes: false,
        errorPosts: null,
        errorReplies: null,
        errorMedia: null,
        errorLikes: null,
      };
    },

    async fetchViewedProfilePosts(userId) {
      if (!userId) return;
      this.viewedProfileContent.isLoadingPosts = true;
      this.viewedProfileContent.errorPosts = null;
      try {
        // api.getPostsByUser(userId) 已存在
        const response = await api.getPostsByUser(userId);
        this.viewedProfileContent.posts = response.data || [];
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch user posts';
        this.viewedProfileContent.errorPosts = errorMessage;
        console.error('Fetch user posts error:', error.response?.data || error);
      } finally {
        this.viewedProfileContent.isLoadingPosts = false;
      }
    },

    async fetchViewedProfileReplies(userId) {
      if (!userId) return;
      this.viewedProfileContent.isLoadingReplies = true;
      this.viewedProfileContent.errorReplies = null;
      try {
        // 假设 api.getUserReplies(userId) 存在或将被创建
        const response = await api.getUserReplies(userId);
        this.viewedProfileContent.replies = response.data || [];
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch user replies';
        this.viewedProfileContent.errorReplies = errorMessage;
        console.error('Fetch user replies error:', error.response?.data || error);
      } finally {
        this.viewedProfileContent.isLoadingReplies = false;
      }
    },

    async fetchViewedProfileMedia(userId) {
      if (!userId) return;
      this.viewedProfileContent.isLoadingMedia = true;
      this.viewedProfileContent.errorMedia = null;
      try {
        // 假设 api.getUserMedia(userId) 存在或将被创建
        const response = await api.getUserMedia(userId);
        this.viewedProfileContent.media = response.data || [];
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch user media';
        this.viewedProfileContent.errorMedia = errorMessage;
        console.error('Fetch user media error:', error.response?.data || error);
      } finally {
        this.viewedProfileContent.isLoadingMedia = false;
      }
    },

    async fetchViewedProfileLikes(userId) {
      if (!userId) return;
      this.viewedProfileContent.isLoadingLikes = true;
      this.viewedProfileContent.errorLikes = null;
      try {
        // 假设 api.getUserLikedPosts(userId) 存在或将被创建
        const response = await api.getUserLikedPosts(userId);
        this.viewedProfileContent.likes = response.data || [];
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch user liked posts';
        this.viewedProfileContent.errorLikes = errorMessage;
        console.error('Fetch user liked posts error:', error.response?.data || error);
      } finally {
        this.viewedProfileContent.isLoadingLikes = false;
      }
    },

    async followUser(userIdToFollow) {
      if (!this.isLoggedIn) return false;
      this.setStatus(true);
      try {
        await api.followUser(userIdToFollow);

        // Update current user's following list
        if (this.user && this.user.following) {
          if (!this.user.following.find(id => id === userIdToFollow)) {
            this.user.following.push(userIdToFollow);
          }
        } else if (this.user) {
          this.user.following = [userIdToFollow];
        }

        // Update viewed profile's followers list if it's the user being followed
        if (this.viewedProfile && this.viewedProfile._id === userIdToFollow) {
          if (this.viewedProfile.followers) {
            if (!this.viewedProfile.followers.find(id => id === this.user._id)) {
              this.viewedProfile.followers.push(this.user._id);
            }
          } else {
            this.viewedProfile.followers = [this.user._id];
          }
        }

        localStorage.setItem('userInfo', JSON.stringify(this.user));
        this.setStatus(false);
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Follow user failed';
        this.setStatus(false, errorMessage);
        console.error('Follow user error:', error.response?.data || error);
        return false;
      }
    },

    async unfollowUser(userIdToUnfollow) {
      if (!this.isLoggedIn) return false;
      this.setStatus(true);
      try {
        await api.unfollowUser(userIdToUnfollow);

        // Update current user's following list
        if (this.user && this.user.following) {
          this.user.following = this.user.following.filter(id => id !== userIdToUnfollow);
        }

        // Update viewed profile's followers list if it's the user being unfollowed
        if (this.viewedProfile && this.viewedProfile._id === userIdToUnfollow) {
          if (this.viewedProfile.followers) {
            this.viewedProfile.followers = this.viewedProfile.followers.filter(id => id !== this.user._id);
          }
        }

        localStorage.setItem('userInfo', JSON.stringify(this.user));
        this.setStatus(false);
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Unfollow user failed';
        this.setStatus(false, errorMessage);
        console.error('Unfollow user error:', error.response?.data || error);
        return false;
      }
    },

    // Action to fetch following list
    async fetchFollowingList(identifier, type = 'id') {
      this.userList.isLoading = true;
      this.userList.error = null;
      this.userList.listType = 'following';
      this.userList.users = [];
      try {
        // 获取列表所属的用户信息，以便在列表页面显示 "XXX的关注列表"
        // 这假设 fetchPublicProfile 已经被调用或者可以安全调用来获取 profileUser
        // 或者，我们可以从 API 直接返回 profileUser 的基本信息
        // 为简化，暂时依赖 viewedProfile (如果列表页的用户就是当前 viewedProfile)
        // 更好的做法是API返回列表的同时，也告知这是谁的列表
        if (this.viewedProfile && (this.viewedProfile._id === identifier || this.viewedProfile.username === identifier)) {
            this.userList.profileUser = { username: this.viewedProfile.username, _id: this.viewedProfile._id };
        } else {
            // 如果 viewedProfile 不是当前列表的用户，需要一种方式获取列表用户的username
            // 暂时设为 null，组件中可以根据 identifier 显示
            this.userList.profileUser = { identifier };
        }

        const response = await api.getUserFollowingList(identifier, type);
        this.userList.users = response.data || [];
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch following list';
        this.userList.error = errorMessage;
        console.error('Fetch following list error:', error);
      } finally {
        this.userList.isLoading = false;
      }
    },

    // Action to fetch followers list
    async fetchFollowersList(identifier, type = 'id') {
      this.userList.isLoading = true;
      this.userList.error = null;
      this.userList.listType = 'followers';
      this.userList.users = [];
      try {
        if (this.viewedProfile && (this.viewedProfile._id === identifier || this.viewedProfile.username === identifier)) {
            this.userList.profileUser = { username: this.viewedProfile.username, _id: this.viewedProfile._id };
        } else {
            this.userList.profileUser = { identifier };
        }

        const response = await api.getUserFollowersList(identifier, type);
        this.userList.users = response.data || [];
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch followers list';
        this.userList.error = errorMessage;
        console.error('Fetch followers list error:', error);
      } finally {
        this.userList.isLoading = false;
      }
    },

    clearUserList() {
        this.userList = {
            users: [],
            isLoading: false,
            error: null,
            listType: null,
            profileUser: null
        };
    },
  },
});
