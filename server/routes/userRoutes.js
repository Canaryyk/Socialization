// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getMe, getUserProfileById, updateUserProfile, getUserProfileByUsername } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// 创建上传目录（如果不存在）
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    try {
      if (!req.user || !req.user._id) {
        // 如果用户未认证或ID缺失，则回调错误
        return cb(new Error('User authentication issue for filename generation.'));
      }
      const userIdString = String(req.user._id);
      const uniqueSuffix = userIdString + '-' + Date.now();
      const finalFilename = uniqueSuffix + path.extname(file.originalname);
      cb(null, finalFilename);
    } catch (error) {
      cb(error); // 将错误传递给 multer
    }
  }
});

const fileFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 限制文件大小为 5MB
  fileFilter: fileFilter
});

router.get('/me', protect, getMe); // 获取当前登录用户信息，需要认证

// 应用 multer 中间件到更新用户信息的路由，'avatar' 是前端 FormData 中的字段名
router.put('/me/update', protect, upload.single('avatar'), updateUserProfile); // 更新当前用户信息

router.get('/username/:username', getUserProfileByUsername); // 根据用户名获取用户信息，公开
router.get('/:id', getUserProfileById); // 根据ID获取用户信息，公开

module.exports = router;
