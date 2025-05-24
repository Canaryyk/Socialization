<script setup>
  import { ref } from 'vue';
  import { useAuthStore } from '@/stores/authStore';
  import { useRouter } from 'vue-router'; // 如果注册后不通过 store 跳转

  const authStore = useAuthStore();
  const router = useRouter(); // 如果需要手动跳转

  const username = ref('');
  const email = ref('');
  const password = ref('');
  const confirmPassword = ref(''); // 可选的确认密码字段

  const handleSubmit = async () => {
    if (password.value !== confirmPassword.value && confirmPassword.value) {
      authStore.setStatus(false, 'Passwords do not match'); // 通过 store 设置错误
      return;
    }
    const success = await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });
    // store 中的 action 会处理跳转，如果失败，错误信息会存在 store.status.error
    // if (success) {
    //   // router.push('/'); // 或者在这里跳转
    // }
  };
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">创建账号</h2>
      <p class="register-subtitle">加入趣动社区，开启你的社交之旅</p>

      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="请输入用户名"
            class="form-input"
          />
        </div>

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

        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            placeholder="请再次输入密码"
            class="form-input"
          />
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="authStore.status.isLoading"
        >
          <span v-if="authStore.status.isLoading" class="loading-spinner"></span>
          <span v-else>注册</span>
        </button>

        <p v-if="authStore.status.error" class="error-message">
          {{ authStore.status.error }}
        </p>
      </form>

      <div class="register-footer">
        <p>已有账号？ <router-link to="/login" class="login-link">立即登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 2rem;
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.5s ease;
}

.register-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-color, #1e293b);
  margin-bottom: 0.5rem;
  text-align: center;
}

.register-subtitle {
  color: var(--secondary-color, #64748b);
  text-align: center;
  margin-bottom: 2rem;
}

.register-form {
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

.register-footer {
  margin-top: 2rem;
  text-align: center;
  color: var(--secondary-color, #64748b);
}

.login-link {
  color: var(--primary-color, #f7937c);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-link:hover {
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
