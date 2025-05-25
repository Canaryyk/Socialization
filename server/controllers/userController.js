// server/controllers/userController.js
const User = require('../models/User');
// const Post = require('../models/Post'); // 如果需要获取用户的帖子 - 暂时注释掉，因为未使用
const jwt = require('jsonwebtoken'); // 确保 jwt 被导入，因为 updateUserProfile 会生成新 token
const config = require('../config'); // 确保 config 被导入
const fs = require('fs'); // 用于删除旧头像
const path = require('path'); // 用于构建文件路径

// @desc    获取当前登录用户的信息
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // req.user 由 authMiddleware 设置
    const user = await User.findById(req.user._id).select('-password'); // 不返回密码
    if (!user) {
      return res.status(404).json({ message: '用户未找到' }); // Changed
    }
    res.json(user);
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: '服务器错误，获取用户信息失败' }); // Changed
  }
};

// @desc    根据用户ID获取公开的用户信息
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // 不返回密码
    if (!user) {
      return res.status(404).json({ message: '用户未找到' }); // Changed
    }
    // 未来可以考虑同时返回该用户的一些帖子等信息
    // const userPosts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);
    res.json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt
      // posts: userPosts // 如果需要
    });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: '用户未找到 (ID 格式无效)' }); // Changed
    }
    res.status(500).json({ message: '服务器错误，获取用户资料失败' }); // Changed
  }
};

// @desc    根据用户名获取公开的用户信息
// @route   GET /api/users/username/:username
// @access  Public
exports.getUserProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户未找到' }); // Changed
    }
    res.json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get User Profile by Username Error:', error);
    res.status(500).json({ message: '服务器错误，获取用户资料失败' }); // Changed
  }
};

// @desc    更新当前登录用户的信息
// @route   PUT /api/users/me/update
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // 处理基本信息更新
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email; // 邮箱更新可能需要额外验证

      if (req.body.bio !== undefined) {
        user.bio = req.body.bio;
      }

      // 处理头像更新
      if (req.file) {
        // 如果有旧头像且不是默认头像，则删除旧头像
        if (user.avatar && user.avatar !== 'default_avatar.png' && !user.avatar.startsWith('http')) {
            const oldAvatarPath = path.resolve(__dirname, '..', '..', 'public', user.avatar.startsWith('/') ? user.avatar.substring(1) : user.avatar);
             try {
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
             } catch (err) {
                console.error("删除旧头像时出错:", err); // Changed
                // 不阻断流程，但记录错误
             }
        }
        // 将头像路径保存到数据库，相对于 public 目录
        user.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      // 如果提供了新密码
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({ message: '密码长度至少为6位' }); // Changed
        }
        user.password = req.body.password; // pre-save hook 会处理哈希
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar, // 返回新的头像路径
        bio: updatedUser.bio,
        token: jwt.sign({ id: updatedUser._id }, config.JWT_SECRET, { expiresIn: '30d' }),
      });
    } else {
      res.status(404).json({ message: '用户未找到' }); // Changed
    }
  } catch (error) {
    console.error('Update User Profile Error:', error);
    // Multer 错误处理 (例如文件过大或类型不匹配)
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '文件过大，最大允许5MB' }); // Changed
    }
    if (error.message === 'Not an image! Please upload only images.') { // 这个错误信息来源于你的 multer 配置，如果想改，需要在 multer 配置中改
        return res.status(400).json({ message: '不是图片！请仅上传图片文件' }); // Changed
    }
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ message: '邮箱或用户名已存在' }); // Changed
    }
    res.status(500).json({ message: '服务器错误，更新用户资料失败', error: error.message }); // Changed
  }
};
