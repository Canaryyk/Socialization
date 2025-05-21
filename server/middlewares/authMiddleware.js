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
      // decoded.id 是因为我之前在 authController.js 生成 token 时 payload 是 { id: user.id }
      // decoded.user?.id 是因为另一个例子中 payload 是 { user: { id: user.id } }
      // 请确保与你 authController 中生成 token 的 payload 结构一致

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // 继续执行下一个中间件或路由处理器
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
