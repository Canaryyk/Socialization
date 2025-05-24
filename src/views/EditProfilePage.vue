<template>
  <div class="edit-profile-page-wrapper">
    <div class="edit-profile-page">
      <h1 class="page-title">编辑您的个人资料</h1>
      <form @submit.prevent="handleProfileUpdate" v-if="currentUser" class="profile-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="formData.username" :disabled="isLoading" class="form-control">
        </div>

        <div class="form-group">
          <label for="email">邮箱</label>
          <input type="email" id="email" v-model="formData.email" :disabled="isLoading" class="form-control">
          <small class="form-text">更改邮箱地址可能需要重新验证（在实际应用中）。</small>
        </div>

        <div class="form-group">
          <label for="bio">个人简介</label>
          <textarea id="bio" v-model="formData.bio" rows="4" :disabled="isLoading" class="form-control"></textarea>
        </div>

        <div class="form-group">
          <label for="avatar">头像 URL</label>
          <input type="text" id="avatar" v-model="formData.avatar" placeholder="例如：http://example.com/avatar.png" :disabled="isLoading" class="form-control">
          <small class="form-text">当前支持 URL 格式。未来可添加文件上传功能。</small>
        </div>

        <div class="form-group">
          <label for="password">新密码 (可选)</label>
          <input type="password" id="password" v-model="formData.password" placeholder="若不更改密码，请留空" :disabled="isLoading" class="form-control">
        </div>

        <div class="form-group">
          <label for="confirmPassword">确认新密码</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" placeholder="若更改密码，请再次输入" :disabled="isLoading" class="form-control">
          <small v-if="passwordMismatch" class="error-text field-error">两次输入的密码不一致。</small>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isLoading || passwordMismatch">
            <span v-if="isLoading">
              <span class="spinner-sm"></span> 正在保存...
            </span>
            <span v-else>保存更改</span>
          </button>
        </div>

        <p v-if="authStore.authStatus.error && !passwordMismatch" class="error-text system-error">{{ authStore.authStatus.error }}</p>
        <p v-if="updateSuccess" class="success-text">个人资料更新成功！</p>
      </form>
      <div v-else class="loading-placeholder">
        <!-- Using similar loading state structure -->
        <div class="loading-spinner"></div>
        <p>正在加载用户数据...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
// import router from '@/router'; // router not used in provided script, but good to keep if needed

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

watch(currentUser, (newUser) => {
  if (newUser) {
    formData.value.username = newUser.username || '';
    formData.value.email = newUser.email || '';
    formData.value.bio = newUser.bio || '';
    formData.value.avatar = newUser.avatar || '';
    // Ensure password fields are not pre-filled from user data for security
    formData.value.password = '';
    formData.value.confirmPassword = '';
  }
}, { immediate: true });

const handleProfileUpdate = async () => {
  if (passwordMismatch.value) {
    // No need to call authStore.setStatus if the error is shown via computed property
    // authStore.setStatus(false, "两次输入的密码不一致。");
    return;
  }
  updateSuccess.value = false;
  authStore.setStatus(false, null);

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
    formData.value.password = '';
    formData.value.confirmPassword = '';
    setTimeout(() => updateSuccess.value = false, 3000);
  }
};

</script>

<style scoped>
/* Mimic CSS Variables from the reference style if they are not global */
/* :root {
  --card-background: #ffffff;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --text-color: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #d1d5db;
  --background-color: #f8fafc;
  --danger-color: #ef4444;
  --success-color: #10b981;
} */

.edit-profile-page-wrapper {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--background-color, #f8fafc); /* Page background */
  padding: 20px 0; /* Add some padding if the form is the only content on the page */
  min-height: calc(100vh - 40px); /* Example to fill screen height */
}

.edit-profile-page {
  max-width: 700px; /* Slightly wider to accommodate form comfortably */
  margin: 0 auto;
  padding: 24px 32px 32px; /* More padding at bottom */
  background-color: var(--card-background, #ffffff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  margin-bottom: 28px;
  line-height: 1.2;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Space between form groups */
}

.form-group {
  /* No margin-bottom needed if using gap on parent */
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500; /* Slightly less than 600 for a bit softer label */
  font-size: 14px;
  color: var(--text-color, #1f2937);
}

.form-control {
  width: 100%;
  padding: 10px 14px; /* Adjusted padding for comfortable height */
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px; /* Consistent with buttons */
  box-sizing: border-box;
  font-size: 15px; /* Slightly larger input text */
  color: var(--text-color, #1f2937);
  background-color: var(--card-background, #ffffff); /* Or var(--background-color, #f3f4f6) for a slight contrast */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  line-height: 1.5;
}

.form-control:focus {
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); /* Softer focus ring */
  outline: none;
}

.form-control:disabled {
  background-color: var(--background-color, #f8fafc);
  color: var(--text-secondary, #6b7280);
  cursor: not-allowed;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.form-text {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
  line-height: 1.4;
}

.form-actions {
  margin-top: 12px; /* Add some space above the button */
  display: flex;
  justify-content: flex-end; /* Align button to the right */
}

.btn {
  min-height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-primary {
  background-color: var(--primary-color, #3b82f6);
  border-color: var(--primary-color, #3b82f6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover, #2563eb);
  border-color: var(--primary-hover, #2563eb);
}

.btn:disabled {
  background-color: #a0aec0; /* More standard disabled color */
  border-color: #a0aec0;
  color: #e2e8f0;
  cursor: not-allowed;
  opacity: 0.7;
}

.spinner-sm {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  margin-right: 8px;
  vertical-align: -0.125em; /* Align better with text */
}

.error-text {
  color: var(--danger-color, #ef4444); /* Consistent error color */
  font-size: 14px;
  line-height: 1.4;
}
.error-text.field-error {
  margin-top: 6px; /* Spacing for field specific errors */
}
.error-text.system-error {
  margin-top: 16px; /* Spacing for form-level errors */
  text-align: center; /* Center if it's a general message */
}

.success-text {
  color: var(--success-color, #10b981); /* Consistent success color */
  font-size: 14px;
  margin-top: 16px;
  text-align: center;
  font-weight: 500;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px; /* Adjusted height for form context */
  gap: 16px; /* Spacing from reference style */
  font-family: inherit;
}

.loading-placeholder p {
  color: var(--text-secondary, #6b7280);
  font-size: 16px;
  margin: 0;
}

.loading-spinner { /* Copied from reference */
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color, #e5e7eb);
  border-top: 3px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .edit-profile-page-wrapper {
    padding: 0;
  }
  .edit-profile-page {
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    padding: 20px 16px 24px;
  }
  .page-title {
    font-size: 22px;
    margin-bottom: 24px;
  }
  .profile-form {
    gap: 18px;
  }
  .form-actions {
    justify-content: stretch; /* Make button full-width on mobile */
  }
  .btn {
    width: 100%; /* Full width button on smaller screens */
  }
}
</style>