<template>
  <div class="edit-profile-page-wrapper">
    <div class="edit-profile-page">
      <h1 class="page-title">编辑您的个人资料</h1>
      <form @submit.prevent="handleProfileUpdate" v-if="currentUser" class="profile-form">
        <!-- Avatar Upload Section -->
        <div class="form-group avatar-upload-group">
          <label for="avatar-file-input">头像</label>
          <div class="avatar-preview-container">
            <img :src="avatarPreviewUrl || effectiveAvatarSrc" alt="当前头像" class="current-avatar-preview">
            <input type="file" id="avatar-file-input" @change="handleAvatarFileChange" accept="image/*" class="avatar-file-input" ref="avatarFileInput">
            <button type="button" @click="triggerAvatarFileInput" class="btn btn-outline btn-change-avatar" :disabled="isLoading">
              {{ avatarFile ? '更改图片' : '选择图片' }}
            </button>
            <small v-if="avatarFile" class="file-name-display">{{ avatarFile.name }}</small>
          </div>
          <small class="form-text">选择一张新头像 (推荐方形图片, 最大 5MB)。</small>
        </div>

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
          <label for="password">新密码 (可选)</label>
          <input type="password" id="password" v-model="formData.password" placeholder="若不更改密码，请留空" :disabled="isLoading" class="form-control">
        </div>

        <div class="form-group">
          <label for="confirmPassword">确认新密码</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" placeholder="若更改密码，请再次输入" :disabled="isLoading" class="form-control">
          <small v-if="passwordMismatch" class="error-text field-error">两次输入的密码不一致。</small>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="(isLoading || passwordMismatch) ? true : undefined">
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
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import defaultAvatarPath from '/images/default_avatar.jpg'; // 引入默认头像路径
import { useRouter } from 'vue-router'; // Import useRouter

const authStore = useAuthStore();
const router = useRouter(); // Initialize router
const currentUser = computed(() => authStore.currentUser);
const isLoading = computed(() => authStore.authStatus.isLoading);

const formData = ref({
  username: '',
  email: '',
  bio: '',
  password: '',
  confirmPassword: ''
});

const avatarFile = ref(null); // 用于存储用户选择的头像文件
const avatarPreviewUrl = ref(null); // 用于存储头像预览 URL
const avatarFileInput = ref(null); // 引用文件输入元素

const passwordMismatch = computed(() => {
  return formData.value.password && formData.value.password !== formData.value.confirmPassword;
});

const updateSuccess = ref(false);

// 计算当前生效的头像，优先显示用户资料中的头像，其次是默认头像
const effectiveAvatarSrc = computed(() => {
  if (currentUser.value && currentUser.value.avatar && currentUser.value.avatar !== 'default_avatar.png') {
    // 如果 avatar 已经是完整的 URL (例如外部存储)，则直接使用
    if (currentUser.value.avatar.startsWith('http://') || currentUser.value.avatar.startsWith('https://')) {
        return currentUser.value.avatar;
    }
    // 否则，假定是服务器相对路径，需要拼接基础 URL
    // 注意: VITE_API_BASE_URL 通常在 .env 文件中定义
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    return `${baseUrl}/public${currentUser.value.avatar}`; // 例如 http://localhost:5001/public/uploads/avatars/xxxx.jpg
  }
  return defaultAvatarPath; // 默认头像路径
});

watch(currentUser, (newUser) => {
  if (newUser) {
    formData.value.username = newUser.username || '';
    formData.value.email = newUser.email || '';
    formData.value.bio = newUser.bio || '';
    formData.value.password = '';
    formData.value.confirmPassword = '';
    avatarFile.value = null; // 重置文件选择
    avatarPreviewUrl.value = null; // 重置预览
  }
}, { immediate: true });

const triggerAvatarFileInput = () => {
  if (avatarFileInput.value) {
    avatarFileInput.value.click();
  }
};

const handleAvatarFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("文件过大！请选择小于 5MB 的图片。");
        event.target.value = null; // 清除选择
        return;
    }
    if (!file.type.startsWith('image/')) {
        alert("文件类型错误！请选择图片文件。");
        event.target.value = null; // 清除选择
        return;
    }
    avatarFile.value = file;
    // 创建预览 URL
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreviewUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    avatarFile.value = null;
    avatarPreviewUrl.value = null;
  }
};

const handleProfileUpdate = async () => {
  if (passwordMismatch.value) {
    return;
  }
  updateSuccess.value = false;
  authStore.setStatus(false, null); // 清除旧的错误信息

  // 使用 FormData 来包装数据，因为包含了文件
  const profileData = new FormData();
  profileData.append('username', formData.value.username);
  profileData.append('email', formData.value.email);
  profileData.append('bio', formData.value.bio);

  if (formData.value.password) {
    profileData.append('password', formData.value.password);
  }

  if (avatarFile.value) {
    profileData.append('avatar', avatarFile.value); // 'avatar' 必须与后端 multer.single('avatar') 的字段名一致
  } else if (currentUser.value && currentUser.value.avatar && formData.value.avatar === '') {
    // 如果用户希望移除头像（通过某种方式，例如一个checkbox，这里简化处理）
    // 并且当前头像不是默认头像，可以发送一个特殊标记或空值让后端处理
    // 当前后端逻辑是，如果不传 avatar 文件，则不更新头像。
    // 如果要支持移除头像并恢复默认，后端需要相应逻辑。
    // 另一种处理方式是，如果 avatarFile.value 为 null 且用户没有更改其他只包含头像的字段，则不提交 avatar 字段。
    // 这里我们假设，如果不选择新文件，就不在 FormData 中添加 avatar 字段，后端将保持原有头像。
  }

  // 注意：旧的 formData.avatar (URL) 不再直接发送。
  // 如果用户没有选择新文件，并且希望保留旧头像（如果旧头像是URL格式），
  // 并且后端支持混合URL和文件上传的逻辑，则可能需要将 currentUser.value.avatar 添加到 FormData。
  // 但当前实现是，如果选择了新文件，则上传文件；否则，后端不更新头像字段（除非后端有特殊逻辑处理空 avatar 字段）。

  const oldUsername = currentUser.value?.username; // Store old username before update

  const success = await authStore.updateUserProfile(profileData); // 传递 FormData
  if (success) {
    updateSuccess.value = true;
    formData.value.password = '';
    formData.value.confirmPassword = '';
    // 上传成功后，currentUser 会被 authStore 更新，effectiveAvatarSrc 会自动变化
    // 无需手动重置 avatarFile 和 avatarPreviewUrl，因为 watch(currentUser) 会处理
    // 但如果希望立即清除预览和文件选择状态，可以取消注释下面两行：
    // avatarFile.value = null;
    // avatarPreviewUrl.value = null;
    if (avatarFileInput.value) avatarFileInput.value.value = null; // 清除文件输入框状态

    const newUsername = authStore.currentUser?.username; // Get new username from store

    // If username changed, navigate to the new profile URL to avoid 404 on refresh or back navigation.
    // Also, this helps if the current URL is /settings/profile and we want to redirect to the user page.
    if (newUsername) { // Check if newUsername is available
        if (oldUsername && newUsername !== oldUsername) {
            router.push(`/user/${newUsername}`).then(() => {
                // Optional: Show success message after navigation if preferred
                // updateSuccess.value = true; // (Re-enable if moved here)
                setTimeout(() => updateSuccess.value = false, 3000);
            });
        } else {
            // Username didn't change, or no old username to compare (e.g. first time)
            // Still show success for a bit.
            setTimeout(() => updateSuccess.value = false, 3000);
        }
    } else {
        // Fallback if new username is somehow not available, though unlikely if update was successful.
        setTimeout(() => updateSuccess.value = false, 3000);
    }

  } else {
    // Handle update failure (error message is already set by authStore)
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

.avatar-upload-group {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 从 label 到 avatar-preview-container 的间距 */
}

.avatar-preview-container {
  display: flex;
  align-items: center;
  gap: 16px; /* 元素之间的间距 */
  position: relative; /* For absolute positioning of file input if needed */
}

.current-avatar-preview {
  width: 80px; /* 预览图尺寸 */
  height: 80px;
  border-radius: 50%; /* 圆形预览 */
  object-fit: cover;
  border: 2px solid var(--border-color, #d1d5db);
  background-color: var(--background-color, #f8fafc); /* 预览背景色 */
}

.avatar-file-input {
  /* 将原生 input 隐藏，通过按钮触发 */
  display: none;
}

.btn-change-avatar {
  /* 样式化按钮 */
  padding: 8px 16px;
  font-size: 14px;
  /* min-height: auto; */ /* 如果继承了全局btn样式，可能需要调整 */
}

.btn-outline { /* 简单描边按钮样式示例 */
  background-color: transparent;
  border: 1px solid var(--primary-color, #3b82f6);
  color: var(--primary-color, #3b82f6);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--primary-color-soft, #e0e7ff); /* 一个更柔和的hover背景 */
  color: var(--primary-hover, #2563eb);
}
.btn-outline:disabled {
    border-color: var(--border-color, #d1d5db);
    color: var(--text-secondary, #6b7280);
    cursor: not-allowed;
}

.file-name-display {
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
  margin-left: 8px; /* 与按钮的间距 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px; /* 限制文件名显示宽度 */
}

/* 对于 field-error 和 system-error，确保它们在新的布局下仍然可见且位置合适 */
.error-text.field-error {
  margin-top: 4px; /* 保持与输入框的间距 */
}

.error-text.system-error {
  margin-top: 16px; /* 与表单操作按钮的间距 */
}

.success-text {
  margin-top: 16px; /* 与表单操作按钮的间距 */
}

/* 可能需要调整 form-group 的底部边距，如果新头像组与下方元素太近 */
.form-group {
    margin-bottom: 20px; /* 确保原有间距 */
}

.avatar-upload-group + .form-group {
    margin-top: 20px; /* 确保头像组和下方普通组有足够间距 */
}
</style>
