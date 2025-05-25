// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

// 辅助函数：生成 JWT
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: '30d', // Token 有效期，例如 30 天
  });
};

// @desc    用户注册
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: '请提供所有必填项' }); // Changed
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      // console.log('User found by email (debug):', userExists);
      return res.status(400).json({ message: '该邮箱已被注册' }); // Changed
    }

    const userByUsername = await User.findOne({ username });
    if (userByUsername) {
      // console.log('User found by username (debug):', userByUsername);
      return res.status(400).json({ message: '该用户名已被占用' }); // Changed
    }

    const user = await User.create({
      username,
      email,
      password, // 密码会在 User model 的 pre-save钩子中被哈希
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: '无效的用户数据，注册失败' }); // Changed
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: '服务器错误，注册失败', error: error.message }); // Changed
  }
};

// @desc    用户登录
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '请输入邮箱和密码' }); // Changed
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: '邮箱或密码错误' }); // Changed
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: '服务器错误，登录失败' }); // Changed
  }
};