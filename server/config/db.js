// server/config/db.js
const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
    });
    console.log('MongoDB Connected Successfully...');
    // console.log(`Successfully connected to MongoDB: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`); // 恢复这行
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
