// server/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  addCommentToPost,
  deleteCommentFromPost,
  // updatePost, (未来可以添加)
  // deletePost, (未来可以添加)
} = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware'); // 引入认证中间件

// 创建帖子图片上传目录
// const postUploadDir = path.join(__dirname, '..', 'public', 'uploads', 'posts'); // 旧路径
const postUploadDir = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'posts'); // 新路径，指向根 public/uploads/posts
if (!fs.existsSync(postUploadDir)) {
  fs.mkdirSync(postUploadDir, { recursive: true });
}

// Multer 配置 - 帖子图片
const postStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, postUploadDir);
  },
  filename: function (req, file, cb) {
    try {
      if (!req.user || !req.user._id) {
        return cb(new Error('User authentication issue for post image filename generation.'));
      }
      const userIdString = String(req.user._id);
      const uniqueSuffix = userIdString + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9); // 增加随机数以防万一同名
      const finalFilename = uniqueSuffix + path.extname(file.originalname);
      cb(null, finalFilename);
    } catch (error) {
      cb(error);
    }
  }
});

const postFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const uploadPostImages = multer({
  storage: postStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 限制每个文件大小为 5MB
  fileFilter: postFileFilter
});

router.route('/')
  .post(protect, uploadPostImages.array('images', 5), createPost) // 创建帖子需要认证，并处理最多5张图片上传
  .get(getAllPosts);         // 获取所有帖子是公开的

router.route('/:id')
  .get(getPostById);
// .put(protect, updatePost)   // 更新帖子需要认证 (未来)
// .delete(protect, deletePost); // 删除帖子需要认证 (未来)

router.route('/user/:userId').get(getPostsByUser); // 获取特定用户的所有帖子

// Comment routes
router.route('/:id/comments') // Changed from /comment to /comments
  .post(protect, addCommentToPost);

router.route('/:postId/comments/:commentId')
  .delete(protect, deleteCommentFromPost);

module.exports = router;
