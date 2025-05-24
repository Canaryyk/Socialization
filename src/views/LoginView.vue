<script setup>
  import { ref } from 'vue';
  import { useAuthStore } from '@/stores/authStore';
  // import { useRouter } from 'vue-router'; // 如果需要手动跳转

  const authStore = useAuthStore();
  // const router = useRouter();

  const email = ref('');
  const password = ref('');

  const handleSubmit = async () => {
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    // store 中的 action 会处理跳转
  };
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">欢迎回来</h2>
      <p class="login-subtitle">请登录您的账号</p>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="请输入邮箱"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="请输入密码"
            class="form-input"
          />
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="authStore.status.isLoading"
        >
          <span v-if="authStore.status.isLoading" class="loading-spinner"></span>
          <span v-else>登录</span>
        </button>

        <p v-if="authStore.status.error" class="error-message">
          {{ authStore.status.error }}
        </p>
      </form>

      <div class="login-footer">
        <p>还没有账号？ <router-link to="/register" class="register-link">立即注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.5s ease;
}

.login-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-color, #1e293b);
  margin-bottom: 0.5rem;
  text-align: center;
}

.login-subtitle {
  color: var(--secondary-color, #64748b);
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color, #1e293b);
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #f7937c);
  background: white;
  box-shadow: 0 0 0 3px rgba(247, 147, 124, 0.1);
}

.submit-button {
  background: var(--primary-color, #f7937c);
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: var(--primary-hover, #f25933);
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 1rem;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  color: var(--secondary-color, #64748b);
}

.register-link {
  color: var(--primary-color, #f7937c);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: var(--primary-hover, #f25933);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
