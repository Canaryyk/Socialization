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
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    根据用户ID获取公开的用户信息
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // 不返回密码
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
      return res.status(404).json({ message: 'User not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    根据用户名获取公开的用户信息
// @route   GET /api/users/username/:username
// @access  Public
exports.getUserProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    res.status(500).json({ message: 'Server error' });
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
            const oldAvatarPath = path.join(__dirname, '..', 'public', user.avatar); // 假设 avatar 存储的是相对路径如 /uploads/avatars/filename.jpg
             try {
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
             } catch (err) {
                console.error("Error deleting old avatar:", err);
                // 不阻断流程，但记录错误
             }
        }
        // 将头像路径保存到数据库，相对于 public 目录
        user.avatar = `/uploads/avatars/${req.file.filename}`;
      } else if (req.body.avatar === '' && user.avatar !== 'default_avatar.png') {
        // 如果前端发送了空字符串表示移除头像，并且当前头像不是默认头像
        // (可选：如果希望支持通过清空avatar字段来恢复默认头像或移除)
        // 这里我们假设如果 req.body.avatar 为空，且之前有自定义头像，则不做更改。
        // 或者，如果业务逻辑是清空 avatar 字段就恢复默认，可以如下设置：
        // if (user.avatar && user.avatar !== 'default_avatar.png' && !user.avatar.startsWith('http')) {
        //   const oldAvatarPath = path.join(__dirname, '..', 'public', user.avatar);
        //   try { if (fs.existsSync(oldAvatarPath)) fs.unlinkSync(oldAvatarPath); } catch (e) { console.error(e); }
        // }
        // user.avatar = 'default_avatar.png'; // 恢复为默认头像
      }


      // 如果提供了新密码
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters long' });
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
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update User Profile Error:', error);
    // Multer 错误处理 (例如文件过大或类型不匹配)
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Max 5MB allowed.' });
    }
    if (error.message === 'Not an image! Please upload only images.') {
        return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    res.status(500).json({ message: 'Server error while updating profile', error: error.message });
  }
};

// (未来可以添加的功能)
// @desc    更改用户头像 (处理文件上传)
// @route   PUT /api/users/me/avatar
// @access  Private
// exports.updateUserAvatar = async (req, res) => { ... };

// @desc    更改用户密码
// @route   PUT /api/users/me/password
// @access  Private
// exports.updateUserPassword = async (req, res) => { ... };
