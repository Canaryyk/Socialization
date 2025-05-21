// server/controllers/userController.js
const User = require('../models/User');
const Post = require('../models/Post'); // 如果需要获取用户的帖子

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

// @desc    更新当前登录用户的信息
// @route   PUT /api/users/me/update
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email; // 邮箱更新可能需要额外验证
      user.bio = req.body.bio || user.bio;
      if (req.body.avatar) { // 如果有头像更新
        user.avatar = req.body.avatar;
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
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        token: jwt.sign({ id: updatedUser._id }, config.JWT_SECRET, { expiresIn: '30d' }), // 可以选择更新 token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update User Profile Error:', error);
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    res.status(500).json({ message: 'Server error while updating profile', error: error.message });
  }
};
