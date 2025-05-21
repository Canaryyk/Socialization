<template>
  <div class="circle-view container">
    <h2>兴趣圈</h2>
    <p>这里是兴趣圈版块，展示与运动相关的兴趣话题和动态。</p>
    <div class="post-cards">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script>
  import PostCard from '@/components/cards/PostCard.vue'

  export default {
    name: 'CircleView',
    components: { PostCard },
    data() {
      return {
        posts: []
      }
    },
    mounted() {
      // 复用模拟的动态数据
      fetch('/mock-data/posts.json')
        .then(response => response.json())
        .then(data => {
          this.posts = data;
        })
        .catch(err => console.error('Error fetching posts:', err));
    }
  }
</script>

<style scoped>
  .circle-view {
    padding: 2rem 0;
  }

  .post-cards {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
</style>
