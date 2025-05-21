// server/controllers/postController.js
const Post = require('../models/Post');
const User = require('../models/User'); // 如果需要验证用户等

// @desc    创建新帖子
// @route   POST /api/posts
// @access  Private (需要认证)
exports.createPost = async (req, res) => {
  const { title, content, images } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const post = new Post({
      title,
      content,
      images: images || [],
      user: req.user._id, // req.user 来自 authMiddleware
    });

    const createdPost = await post.save();
    // 填充用户信息再返回
    const populatedPost = await Post.findById(createdPost._id).populate('user', 'username avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ message: 'Server error while creating post' });
  }
};

// @desc    获取所有帖子 (可添加分页)
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    // .populate('user', 'username avatar') 会将 user 字段从 ObjectId 替换为对应的 User 文档中的 username 和 avatar 字段
    const posts = await Post.find({})
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 }); // 按创建时间降序排列
    res.json(posts);
  } catch (error) {
    console.error('Get All Posts Error:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
};

// @desc    根据 ID 获取单个帖子
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username avatar');

    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Get Post By ID Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching post' });
  }
};

// @desc    获取指定用户的所有帖子
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getPostsByUser = async (req, res) => {
  try {
    const userExists = await User.findById(req.params.userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get Posts By User Error:', error);
    res.status(500).json({ message: 'Server error while fetching user posts' });
  }
};

// 更多功能 (更新、删除帖子等) 可以后续添加
// exports.updatePost = async (req, res) => { ... };
// exports.deletePost = async (req, res) => { ... };
