// server/config/index.js
require('dotenv').config(); // 确保在顶部加载 .env 文件

module.exports = {
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};
