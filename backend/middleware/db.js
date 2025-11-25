const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri =
      process.env.NODE_ENV === 'test'
        ? process.env.TEST_MONGO_URI
        : process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MongoDB URI is missing. Check MONGO_URI or TEST_MONGO_URI in .env');
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(` Connected to ${process.env.NODE_ENV} database`);
  } catch (err) {
    console.error(' MongoDB connection error:', err.message || err);
    process.exit(1);
  }
}

module.exports = connectDB;
