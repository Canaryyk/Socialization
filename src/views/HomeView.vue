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
  import { getItem, setItem } from '@/utils/localStorage';
  import UserCard from '@/components/cards/UserCard.vue'
  import PostCard from '@/components/cards/PostCard.vue'

  export default {
    name: 'HomeView',
    components: { UserCard, PostCard },
    data() {
      return {
        users: [],
        posts: []
      }
    },
    mounted() {
      // 获取运动达人数据
      const storedUsers = getItem('users');
      if (storedUsers && storedUsers.length > 0) {
        this.users = storedUsers;
      } else {
        fetch('/mock-data/users.json')
          .then(response => response.json())
          .then(data => {
            this.users = data;
            setItem('users', data);
          })
          .catch(err => console.error('Error fetching users:', err));
      }

      // 获取动态数据
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
    }

  }
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
