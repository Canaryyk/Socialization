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
        <label for="image">上传图片</label>
        <div class="file-input-wrapper">
          <input type="file" id="image" @change="handleImageUpload" accept="image/*" />
          <span class="file-input-label">选择图片</span>
        </div>
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="预览" />
        </div>
      </div>
      <button type="submit" class="submit-button">发布</button>
    </form>
  </div>
</template>

<script>
  import { getItem, setItem } from '@/utils/localStorage';

  export default {
    name: 'PostView',
    data() {
      return {
        title: '', // 新增标题字段
        content: '',
        imageFile: null,
        imagePreview: ''
      };
    },
    methods: {
      handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
          this.imageFile = file;
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagePreview = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      },
      submitPost() {
        const newPost = {
          id: Date.now(),
          author: {
            id: 10086, // 示例用户，可替换为实际登录用户数据
            name: '当前用户',
            avatar: '/images/avatar3.jpg'
          },
          title: this.title, // 添加标题
          content: this.content,
          image: this.imagePreview || '', // 如果没有图片则为空字符串
          timestamp: new Date().toISOString()
        };

        const posts = getItem('posts') || [];
        posts.unshift(newPost);
        setItem('posts', posts);

        alert('动态发布成功！');
        this.title = '';
        this.content = '';
        this.imageFile = null;
        this.imagePreview = '';
        this.$router.push('/');
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

  .image-preview {
    margin-top: 1rem;
  }

    .image-preview img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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

  @media (max-width: 768px) {
    .post-form {
      padding: 1.5rem;
    }

    textarea {
      height: 120px;
    }
  }
</style>
