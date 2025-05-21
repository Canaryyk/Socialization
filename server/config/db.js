// server/config/db.js
const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      // Mongoose 6.x 不需要 useNewUrlParser, useUnifiedTopology, useCreateIndex, useFindAndModify
      // 如果你使用 Mongoose 5.x, 可能需要以下配置:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true, // 对于 Mongoose 6+ 不再需要
      // useFindAndModify: false // 对于 Mongoose 6+ 不再需要
    });
    console.log('MongoDB Connected Successfully...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
