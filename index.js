require("dotenv").config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/utils/swagger');
const userRoutes = require('./src/routes/userRoutes');
const walletRoutes = require('./src/routes/walletRoute');
const { initializeDatabase, sequelize } = require('./src/config/config');
const apiLimiter = require('./src/middlewares/rateLimiter');
const logger = require('./src/utils/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/', apiLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Database connection and server startup
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
      // Initialize database first
      await initializeDatabase();
      
      // Then sync models
      await sequelize.sync();
      logger.info('Database connected successfully');
      
      app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
}

startServer();