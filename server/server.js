// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path'); // 引入 path 模块
const config = require('./config'); // 引入配置
const connectDB = require('./config/db'); // 引入数据库连接函数

// 引入路由文件
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

// 连接到 MongoDB
connectDB();

const app = express();

// 中间件
app.use(cors()); // 允许跨域请求 (在开发阶段可以简单使用，生产环境建议配置更具体的 CORS策略)
app.use(express.json()); // 解析 JSON格式的请求体
app.use(express.urlencoded({ extended: false })); // 解析 URL编码的请求体

// 提供静态文件服务 (例如上传的图片)
// __dirname 是当前文件 (server.js) 所在的目录 (server/)
// path.join 会正确地拼接路径，适用于不同操作系统
// 旧: app.use('/public', express.static(path.join(__dirname, 'public')));
// 新: 直接服务根目录下的 public 文件夹
app.use(express.static(path.join(__dirname, '..', 'public')));

// 定义 API 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// 一个简单的根路由用于测试 API 是否运行
app.get('/', (req, res) => {
  res.send('Socialization API is running...');
});

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
