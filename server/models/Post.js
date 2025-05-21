// server/models/Post.js
const mongoose = require('mongoose');

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
  // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  // likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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
