<template>
  <div class="user-card">
    <!-- 用户头像 -->
    <img :src="user.avatar" alt="avatar" class="avatar" />

    <!-- 用户信息区域 -->
    <div class="user-info">
      <h3 class="username">{{ user.name }}</h3>
      <p class="bio">{{ user.bio || '这个用户还没有个人简介' }}</p>
    </div>

    <!-- 关注按钮 -->
    <button class="follow-button" @click="followUser">
      <span v-if="!isFollowed" class="icon">+</span>
      {{ isFollowed ? '已关注' : '关注' }}
    </button>

    <!-- 使用 Teleport 将 Toast 渲染到 body -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toastVisible" class="toast">
          <span class="toast-icon">✓</span>
          {{ toastMessage }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script>
  export default {
    name: 'UserCard',
    props: {
      user: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        isFollowed: false, // 新增状态变量，用于跟踪是否已关注
        toastVisible: false,
        toastMessage: '',
        toastTimeout: null
      }
    },
    methods: {
      followUser() {
        if (this.isFollowed) return; // 如果已关注，则不执行
        this.isFollowed = true; // 点击后标记为已关注
        // 清除已有定时器
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        // 更新反馈信息
        this.toastMessage = `已成功关注 ${this.user.name}`;
        this.toastVisible = true;
        // 1秒后隐藏 toast
        this.toastTimeout = setTimeout(() => {
          this.toastVisible = false;
        }, 1000);
      }
    }
  }
</script>

<style scoped>
  /* 用户卡片容器
   -------------------------- */
  .user-card {
    /* 布局相关 */
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative; /* 为绝对定位的toast提供定位上下文 */
    /* 视觉样式 */
    background: #fff;
    padding: 1.25rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    min-width: 320px;
    /* 交互效果 */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

    /* 悬停效果 */
    .user-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

  /* 用户头像
   -------------------------- */
  .avatar {
    width: 56px;
    height: 56px;
    flex-shrink: 0; /* 防止头像被压缩 */
    border-radius: 50%;
    object-fit: cover; /* 保持图片比例 */
    border: 2px solid #eee; /* 使用实际颜色替换var() */
  }

  /* 用户信息区域
   -------------------------- */
  .user-info {
    flex: 1; /* 占据剩余空间 */
    min-width: 120px; /* 保证最小文本空间 */
    overflow: hidden; /* 内容超出时隐藏 */
  }

  /* 用户名样式
   -------------------------- */
  .username {
    color: #333; /* 主文本颜色 */
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    white-space: nowrap; /* 单行显示 */
    overflow: hidden;
    text-overflow: ellipsis; /* 文本截断 */
  }

  /* 用户简介
   -------------------------- */
  .bio {
    color: #666; /* 次要文本颜色 */
    font-size: 0.875rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* 限制两行显示 */
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 关注按钮
   -------------------------- */
  .follow-button {
    /* 布局相关 */
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0; /* 防止按钮被压缩 */
    /* 视觉样式 */
    background: var(--primary-color); /* 主色 */
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.875rem;
    cursor: pointer;
    /* 交互效果 */
    transition: background 0.2s ease;
  }

    /* 按钮悬停状态 */
    .follow-button:hover {
      background: var(--primary-hover); /* 加深的主色 */
    }

  /* 关注图标
   -------------------------- */
  .icon {
    font-weight: 700;
    font-size: 1.1em;
  }

  /* 响应式设计 - 移动端适配
   -------------------------- */
  @media (max-width: 480px) {
    .user-card {
      gap: 1rem;
      padding: 1rem;
      min-width: auto; /* 移除最小宽度限制 */
    }

    .avatar {
      width: 48px;
      height: 48px;
    }
  }

  /* Toast反馈样式
   -------------------------- */
  .toast {
    /* 定位相关 */
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    /* 视觉样式 */
    background: #81c77e; /* 成功绿色 */
    color: white;
    padding: 12px 24px;
    border-radius: 28px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }

  /* Toast图标 */
  .toast-icon {
    font-weight: bold;
    font-size: 1.1em;
  }

  /* Toast动画 */
  .toast-enter-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toast-leave-active {
    transition: all 0.2s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-30px);
  }
</style>
