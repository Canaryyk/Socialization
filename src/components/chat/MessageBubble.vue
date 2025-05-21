<template>
  <div class="message-bubble" :class="{'from-me': isFromMe}">
    <p>{{ message.text }}</p>
    <span class="timestamp">{{ formattedTimestamp }}</span>
  </div>
</template>

<script>
  export default {
    name: 'MessageBubble',
    props: {
      message: {
        type: Object,
        required: true
      },
      isFromMe: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      formattedTimestamp() {
        const date = new Date(this.message.timestamp);
        return date.toLocaleTimeString();
      }
    }
  }
</script>

<style scoped>
  .message-bubble {
    max-width: 70%;
    margin-bottom: 0.75rem; /* 气泡之间的间距 */
    padding: 0.75rem 1.25rem; /* 内部填充，更舒适 */
    border-radius: 16px 16px 16px 0; /* 接收消息：左下角平直 */
    background-color: #f5f5f4; /* 调整为温暖浅灰，用于接收消息 */
    color: var(--text-color); /* 深蓝灰文字 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06); /* 轻微阴影 */
    position: relative;
    animation: fadeIn 0.3s ease; /* 淡入动画 */
    word-break: break-word; /* 自动换行 */
  }

    .message-bubble.from-me {
      margin-left: auto;
      border-radius: 16px 16px 0 16px; /* 发送消息：右下角平直 */
      background: linear-gradient(135deg, #fce4de, #fdd0c4); /* 淡橙色渐变 */
      color: #374151; /* 深灰色文字，提升对比度 */
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* 稍轻的阴影 */
    }

    .message-bubble p {
      margin: 0;
      font-size: 1rem; /* 消息文字大小 */
      line-height: 1.5; /* 行高，提升可读性 */
    }

  .timestamp {
    display: block;
    font-size: 0.75rem; /* 时间戳稍大 */
    margin-top: 0.5rem; /* 与消息文字的间距 */
    text-align: right;
    color: var(--secondary-color); /* 次要颜色 */
    opacity: 0.8; /* 略微透明 */
  }

  /* 接收消息的小尾巴 */
  .message-bubble:not(.from-me)::before {
    content: '';
    position: absolute;
    bottom: -6px;
    left: -6px;
    width: 12px;
    height: 12px;
    background-color: #f5f5f4; /* 与接收消息背景一致 */
    clip-path: polygon(0 0, 100% 100%, 0 100%);
    z-index: -1;
  }

  /* 发送消息的小尾巴 */
  .message-bubble.from-me::before {
    content: '';
    position: absolute;
    bottom: -6px;
    right: -6px;
    width: 12px;
    height: 12px;
    background: #e3f2fd; /* 与发送消息渐变起点一致 */
    clip-path: polygon(100% 0, 0 100%, 100% 100%);
    z-index: -1;
  }

  /* 淡入动画 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
