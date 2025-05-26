// server/controllers/userController.js
const User = require('../models/User');
const Post = require('../models/Post'); // 取消注释并导入 Post 模型
const jwt = require('jsonwebtoken'); // 确保 jwt 被导入，因为 updateUserProfile 会生成新 token
const config = require('../config'); // 确保 config 被导入
const fs = require('fs'); // 用于删除旧头像
const path = require('path'); // 用于构建文件路径
const mongoose = require('mongoose'); // Mongoose import at the top

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

    // 计算 postsCount
    const postsCount = await Post.countDocuments({ user: user._id });

    // 计算 likesCount (用户获得的总点赞数)
    // 找到该用户的所有帖子
    const userPosts = await Post.find({ user: user._id }).select('likes');
    let likesCount = 0;
    userPosts.forEach(post => {
      likesCount += post.likes.length;
    });

    res.json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      followers: user.followers,
      following: user.following,
      postsCount, // 添加 postsCount
      likesCount, // 添加 likesCount
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

    // 计算 postsCount
    const postsCount = await Post.countDocuments({ user: user._id });

    // 计算 likesCount (用户获得的总点赞数)
    const userPosts = await Post.find({ user: user._id }).select('likes');
    let likesCount = 0;
    userPosts.forEach(post => {
      likesCount += post.likes.length;
    });

    res.json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      followers: user.followers,
      following: user.following,
      postsCount, // 添加 postsCount
      likesCount, // 添加 likesCount
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

// @desc    关注一个用户
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: '目标用户未找到' });
    }

    if (req.user._id.toString() === req.params.id.toString()) {
      return res.status(400).json({ message: '不能关注自己' });
    }

    // 检查是否已经关注
    if (currentUser.following.map(id => id.toString()).includes(req.params.id.toString())) {
      return res.status(400).json({ message: '已经关注此用户' });
    }

    currentUser.following.push(req.params.id);
    targetUser.followers.push(req.user._id);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: '关注成功' });

  } catch (error) {
    console.error('Follow User Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: '用户ID格式无效' });
    }
    res.status(500).json({ message: '服务器错误，关注用户失败' });
  }
};

// @desc    取消关注一个用户
// @route   POST /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: '目标用户未找到' });
    }

    // 从当前用户的 following 列表中移除目标用户
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id.toString()
    );

    // 从目标用户的 followers 列表中移除当前用户
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ message: '取消关注成功' });

  } catch (error) {
    console.error('Unfollow User Error:', error);
     if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: '用户ID格式无效' });
    }
    res.status(500).json({ message: '服务器错误，取消关注失败' });
  }
};

// @desc    获取用户的所有回复 (评论)
// @route   GET /api/users/:id/replies
// @access  Public
exports.getUserReplies = async (req, res) => {
  try {
    const userId = req.params.id;
    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // 查找所有帖子，然后在每个帖子中查找该用户的评论
    // 注意：这种方法对于大量帖子和评论可能效率低下。
    // 理想情况下，Comment 应该是一个单独的集合，并引用用户。
    const postsWithUserReplies = await Post.find({ "comments.user": userId })
      .populate('comments.user', 'username avatar') // 可选：填充评论用户信息
      .populate('user', 'username avatar'); // 可选：填充帖子作者信息

    let userReplies = [];
    postsWithUserReplies.forEach(post => {
      post.comments.forEach(comment => {
        if (comment.user && comment.user._id.toString() === userId.toString()) {
          userReplies.push({
            _id: comment._id,
            text: comment.text,
            createdAt: comment.createdAt,
            postId: post._id,
            postTitle: post.title, // 添加帖子标题以提供上下文
            postUser: post.user, // 添加帖子作者信息
            user: comment.user // 评论用户信息 (已填充)
            // 如果需要评论的点赞信息，也可以添加 comment.likes
          });
        }
      });
    });

    // 按评论创建时间降序排序
    userReplies.sort((a, b) => b.createdAt - a.createdAt);

    res.json(userReplies);

  } catch (error) {
    console.error('Get User Replies Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: '用户ID格式无效' });
    }
    res.status(500).json({ message: '服务器错误，获取用户回复失败' });
  }
};

// @desc    获取用户发布的所有媒体 (图片)
// @route   GET /api/users/:id/media
// @access  Public
exports.getUserMedia = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // 查找该用户的所有帖子，并提取图片
    const userPosts = await Post.find({ user: userId }).select('images title _id createdAt');

    let userMedia = [];
    userPosts.forEach(post => {
      if (post.images && post.images.length > 0) {
        post.images.forEach(imageUrl => {
          userMedia.push({
            url: imageUrl,
            postId: post._id,
            postTitle: post.title,
            createdAt: post.createdAt, // 或图片的上传时间 (如果模型中有)
          });
        });
      }
    });

    // 按创建时间降序排序 (这里使用帖子的创建时间)
    userMedia.sort((a, b) => b.createdAt - a.createdAt);

    res.json(userMedia);

  } catch (error) {
    console.error('Get User Media Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: '用户ID格式无效' });
    }
    res.status(500).json({ message: '服务器错误，获取用户媒体失败' });
  }
};

// @desc    获取用户喜欢的所有帖子
// @route   GET /api/users/:id/likes
// @access  Public
exports.getUserLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // 查找 likes 数组包含该用户 ID 的所有帖子
    const likedPosts = await Post.find({ likes: userId })
      .populate('user', 'username avatar') // 填充帖子作者信息
      .sort({ createdAt: -1 }); // 按创建时间排序

    res.json(likedPosts);

  } catch (error) {
    console.error('Get User Liked Posts Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: '用户ID格式无效' });
    }
    res.status(500).json({ message: '服务器错误，获取用户喜欢的帖子失败' });
  }
};

exports.getUserFollowingList = async (req, res) => {
  try {
    const { identifier, type } = req.params;
    let user;

    if (!identifier) {
      return res.status(400).json({ message: '缺少用户标识符' });
    }

    // Logic to find user by id or username
    if (type === 'id') {
      if (!mongoose.Types.ObjectId.isValid(identifier)) {
        return res.status(400).json({ message: '用户ID格式无效' });
      }
      user = await User.findById(identifier);
    } else if (type === 'username') {
      user = await User.findOne({ username: identifier });
    } else {
      // This case should ideally not be reached if routes are set up correctly
      return res.status(400).json({ message: '无效的请求类型' });
    }

    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // Fetch and populate the following list
    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'following',
        select: '_id username avatar bio' // Select desired fields
      })
      .select('following');

    if (!populatedUser) {
        return res.status(404).json({ message: '未能加载关注列表' });
    }

    res.json(populatedUser.following);

  } catch (error) {
    console.error('Get User Following List Error:', error);
    // Avoid checking error.kind if error is not a Mongoose error
    if (error instanceof mongoose.Error && error.kind === 'ObjectId') {
      return res.status(400).json({ message: '用户ID格式无效' });
    }
    res.status(500).json({ message: '服务器错误，获取关注列表失败' });
  }
};

// @desc    获取用户的粉丝列表
// @route   GET /api/users/id/:id/followers_list
// @route   GET /api/users/username/:username/followers_list
// @access  Public
exports.getUserFollowersList = async (req, res) => {
  try {
    const { identifier, type } = req.params;
    let user;

    if (!identifier) {
      return res.status(400).json({ message: '缺少用户标识符' });
    }

    // Logic to find user by id or username
    if (type === 'id') {
      if (!mongoose.Types.ObjectId.isValid(identifier)) {
        return res.status(400).json({ message: '用户ID格式无效' });
      }
      user = await User.findById(identifier);
    } else if (type === 'username') {
      user = await User.findOne({ username: identifier });
    } else {
      // This case should ideally not be reached if routes are set up correctly
      return res.status(400).json({ message: '无效的请求类型' });
    }

    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // Fetch and populate the followers list
    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'followers',
        select: '_id username avatar bio' // Select desired fields
      })
      .select('followers');

    if (!populatedUser) {
        return res.status(404).json({ message: '未能加载粉丝列表' });
    }

    res.json(populatedUser.followers);

  } catch (error) {
    console.error('Get User Followers List Error:', error);
    if (error instanceof mongoose.Error && error.kind === 'ObjectId') {
      return res.status(400).json({ message: '用户ID格式无效' });
    }
    res.status(500).json({ message: '服务器错误，获取粉丝列表失败' });
  }
};
