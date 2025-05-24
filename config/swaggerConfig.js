const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'GHF HR System API',
    version: '1.0.0',
    description: 'API documentation for GHF HR System',
    contact: {
      name: 'GHF IT Team',
      email: 'it@ghf.com',
    },
  },
  servers: [
    {
      url: `http://185.172.57.203:${config.PORT}/api/${config.API_VERSION}`,
      description: 'Production server',
    },
    {
      url: `http://localhost:${config.PORT}/api/${config.API_VERSION}`,
      description: 'Development server',
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
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'],
  persistAuthorization: true,
  url: `http://185.172.57.203:${config.PORT}/api-docs.json`,
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

/**
 * Configure Swagger for Express
 * @param {Object} app - Express app
 */
const setupSwagger = (app) => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;