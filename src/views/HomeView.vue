<template>
  <div class="home-view container">
    <section class="experts-section">
      <h2>运动达人推荐</h2>
      <div class="user-cards">
        <UserCard v-for="user in users" :key="user.id" :user="user" />
      </div>
    </section>
    <section class="posts-section">
      <h2>兴趣内容推荐</h2>
      <div class="post-cards">
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
      </div>
    </section>
  </div>
</template>

<script>
  // 移除了 getItem, setItem，因为我们将从后端获取数据
  // import { getItem, setItem } from '@/utils/localStorage';
  import UserCard from '@/components/cards/UserCard.vue';
  import PostCard from '@/components/cards/PostCard.vue';
  import api from '@/services/api'; // <--- 1. 导入 API 服务

  export default {
    name: 'HomeView',
    components: { UserCard, PostCard },
    data() {
      return {
        users: [], // 用户数据暂时保留，或者你也想从后端获取？
        posts: [], // <--- 将用于存储从后端获取的帖子
        isLoadingPosts: true, // <--- 2. 新增加载状态
        postsError: null,     // <--- 3. 新增错误状态
      };
    },
    methods: { // <--- 4. 新增 methods 对象 (如果之前没有)
      async fetchPostsFromAPI() {
        this.isLoadingPosts = true;
        this.postsError = null;
        try {
          const response = await api.getAllPosts(); // <--- 5. 调用 API
          this.posts = response.data; // <--- 6. 更新 posts 数据
        } catch (err) {
          console.error('Error fetching posts from API:', err);
          this.postsError = '无法加载动态，请稍后再试。';
          this.posts = []; // 出错时清空
        } finally {
          this.isLoadingPosts = false; // <--- 7. 更新加载状态
        }
      },
      // 如果用户数据也想从后端获取，可以添加类似 fetchUsersFromAPI 的方法
      fetchMockUsers() { // 保留你之前的 mock 用户数据获取逻辑
        // const storedUsers = getItem('users'); // 移除 localStorage 相关
        // if (storedUsers && storedUsers.length > 0) {
        //   this.users = storedUsers;
        // } else {
        fetch('/mock-data/users.json')
          .then(response => response.json())
          .then(data => {
            this.users = data;
            // setItem('users', data); // 移除 localStorage 相关
          })
          .catch(err => console.error('Error fetching users:', err));
        // }
      }
    },
    mounted() {
      this.fetchMockUsers(); // 调用获取模拟用户数据的方法

      // 获取动态数据 (从 API)
      this.fetchPostsFromAPI(); // <--- 8. 在 mounted 中调用新的 API 获取方法

      // --- 移除以下从 localStorage 和 mock-data/posts.json 获取帖子的旧逻辑 ---
      /*
      const storedPosts = getItem('posts');
      if (storedPosts && storedPosts.length > 0) {
        this.posts = storedPosts;
      } else {
        fetch('/mock-data/posts.json')
          .then(response => response.json())
          .then(data => {
            this.posts = data;
            setItem('posts', data);
          })
          .catch(err => console.error('Error fetching posts:', err));
      }
      */
    }
  };
</script>

<style scoped>
  .home-view {
    padding: 3rem 0;
    background-color: var(--background-color);
    max-width: 1400px; /* 拓宽内容范围 */
    margin: 0 auto;
  }

  .experts-section,
  .posts-section {
    margin-bottom: 4rem; /* 增大分区间距 */
  }

    .experts-section h2,
    .posts-section h2 {
      color: #f7937c; /* 新标题颜色 */
      font-size: 2rem; /* 增大字体 */
      font-weight: 600; /* 加粗 */
      letter-spacing: 0.5px; /* 字间距 */
      margin-bottom: 2rem; /* 与卡片间距 */
      text-align: left; /* 左对齐 */
    }

  .user-cards,
  .post-cards {
    display: grid;
    gap: 2.5rem; /* 卡片间距 */
    justify-content: center;
  }

  .user-cards {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 用户卡片宽度 */
  }

  .post-cards {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); /* 帖子卡片宽度 */
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  /* 卡片悬停效果 */
  .user-cards > *:hover,
  .post-cards > *:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05); /* 柔和阴影 */
  }
</style>
