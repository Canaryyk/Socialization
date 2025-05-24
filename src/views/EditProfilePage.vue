<template>
  <div class="edit-profile-page">
    <h2>编辑您的个人资料</h2>
    <form @submit.prevent="handleProfileUpdate" v-if="currentUser">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="formData.username" :disabled="isLoading">
      </div>

      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" v-model="formData.email" :disabled="isLoading">
        <small>更改邮箱地址可能需要重新验证（在实际应用中）。</small>
      </div>

      <div class="form-group">
        <label for="bio">个人简介</label>
        <textarea id="bio" v-model="formData.bio" rows="4" :disabled="isLoading"></textarea>
      </div>

      <div class="form-group">
        <label for="avatar">头像 URL</label>
        <input type="text" id="avatar" v-model="formData.avatar" placeholder="例如：http://example.com/avatar.png" :disabled="isLoading">
        <small>当前支持 URL 格式。未来可添加文件上传功能。</small>
      </div>

      <div class="form-group">
        <label for="password">新密码 (可选)</label>
        <input type="password" id="password" v-model="formData.password" placeholder="若不更改密码，请留空" :disabled="isLoading">
      </div>

      <div class="form-group">
        <label for="confirmPassword">确认新密码</label>
        <input type="password" id="confirmPassword" v-model="formData.confirmPassword" placeholder="若更改密码，请再次输入" :disabled="isLoading">
         <small v-if="passwordMismatch" class="error-text">两次输入的密码不一致。</small>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="(isLoading || passwordMismatch) ? true : undefined">
       {{ isLoading ? '正在保存...' : '保存更改' }}
      </button>

      <p v-if="authStore.authStatus.error && !passwordMismatch" class="error-text system-error">{{ authStore.authStatus.error }}</p>
      <p v-if="updateSuccess" class="success-text">个人资料更新成功！</p>
    </form>
    <div v-else class="loading-placeholder">
      <p>正在加载用户数据...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import router from '@/router';

const authStore = useAuthStore();
const currentUser = computed(() => authStore.currentUser);
const isLoading = computed(() => authStore.authStatus.isLoading);

const formData = ref({
  username: '',
  email: '',
  bio: '',
  avatar: '',
  password: '',
  confirmPassword: ''
});

const passwordMismatch = computed(() => {
  return formData.value.password && formData.value.password !== formData.value.confirmPassword;
});

const updateSuccess = ref(false);

// Populate form when currentUser data is available
watch(currentUser, (newUser) => {
  if (newUser) {
    formData.value.username = newUser.username || '';
    formData.value.email = newUser.email || '';
    formData.value.bio = newUser.bio || '';
    formData.value.avatar = newUser.avatar || '';
  }
}, { immediate: true }); // immediate: true to run on mount if currentUser is already there

const handleProfileUpdate = async () => {
  if (passwordMismatch.value) {
    authStore.setStatus(false, "两次输入的密码不一致。");
    return;
  }
  updateSuccess.value = false; // Reset success message
  authStore.setStatus(false, null); // Clear previous errors

  const updateData = {
    username: formData.value.username,
    email: formData.value.email,
    bio: formData.value.bio,
    avatar: formData.value.avatar,
  };

  if (formData.value.password) {
    updateData.password = formData.value.password;
  }

  const success = await authStore.updateUserProfile(updateData);
  if (success) {
    updateSuccess.value = true;
    formData.value.password = ''; // Clear password fields after successful update
    formData.value.confirmPassword = '';
    // Optionally redirect or show a persistent success message
    // router.push(`/user/${currentUser.value.username}`); // Navigate to profile page
    setTimeout(() => updateSuccess.value = false, 3000); // Hide message after 3s
  }
};

</script>

<style scoped>
.edit-profile-page {
  max-width: 650px; /* 稍微调整宽度 */
  margin: 30px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  font-weight: 600;
  color: #333;
}

.form-group {
  margin-bottom: 22px; /* 调整间距 */
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500; /* 调整字重 */
  color: #444;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group textarea {
  width: 100%;
  padding: 12px; /* 增加内边距 */
  border: 1px solid #d1d5db; /* 更柔和的边框颜色 */
  border-radius: 6px; /* 更大的圆角 */
  box-sizing: border-box;
  font-size: 1em;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input[type="text"]:focus,
.form-group input[type="email"]:focus,
.form-group input[type="password"]:focus,
.form-group textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
  outline: none;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px; /* 设置最小高度 */
}

.form-group small {
  display: block;
  margin-top: 6px;
  font-size: 0.9em;
  color: #6b7280; /* 更柔和的提示文字颜色 */
}

.btn-primary {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.05em; /* 调整字体大小 */
  font-weight: 500;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  margin-top: 10px; /* 与上方元素间距 */
}

.btn-primary:hover {
  background-color: #0056b3;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.btn-primary:disabled {
  background-color: #a0aec0; /* 调整禁用时颜色 */
  cursor: not-allowed;
  box-shadow: none;
}

.error-text {
  color: #e53e3e; /* 红色，表示错误 */
  font-size: 0.9em;
  margin-top: 6px;
}

.error-text.system-error {
  margin-top: 15px; /* 与按钮的间距 */
  text-align: center;
}

.success-text {
  color: #38a169; /* 绿色，表示成功 */
  font-size: 1em;
  margin-top: 15px;
  text-align: center;
  font-weight: 500;
}

.loading-placeholder {
  text-align: center;
  padding: 40px 20px;
  font-size: 1.1em;
  color: #777;
}
</style>
