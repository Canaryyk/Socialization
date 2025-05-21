// server/server.js
const express = require('express');
const cors = require('cors');
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

// 定义 API 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// 一个简单的根路由用于测试 API 是否运行
app.get('/', (req, res) => {
  res.send('Socialization API is running...');
});

// 全局错误处理中间件 (可选，但推荐)
// 你可以创建一个 errorMiddleware.js 并在最后 app.use(errorHandler);
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   const statusCode = err.statusCode || 500;
//   const message = err.message || 'Internal Server Error';
//   res.status(statusCode).json({ message });
// });

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
