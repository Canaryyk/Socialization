// server/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const protect = async (req, res, next) => {
  let token;

  // 检查 Authorization header 是否存在且以 'Bearer' 开头
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 从 'Bearer TOKEN_STRING' 中提取 TOKEN_STRING
      token = req.headers.authorization.split(' ')[1];

      // 验证 token
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // 将解码后的用户信息 (不包含密码) 附加到请求对象上
      // 这样后续的路由处理器就可以访问 req.user
      req.user = await User.findById(decoded.id || decoded.user?.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: '未授权，用户不存在' }); // Changed
      }

      next(); // 继续执行下一个中间件或路由处理器
    } catch (error) {
      console.error('Token verification error:', error); // 服务器日志，保持英文或按需修改
      res.status(401).json({ message: '未授权，Token 验证失败' }); // Changed
    }
  }

  if (!token && !res.headersSent) { // 添加 !res.headersSent 避免在已发送响应后再发送
    res.status(401).json({ message: '未授权，缺少 Token' }); // Changed
  }
};

module.exports = { protect };