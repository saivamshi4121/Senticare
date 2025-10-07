const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error?.message || error);
    // Provide helpful hints for common Atlas issues
    if (String(error?.message || '').includes('whitelist')) {
      console.error('Hint: Add your IP to Atlas Network Access or allow 0.0.0.0/0 for development.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
