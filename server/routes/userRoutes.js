// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getMe, getUserProfileById, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/me', protect, getMe); // 获取当前登录用户信息，需要认证
router.put('/me/update', protect, updateUserProfile); // 更新当前用户信息
router.get('/:id', getUserProfileById); // 根据ID获取用户信息，公开

module.exports = router;
