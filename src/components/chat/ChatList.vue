<template>
  <div class="chat-list">
    <div v-for="chat in chats" :key="chat.id" class="chat-item" @click="$emit('select', chat)">
      <img :src="chat.avatar" alt="chat avatar" class="avatar" />
      <div class="chat-info">
        <h4>{{ chat.name }}</h4>
        <p>{{ chat.lastMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ChatList',
    props: {
      chats: {
        type: Array,
        default: () => []
      }
    }
  }
</script>

<style scoped>
  .chat-list {
    border: 1px solid var(--border-color);
    border-radius: 12px; /* Softer corners */
    background-color: #fff;
    overflow-y: auto;
    max-height: 500px; /* Slightly taller for better content fit */
    padding: 0.5rem; /* Inner padding for the list */
  }

    /* Custom scrollbar styling */
    .chat-list::-webkit-scrollbar {
      width: 8px;
    }

    .chat-list::-webkit-scrollbar-thumb {
      background-color: var(--secondary-color);
      border-radius: 4px;
    }

  .chat-item {
    display: flex;
    align-items: center;
    padding: 1rem; /* More padding for comfort */
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease; /* Smooth transitions */
  }

    .chat-item:last-child {
      border-bottom: none;
    }

    .chat-item:hover {
      background-color: #f9f9f9; /* Light background on hover */
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Subtle shadow */
    }

    .chat-item:active {
      transform: scale(0.98); /* Slight scale-down on click */
    }

  .avatar {
    width: 50px; /* Larger avatar */
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 1rem; /* Increased spacing */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  }

  .chat-info {
    flex: 1; /* Fill remaining space */
  }

    .chat-info h4 {
      margin: 0;
      font-size: 1.1rem; /* Larger, more prominent */
      font-weight: 500; /* Medium weight */
      color: var(--text-color); /* Primary text color */
      line-height: 1.4; /* Comfortable line height */
    }

    .chat-info p {
      margin: 0.25rem 0 0; /* Spacing above message */
      font-size: 0.9rem; /* Slightly smaller */
      color: var(--secondary-color); /* Secondary text color */
      line-height: 1.4;
      white-space: nowrap; /* Prevent wrapping */
      overflow: hidden;
      text-overflow: ellipsis; /* Ellipsis for overflow */
    }

  /* Fade-in animation for new items */
  .chat-item {
    animation: fadeIn 0.5s ease forwards;
  }

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
