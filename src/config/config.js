const { Sequelize } = require('sequelize');
async function initializeDatabase() {
    try {
      // Create a connection without specifying a database
      const sequelize = new Sequelize({
        host: process.env.DB_HOST,
        dialect: 'mysql',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
  
      // Create the database if it doesn't exist
      await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
      console.log('Database created or already exists');
  
      // Close the connection
      await sequelize.close();
    } catch (error) {
      console.error('Database initialization error:', error);
      process.exit(1);
    }
  }
  
  // Update the database.js file to ensure database exists before connecting
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
    }
  );
  
  // Export both the initialization function and the sequelize instance
  module.exports = {
    initializeDatabase,
    sequelize
  };