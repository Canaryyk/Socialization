<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <p>© 2025 趣动社区. 保留所有权利.</p>
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">联系方式</a>
          <a href="#">隐私政策</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
  export default {
    name: 'Footer'
  }
</script>

<style scoped>
  .footer {
    background: linear-gradient(135deg, #2d3748, #1a202c); /* 深灰渐变背景 */
    color: rgba(255, 255, 255, 0.9); /* 柔和白色文字 */
    padding: 2rem 0; /* 增大内边距 */
    margin-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1); /* 上方分隔线 */
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
    font-family: 'Inter', system-ui, -apple-system, sans-serif; /* 与base.css一致 */
  }

  .footer-content {
    display: flex;
    justify-content: space-between; /* 内容两端对齐 */
    align-items: center;
    max-width: 1200px; /* 与container一致 */
    margin: 0 auto;
    padding: 0 1rem;
  }

    .footer-content p {
      margin: 0;
      font-size: 0.9rem; /* 稍小字体 */
      letter-spacing: 0.5px; /* 字间距 */
    }

  .footer-links {
    display: flex;
    gap: 1.5rem; /* 链接间距 */
  }

    .footer-links a {
      color: rgba(255, 255, 255, 0.7); /* 稍淡的白色 */
      font-size: 0.9rem;
      text-decoration: none;
      transition: color 0.3s ease; /* 悬停颜色过渡 */
    }

      .footer-links a:hover {
        color: var(--primary-color); /* 悬停时变为主色调 */
      }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column; /* 小屏幕垂直排列 */
      text-align: center;
    }

    .footer-links {
      margin-top: 1rem; /* 链接与版权间距 */
    }
  }
</style>
