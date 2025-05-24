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


一、 后端和数据持久化 (当务之急)
目前你使用的是 mock-data，这对于开发和演示很好，但要成为一个有实用价值的网站，必须要有真实的后端服务和数据库。
选择后端技术栈:
Node.js (Express/NestJS): 如果你熟悉 JavaScript，这是个不错的选择，可以实现全栈JS。
Python (Django/Flask): 强大的生态，适合快速开发和复杂应用。
Java (Spring Boot): 稳定、成熟，适合大型企业级应用。
GoLang: 高性能，适合并发场景。
BaaS (Backend as a Service): 如 Firebase, Supabase, AWS Amplify。可以极大简化后端开发，尤其是初期。它们通常提供数据库、认证、存储等功能。
数据库选择:
关系型数据库 (SQL): PostgreSQL, MySQL。结构化数据，事务性强。适合用户、帖子、评论等关系明确的数据。
非关系型数据库 (NoSQL): MongoDB。灵活，适合半结构化数据，如聊天记录、用户偏好等。
API 设计: 设计 RESTful 或 GraphQL API 供前端调用，替换掉 mock-data 的读取逻辑。
二、核心运动社交功能增强
用户认证与授权 (Authentication & Authorization):
注册/登录: 邮箱/手机号注册，密码登录。
第三方登录: 微信、QQ、GitHub、Google 等，降低注册门槛。
JWT (JSON Web Tokens): 用于管理用户会话。
权限控制: 谁可以发帖、删帖、评论、管理圈子等。
用户个人主页 (User Profile):
展示用户基本信息 (头像、昵称、简介)。
展示用户发布的帖子列表。
展示用户参与的运动、加入的圈子。
关注/粉丝系统。
运动数据统计（如果引入运动记录功能）。
“圈子” (CircleView) 功能深化:
创建/加入圈子: 按运动类型 (篮球、足球、跑步、健身)、地区、兴趣等创建或加入圈子。
圈内讨论区: 圈子专属的帖子流或论坛。
圈子活动发布: 成员可以在圈内发起运动邀约。
成员管理: 圈主/管理员权限。
活动/赛事系统 (Events):
发布活动: 用户可以发布线下运动活动（时间、地点、运动类型、人数限制、报名方式）。
发现活动: 用户可以按地区、运动类型、时间筛选和搜索活动。
报名/参与: 用户可以报名参加活动，组织者可以管理报名人员。
活动日历: 展示用户关注的或报名的活动。
内容互动增强:
点赞/收藏: 对帖子、评论进行点赞和收藏。
评论区: PostDetail.vue 中实现评论功能，支持回复评论。
@提及用户: 在帖子或评论中@其他用户。
话题/标签 (Hashtags): 用户发帖时可以添加话题标签，方便内容归类和发现。
三、提升用户体验 (UX) 和技术细节
实时通知系统:
新消息、新评论、被@、被点赞、活动邀请、关注提醒等。
可以使用 WebSockets (如 Socket.IO) 实现。
搜索功能:
搜索用户、帖子、圈子、活动。
可以考虑使用 Elasticsearch 等搜索引擎优化复杂搜索。
图片/视频上传与处理:
支持帖子中上传多张图片或短视频。
图片压缩、裁剪、CDN 加速。
消息系统增强 (ChatList.vue, MessageBubble.vue):
已读/未读状态。
发送图片、表情。
群聊功能 (与圈子结合或独立)。
个性化推荐:
根据用户兴趣、关注的人、参与的活动推荐相关帖子、用户或活动。
响应式设计: 确保在不同设备 (PC, 平板, 手机) 上都有良好的体验。
性能优化:
代码分割、懒加载 (尤其是图片和长列表)。
合理使用缓存。
前端构建优化。
安全性:
防止 XSS、CSRF 攻击。
API 接口安全。
用户数据加密。
四、运营和发展方向
内容审核机制: 确保社区内容健康。
用户激励体系: 签到、积分、勋章等，提高用户粘性。
本地化/地理位置服务:
查找附近的运动伙伴、场地、活动。
基于地理位置推荐内容。
运动数据记录与分享 (可选，但很“运动”):
允许用户手动记录运动数据 (跑步里程、健身时长等)。
如果技术允许，可以考虑集成第三方运动手环/App API (如 Strava, Keep - 较复杂)。
*/
