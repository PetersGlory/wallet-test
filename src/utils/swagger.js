const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wallet Management System API',
      version: '1.0.0',
      description: 'API documentation for the Wallet Management System',
    },
    servers: [
      {
        url: 'https://wallet-test-rbp6.onrender.com',
        description: 'Development server',
      },
      {
        url: 'http://localhost:9000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;