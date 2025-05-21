import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PostView from '@/views/PostView.vue'
import CircleView from '@/views/CircleView.vue'
import ChatView from '@/views/ChatView.vue'
import PostDetail from '@/views/PostDetail.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/post', name: 'Post', component: PostView },
  { path: '/circle', name: 'Circle', component: CircleView },
  { path: '/chat', name: 'Chat', component: ChatView },
  { path: '/post/:id', name: 'PostDetail', component: PostDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
