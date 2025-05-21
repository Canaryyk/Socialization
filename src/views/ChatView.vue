<template>
  <div class="chat-view container">
    <h2>聊天</h2>
    <div class="chat-container">
      <div class="chat-list-panel">
        <ChatList :chats="chats" @select="selectChat" />
      </div>
      <div class="chat-window-panel" v-if="selectedChat">
        <h3>与 {{ selectedChat.name }} 的聊天</h3>
        <div class="messages">
          <MessageBubble v-for="(message, index) in messages"
                         :key="index"
                         :message="message"
                         :isFromMe="message.fromMe" />
        </div>
        <div class="message-input">
          <input type="text" v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" />
          <button @click="sendMessage">发送</button>
        </div>
      </div>
      <div class="chat-window-panel placeholder" v-else>
        <p>请选择一个聊天会话开始聊天</p>
      </div>
    </div>
  </div>
</template>

<script>
  import { getItem, setItem } from '@/utils/localStorage';
  import ChatList from '@/components/chat/ChatList.vue'
  import MessageBubble from '@/components/chat/MessageBubble.vue'

  export default {
    name: 'ChatView',
    components: { ChatList, MessageBubble },
    data() {
      return {
        chats: [],
        selectedChat: null,
        messages: [],
        newMessage: ''
      }
    },
    mounted() {
      // 获取会话列表
      fetch('/mock-data/chats.json')
        .then(response => response.json())
        .then(data => {
          this.chats = data;
        })
        .catch(err => console.error('Error fetching chats:', err));
    },
    methods: {
      selectChat(chat) {
        this.selectedChat = chat;
        // 尝试从 localStorage 获取该会话的消息，key 采用 'chat_{chat.id}'
        const storedMessages = getItem(`chat_${chat.id}`);
        if (storedMessages) {
          this.messages = storedMessages;
        } else {
          // 如果没有记录，则模拟一些初始消息，并写入 localStorage
          this.messages = [
            { text: '最近运动怎么样？', timestamp: new Date().toISOString(), fromMe: false },
            { text: '我最近开始跑步了，很有意思！', timestamp: new Date().toISOString(), fromMe: true }
          ];
          setItem(`chat_${chat.id}`, this.messages);
        }
      },
      sendMessage() {
        if (this.newMessage.trim() === '') return;
        const newMsg = {
          text: this.newMessage,
          timestamp: new Date().toISOString(),
          fromMe: true
        };
        this.messages.push(newMsg);
        // 同步更新 localStorage 中当前会话的消息记录
        if (this.selectedChat) {
          setItem(`chat_${this.selectedChat.id}`, this.messages);
        }
        this.newMessage = '';
      }
    }
  }
</script>

<style scoped>
  .chat-view {
    padding: 2rem 0;
    background-color: var(--background-color);
  }

    .chat-view h2 {
      font-size: 1.66rem; /* 增大字体，显得更大气 */
      font-weight: 600; /* 加粗，提升视觉层次 */
      color: var(--text-color); /* 使用深蓝灰文字，与整体一致 */
      margin-bottom: 2rem; /* 增加底部间距，避免局促 */
      padding-left: 1rem; /* 左边距，与下方内容对齐 */
      letter-spacing: 0.5px; /* 轻微字间距，显得精致 */
    }

  .chat-container {
    display: flex;
    gap: 2rem; /* 增大间距 */
  }

  .chat-list-panel {
    width: 25%; /* 调整宽度 */
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); /* 添加阴影 */
  }

  .chat-window-panel {
    width: 75%; /* 调整宽度 */
    border: 1px solid var(--border-color);
    background-color: #f9fafb; /* 柔和背景色 */
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    padding: 1.5rem; /* 增加内边距 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); /* 添加阴影 */
  }

    .chat-window-panel.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-color);
    }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem; /* 添加内边距 */
    display: flex;
    flex-direction: column;
  }

  .message-input {
    display: flex;
    gap: 1rem; /* 调整间距 */
  }

    .message-input input {
      flex: 1;
      padding: 0.75rem; /* 增加内边距 */
      border: 1px solid var(--border-color);
      border-radius: 8px; /* 圆角 */
      font-size: 1rem;
    }

    .message-input button {
      background-color: var(--primary-color);
      color: #fff;
      border: none;
      padding: 0.75rem 1.5rem; /* 增加内边距 */
      border-radius: 8px; /* 圆角 */
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.1s ease;
    }

      .message-input button:hover {
        background-color: var(--primary-hover);
      }

      .message-input button:active {
        transform: scale(0.95); /* 点击动画 */
      }

  /* 消息气泡样式（需在 MessageBubble 组件中实现） */
  .message-bubble {
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    max-width: 70%;
    word-wrap: break-word;
    animation: fadeIn 0.3s ease; /* 淡入动画 */
  }

    .message-bubble.from-me {
      align-self: flex-end;
      background-color: #e6f7ff; /* 发送消息颜色 */
      color: var(--text-color);
    }

    .message-bubble:not(.from-me) {
      align-self: flex-start;
      background-color: #f1f1f1; /* 接收消息颜色 */
      color: var(--text-color);
    }

  /* 动画 */
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

  /* 响应式设计 */
  @media (max-width: 768px) {
    .chat-container {
      flex-direction: column;
    }

    .chat-list-panel,
    .chat-window-panel {
      width: 100%;
    }
  }
</style>
