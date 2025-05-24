// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getMe, getUserProfileById, updateUserProfile, getUserProfileByUsername } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/me', protect, getMe); // 获取当前登录用户信息，需要认证
router.put('/me/update', protect, updateUserProfile); // 更新当前用户信息

router.get('/username/:username', getUserProfileByUsername); // 根据用户名获取用户信息，公开
router.get('/:id', getUserProfileById); // 根据ID获取用户信息，公开 (这个应该放在更具体的路由之后，避免参数冲突)

module.exports = router;
