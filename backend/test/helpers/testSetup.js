const mongoose = require('mongoose');
require('dotenv').config(); 

const connectTestDB = async () => {
  try {
    const uri = process.env.TEST_MONGO_URI;

    if (!uri) {
      throw new Error('TEST_MONGO_URI is not defined in .env');
    }

    console.log('Connecting to test database...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(' Test database connected');
  } catch (err) {
    console.error(' Test database connection error:', err);
    throw err;
  }
};

const clearTestDB = async () => {
  try {
    console.log('Clearing test database...');
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    console.log('Test database cleared');
  } catch (err) {
    console.error(' Error clearing test database:', err);
    throw err;
  }
};

const closeTestDB = async () => {
  try {
    console.log('Disconnecting from test database...');
    await mongoose.connection.dropDatabase(); 
    await mongoose.connection.close();
    console.log(' Test database disconnected');
  } catch (err) {
    console.error(' Error disconnecting from test database:', err);
    throw err;
  }
};

module.exports = { connectTestDB, clearTestDB, closeTestDB };
