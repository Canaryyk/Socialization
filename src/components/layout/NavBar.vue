<template>
  <el-header class="nav-bar">
    <div class="nav-container">
      <!-- 左侧：Logo 与菜单 -->
      <div class="nav-left">
        <router-link to="/" class="logo">趣动社区</router-link>
        <!-- 添加 flex 容器包裹菜单 -->
        <div class="menu-container">
          <el-menu mode="horizontal"
                   :default-active="$route.path"
                   router
                   class="nav-menu"
                   background-color="transparent"
                   text-color="#333"
                   active-text-color="#ff6b6b">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/circle">圈子</el-menu-item>
            <el-menu-item index="/chat">聊天</el-menu-item>
          </el-menu>
        </div>
      </div>
      <!-- 右侧：发布动态按钮 -->
      <div class="nav-right">
        <router-link to="/post">
          <el-button type="primary"
                     round
                     class="publish-button">
            发布动态
          </el-button>
        </router-link>
      </div>
    </div>
  </el-header>
</template>

<style scoped>
  /* ========== 全局样式变量 ========== */
  :root {
    --text-color: #333; /* 正文颜色 */
    --nav-bg: rgba(255, 255, 255, 0.98); /* 更实景的导航背景 */
    --transition-fast: 0.3s ease; /* 快速过渡效果 */
  }

  /* ========== 导航栏容器 ========== */
  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 1000;
    height: 64px; /* 微调高度增加呼吸感 */
    display: flex;
    align-items: center;
    background: rgba(248, 250, 252, 0.98);
    backdrop-filter: blur(12px); /* 增强毛玻璃效果 */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); /* 更柔和的阴影 */
    padding: 0 24px; /* 增加两侧留白 */
  }

  /* ========== 导航容器布局 ========== */
  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1440px; /* 增加最大宽度限制 */
    margin: 0 auto; /* 居中布局 */
  }

  /* ========== 左侧导航区域 ========== */
  .nav-left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 40px; /* 使用 gap 替代 margin 控制间距 */
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    transition: color var(--transition-fast);
  }

    .logo:hover {
      color: var(--primary-color); /* 增加悬停效果 */
    }

  /* ========== 菜单容器 ========== */
  .menu-container {
    flex: 1;
    min-width: 0;
  }

  /* ========== 菜单项样式 ========== */
  .nav-menu.el-menu--horizontal {
    display: flex !important;
    border: none;
    gap: 8px; /* 菜单项间距 */
  }

  .el-menu--horizontal > .el-menu-item {
    height: 64px; /* 匹配导航栏高度 */
    padding: 0 16px !important;
    font-size: 1rem;
    transition: color var(--transition-fast), transform var(--transition-fast);
  }

  .el-menu-item:hover {
    color: var(--primary-hover) !important;
  }

  .el-menu-item.is-active {
    transform: translateY(-2px); /* 悬停微移效果 */
    border-bottom: none !important; /* 移除Element默认蓝线 */
  }

  /* 下划线动画优化 */
  .el-menu-item {
    position: relative;
    overflow: hidden;
  }

    .el-menu-item::after {
      content: '';
      position: absolute;
      bottom: 0; /* 调整到绝对底部 */
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary-color);
      transform: scaleX(0);
      transform-origin: left center; /* 优化动画方向 */
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .el-menu-item:hover::after,
    .el-menu-item.is-active::after {
      transform: scaleX(1); /* 更现代的动画效果 */
    }

  /* ========== 发布按钮 ========== */
  .publish-button {
    --button-height: 40px;
    height: var(--button-height);
    padding: 0 24px !important;
    font-weight: 500;
    letter-spacing: 0.5px;
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    box-shadow: 0 5px 14px rgb(241, 174, 76, 0.30); /* 添加发光效果 */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

    .publish-button:hover {
      background: var(--primary-hover) !important;
      border-color: var(--primary-hover) !important;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 16px rgb(250, 137, 46), /* X轴偏移增大 */
      0 2px 8px rgb(245, 140, 61, 0.20); /* 双层阴影增强立体感 */
    }
</style>
