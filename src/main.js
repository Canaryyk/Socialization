import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'
import './assets/base.css'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(createPinia());
app.use(router)
app.mount('#app')

/*
├─ public /                # 静态资源
│  ├─ mock - data /        # 本地存储的模拟数据（JSON文件）
├─ src /
│  ├─ assets /            # 静态资源
│  │  ├─ base.css          # 全局样式
│  │  └─ images /        # 图片资源
│  ├─ components /        # 公共组件
│  │  ├─ layout /        # 布局组件
│  │  │  ├─ NavBar.vue  # 导航栏（含发布按钮）
│  │  │  └─ Footer.vue   #  页尾栏
│  │  ├─ cards /         # 卡片组件
│  │  │  ├─ UserCard.vue # 达人卡片
│  │  │  └─ PostCard.vue # 动态卡片
│  │  └─ chat /          # 聊天组件
│  │     ├─ ChatList.vue # 会话列表
│  │     └─ MessageBubble.vue  # 聊天气泡
│  ├─ views /            # 页面视图
│  │  ├─ HomeView.vue   # 首页
│  │  ├─ PostView.vue   # 动态发布页
│  │  ├─ CircleView.vue # 兴趣圈
│  │  └─ ChatView.vue   # 聊天页
│  ├─ utils /            # 工具类
│  │  ├─ localStorage.js # 本地存储封装
│  ├─ router /           # 路由配置
│  │  └─ index.js
│  ├─ App.vue
│  └─ main.js
├─ package.json
└─ vite.config.js       # 构建配置
*/
