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
      url: `http://185.172.57.203:${config.PORT}`,
      description: 'Production server',
    },
    {
      url: `http://localhost:${config.PORT}`,
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
  apis: ['./routes/*.js'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

/**
 * Configure Swagger for Express
 * @param {Object} app - Express app
 */
const setupSwagger = (app) => {
  // Disable security headers for swagger routes
  app.use('/api-docs', (req, res, next) => {
    // Remove security headers that might force HTTPS
    res.removeHeader('Strict-Transport-Security');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: data:;");
    next();
  });

  // Custom Swagger options to force HTTP
  const swaggerOptions = {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .scheme-container { display: none }
    `,
    customSiteTitle: "GHF HR System API",
    swaggerOptions: {
      persistAuthorization: true,
      url: `http://185.172.57.203:${config.PORT}/api-docs.json`,
      urls: [
        {
          url: `http://185.172.57.203:${config.PORT}/api-docs.json`,
          name: 'Production'
        }
      ]
    }
  };

  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.removeHeader('Strict-Transport-Security');
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;