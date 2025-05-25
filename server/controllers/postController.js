// server/controllers/postController.js
const Post = require('../models/Post');
const User = require('../models/User'); // 如果需要验证用户等

// @desc    创建新帖子
// @route   POST /api/posts
// @access  Private (需要认证)
exports.createPost = async (req, res) => {
  const { title, content } = req.body; // 从 body 中获取 title 和 content

  if (!title || !content) {
    return res.status(400).json({ message: '标题和内容不能为空' });
  }

  let imagePaths = [];
  if (req.files && req.files.length > 0) {
    imagePaths = req.files.map(file => `/uploads/posts/${file.filename}`);
  }

  try {
    const post = new Post({
      title,
      content,
      images: imagePaths, // 使用处理后的图片路径
      user: req.user._id, // req.user 来自 authMiddleware
    });

    const createdPost = await post.save();
    // 填充用户信息再返回
    const populatedPost = await Post.findById(createdPost._id).populate('user', 'username avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ message: '服务器错误，创建帖子失败' }); // Changed
  }
};

// @desc    获取所有帖子 (可添加分页)
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', 'username avatar')
      .populate({
          path: 'comments',
          populate: { path: 'user', select: 'username avatar' }
      })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get All Posts Error:', error);
    res.status(500).json({ message: '服务器错误，获取帖子列表失败' });
  }
};

// @desc    根据 ID 获取单个帖子
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username avatar') // Populate post author
      .populate({ // Populate comments and their authors
        path: 'comments',
        populate: { path: 'user', select: 'username avatar' }
      });

    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: '帖子未找到' }); // Changed
    }
  } catch (error) {
    console.error('Get Post By ID Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: '帖子未找到 (ID 格式无效)' }); // Changed
    }
    res.status(500).json({ message: '服务器错误，获取帖子详情失败' }); // Changed
  }
};

// @desc    获取指定用户的所有帖子
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getPostsByUser = async (req, res) => {
  try {
    const userExists = await User.findById(req.params.userId);
    if (!userExists) {
      return res.status(404).json({ message: '用户未找到' });
    }

    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get Posts By User Error:', error);
    res.status(500).json({ message: '服务器错误，获取用户帖子列表失败' });
  }
};

// @desc    给帖子添加评论
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addCommentToPost = async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ message: '评论内容不能为空' });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '帖子未找到' });
    }

    const comment = {
      user: req.user._id,
      text: text,
      name: req.user.username, // 从 req.user (authMiddleware) 获取
      avatar: req.user.avatar,  // 从 req.user (authMiddleware) 获取
      // createdAt 会自动生成
    };

    post.comments.unshift(comment); // 添加到评论数组的开头
    await post.save();

    // 返回新添加的评论 (Mongoose 会给子文档数组中的对象添加 _id)
    // populatedPost.comments[0] 就是新添加的评论，因为它被 unshift 到了数组头部
    const populatedPost = await Post.findById(post._id).populate('comments.user', 'username avatar');
    // 找到刚添加的评论返回给前端，它现在应该有 _id 和 createdAt
    // 注意：如果并发很高，这种查找方式可能不精确，但对于大多数应用是OK的。
    // 更稳妥的方式是，Mongoose 在保存后，子文档会获得 _id。post.comments[0] 就是最新评论。
    res.status(201).json(populatedPost.comments[0]);

  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ message: '服务器错误，添加评论失败' });
  }
};

// @desc    从帖子删除评论
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
exports.deleteCommentFromPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: '帖子未找到' });
    }

    // 找到要删除的评论
    const comment = post.comments.find(
      (c) => c._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ message: '评论未找到' });
    }

    // 权限检查：评论的作者或者是帖子的作者可以删除
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.user.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(401).json({ message: '无权限删除此评论' });
    }

    // 从数组中移除评论
    // post.comments.pull({ _id: req.params.commentId }); // 使用 pull 方法
    // 或者使用 filter
    post.comments = post.comments.filter(
        (c) => c._id.toString() !== req.params.commentId
    );

    await post.save();
    res.json({ message: '评论已删除' });

  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({ message: '服务器错误，删除评论失败' });
  }
};

// 更多功能 (更新、删除帖子等) 可以后续添加
// exports.updatePost = async (req, res) => { ... };
// exports.deletePost = async (req, res) => { ... };
