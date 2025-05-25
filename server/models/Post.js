// server/models/Post.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, '评论内容不能为空'],
  },
  name: { // 评论者用户名，冗余存储以方便前端显示
    type: String,
    required: true,
  },
  avatar: { // 评论者头像，冗余存储
    type: String,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 添加评论点赞字段
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PostSchema = new mongoose.Schema({
  user: { // 发帖用户
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 关联到 User 模型
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  images: [ // 帖子中的图片 (URL 列表)
    {
      type: String,
    },
  ],
  // 未来可以添加评论和点赞
  comments: [CommentSchema], // 使用上面定义的 CommentSchema
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 取消注释并定义 likes
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 在每次保存前更新 updatedAt 字段
PostSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', PostSchema);
