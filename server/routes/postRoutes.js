// server/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  // updatePost, (未来可以添加)
  // deletePost, (未来可以添加)
} = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware'); // 引入认证中间件

router.route('/')
  .post(protect, createPost) // 创建帖子需要认证
  .get(getAllPosts);         // 获取所有帖子是公开的

router.route('/:id')
  .get(getPostById);
// .put(protect, updatePost)   // 更新帖子需要认证 (未来)
// .delete(protect, deletePost); // 删除帖子需要认证 (未来)

router.route('/user/:userId').get(getPostsByUser); // 获取特定用户的所有帖子

module.exports = router;
