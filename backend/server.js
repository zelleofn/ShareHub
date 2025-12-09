const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');
mongoose.connect(process.env.MONGO_URI)
const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB(); 

    const port = process.env.NODE_ENV === 'test' ? 0 : PORT;

    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        logger.info(`Server running on port ${server.address().port}`);
        if (process.env.NODE_ENV !== 'test') {
          logger.info(`Upload files to: http://localhost:${PORT}/upload`);
        }
        resolve(server);
      });
    });
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

module.exports = startServer;
