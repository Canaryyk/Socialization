// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import PostView from '@/views/PostView.vue';
import CircleView from '@/views/CircleView.vue';
import ChatView from '@/views/ChatView.vue';
import PostDetail from '@/views/PostDetail.vue';
// 引入 auth store，用于路由守卫
import { useAuthStore } from '@/stores/authStore'; // 假设你的 authStore 在这个路径

// 懒加载组件可以提升初始加载速度
const LoginView = () => import('@/views/LoginView.vue');
const RegisterView = () => import('@/views/RegisterView.vue');
const UserProfilePage = () => import('@/views/UserProfilePage.vue');
const EditProfilePage = () => import('@/views/EditProfilePage.vue');

const routes = [
  {
    path: '/',
    name: 'Home', // 保持大写开头以符合常见规范
    component: HomeView
  },
  {
    path: '/post', // 发布动态页
    name: 'Post',
    component: PostView,
    meta: { requiresAuth: true } // 需要登录才能访问
  },
  {
    path: '/circle',
    name: 'Circle',
    component: CircleView,
    meta: { requiresAuth: true } // 假设圈子功能也需要登录
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatView,
    meta: { requiresAuth: true } // 假设聊天功能需要登录
  },
  {
    path: '/post/:id', // 帖子详情页
    name: 'PostDetail',
    component: PostDetail
    // 帖子详情通常公开，但内部的评论、点赞等操作可能需要登录
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guestOnly: true } // 只允许未登录用户访问
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { guestOnly: true } // 只允许未登录用户访问
  },
  {
    path: '/user/:username',
    name: 'UserProfileByUsername',
    component: UserProfilePage,
    props: true
  },
  {
    path: '/profile/:id',
    name: 'UserProfileById',
    component: UserProfilePage,
    props: true
  },
  {
    path: '/settings/profile',
    name: 'EditProfile',
    component: EditProfilePage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 确保你的 BASE_URL 配置正确
  routes
});

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // Pinia store 必须在 Vue app 创建并 use(pinia) 之后才能在组件外正确实例化。
  // 通常在 main.js 中初始化 Pinia。
  // 如果在路由守卫中直接使用 useAuthStore()，需要确保 Pinia 已经初始化。
  // 一个更稳妥的方式是，Pinia 实例应该在 Vue app 实例创建之后才可用。
  // 然而，对于 Vue Router 4，通常可以在路由守卫中这样使用，只要确保 main.js 先执行。

  const authStore = useAuthStore();

  // 如果应用刚加载，且 localStorage 中有 token 但 store 中还没有用户信息，
  // 可以在 App.vue 的 onMounted 中调用 fetchCurrentUser。
  // 这里我们主要处理路由跳转时的权限检查。

  const isLoggedIn = authStore.isLoggedIn; // 从 getter 获取登录状态

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 此路由需要授权，但用户未登录
    // 重定向到登录页面，并带上原始意图的路径作为查询参数
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && isLoggedIn) {
    // 此路由只允许未登录用户访问 (例如登录、注册页)，但用户已登录
    // 重定向到首页
    next({ name: 'Home' });
  } else {
    // 确保一定要调用 next()
    next();
  }
});

export default router;
