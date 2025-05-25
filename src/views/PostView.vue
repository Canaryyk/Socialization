<template>
  <div class="post-view container">
    <h2>发布动态</h2>
    <form @submit.prevent="submitPost" class="post-form">
      <div class="form-group">
        <label for="title">标题</label>
        <input type="text"
               id="title"
               v-model="title"
               placeholder="请输入动态标题..."
               required />
      </div>
      <div class="form-group">
        <label for="content">内容</label>
        <textarea id="content"
                  v-model="content"
                  placeholder="分享你的运动动态..."
                  required></textarea>
      </div>
      <div class="form-group">
        <label for="images">上传图片 (已选 {{ imageFiles.length }} / 最多 {{ MAX_IMAGES }} 张)</label>
        <div class="file-input-wrapper">
          <!-- 只有当还可以选择更多图片时，才显示选择按钮 -->
          <template v-if="canSelectMoreImages">
            <input type="file" id="images" @change="handleImageUpload" accept="image/*" ref="imageInput" multiple />
            <span class="file-input-label">选择图片</span>
          </template>
          <span v-else class="file-input-label-disabled">已达图片数量上限</span>
        </div>
        <div v-if="imagePreviews.length > 0" class="image-preview-container">
          <div v-for="(preview, index) in imagePreviews" :key="index" class="image-preview-item">
            <img :src="preview" alt="图片预览" />
            <button type="button" @click="removeImage(index)" class="remove-image-button" title="移除图片">×</button>
          </div>
        </div>
      </div>
      <button type="submit" class="submit-button">发布</button>
    </form>
  </div>
</template>

<script>
// import { getItem, setItem } from '@/utils/localStorage'; // 将不再使用 localStorage 存储帖子
import api from '@/services/api'; // 导入 API 服务

const MAX_IMAGES = 5; // 定义最大图片数量常量

export default {
  name: 'PostView',
  data() {
    return {
      title: '',
      content: '',
      imageFiles: [],
      imagePreviews: [],
      MAX_IMAGES: MAX_IMAGES // 在 data 中也暴露一下，方便模板中使用（如果需要）
    };
  },
  computed: {
    canSelectMoreImages() {
      return this.imageFiles.length < MAX_IMAGES;
    }
  },
  methods: {
    handleImageUpload(event) {
      const newFiles = event.target.files;

      if (!newFiles || newFiles.length === 0) {
        return;
      }

      const currentImageCount = this.imageFiles.length;
      const remainingSlots = MAX_IMAGES - currentImageCount;

      if (remainingSlots <= 0) {
        alert(`您最多只能上传 ${MAX_IMAGES} 张图片，已达到上限。`);
        // 清空文件选择，以便用户可以重新选择（如果他们想替换）
        if (this.$refs.imageInput) {
          this.$refs.imageInput.value = null;
        }
        return;
      }

      const filesToAdd = Array.from(newFiles).slice(0, remainingSlots);

      if (newFiles.length > remainingSlots) {
        alert(`您选择了 ${newFiles.length} 张图片，但只能再添加 ${remainingSlots} 张。只会处理前 ${remainingSlots} 张。`);
      }

      filesToAdd.forEach(file => {
        // 简单的重复文件检查（基于文件名和大小），可选
        // if (this.imageFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
        //   console.warn(`文件 ${file.name} 已存在，跳过。`);
        //   return;
        // }

        this.imageFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });

      // 关键：重置 input 的 value，这样如果用户再次选择相同的文件，change 事件仍会触发
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = null;
      }
    },

    removeImage(index) {
      this.imageFiles.splice(index, 1);
      this.imagePreviews.splice(index, 1);
      // 如果移除了图片后，文件输入框又可以用了，确保它不是禁用状态
      // （如果之前因为达到上限而禁用了它，这里逻辑上需要重新启用，不过当前设计中没有禁用它）
    },

    async submitPost() {
      if (!this.title || !this.content) {
        alert('标题和内容不能为空！');
        return;
      }

      if (this.imageFiles.length === 0 && !confirm("您没有选择任何图片，确定要发布吗？")) {
        return;
      }

      const formData = new FormData();
      formData.append('title', this.title);
      formData.append('content', this.content);

      if (this.imageFiles.length > 0) {
        this.imageFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      try {
        const response = await api.createPost(formData);
        alert('动态发布成功！');
        console.log('Post created:', response.data);
        this.title = '';
        this.content = '';
        this.imageFiles = [];
        this.imagePreviews = [];
        // submitPost 后不需要手动清空 this.$refs.imageInput.value，因为它在 handleImageUpload 已经做了
        this.$router.push('/');
      } catch (error) {
        console.error('发布动态失败:', error.response ? error.response.data : error.message);
        alert(`发布失败: ${error.response ? error.response.data.message : error.message}`);
      }
    }
  }
};
</script>

<style scoped>
  .post-view {
    padding: 3rem 0;
    background-color: var(--background-color);
  }

    .post-view h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 2rem;
      padding-left: 1rem;
      letter-spacing: 0.5px;
    }

  .post-form {
    background-color: #fff;
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    animation: fadeIn 0.5s ease;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-color);
  }

  input[type="text"],
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  input[type="text"] {
    height: 40px; /* 标题输入框高度 */
  }

  textarea {
    height: 150px;
  }

    input[type="text"]:focus,
    textarea:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(247, 147, 124, 0.2);
      outline: none;
    }

  .file-input-wrapper {
    position: relative;
    display: inline-block;
  }

  input[type="file"] {
    opacity: 0;
    width: 100%;
    height: 40px;
    position: absolute;
    top: 0;
    left: 0;
    cursor: pointer;
  }

  .file-input-label {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: var(--secondary-color);
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

    .file-input-label:hover {
      background-color: var(--primary-hover);
    }

  .image-preview-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 1rem;
  }

  .image-preview-item {
    flex: 1 1 calc(20% - 10px);
    max-width: calc(20% - 10px);
    box-sizing: border-box;
  }

  .image-preview-item img {
    width: 100%;
    height: auto;
    max-height: 150px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .post-form {
      padding: 1.5rem;
    }

    textarea {
      height: 120px;
    }

    .image-preview-item {
      flex: 1 1 calc(33.333% - 10px);
      max-width: calc(33.333% - 10px);
    }
  }

  @media (max-width: 480px) {
    .image-preview-item {
      flex: 1 1 calc(50% - 10px);
      max-width: calc(50% - 10px);
    }
  }

  .submit-button {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

    .submit-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .submit-button:active {
      transform: scale(0.95);
    }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
