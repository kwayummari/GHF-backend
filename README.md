
A scalable and production-ready Express.js backend application with modular architecture, built-in security, and comprehensive utilities for rapid application development.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Core Components](#core-components)
  - [Authentication & Authorization](#authentication--authorization)
  - [Validation](#validation)
  - [Security](#security)
  - [Error Handling & Logging](#error-handling--logging)
  - [Database Integration](#database-integration)
  - [File Handling](#file-handling)
  - [Email Service](#email-service)
  - [PDF Generation](#pdf-generation)
  - [Task Scheduling](#task-scheduling)
  - [API Documentation](#api-documentation)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Testing](#testing)
- [Best Practices](#best-practices)

## Features

- **Modular Architecture**: Organized with separation of concerns for maintainability
- **Authentication**: JWT-based authentication with refresh tokens and role-based access control
- **Security**: Comprehensive security middleware (Helmet, CORS, rate limiting)
- **Validation**: Request validation with meaningful error responses
- **Logging**: Advanced logging with Winston and rotating log files
- **Database**: Sequelize ORM for database operations with migrations and models
- **API Documentation**: Auto-generated Swagger documentation
- **Error Handling**: Centralized error handling with standardized responses
- **File Upload**: Secure file upload handling with Multer
- **Email Service**: Nodemailer integration with templating
- **PDF Generation**: PDFKit integration for document generation
- **Task Scheduling**: Automated job scheduling with node-schedule
- **Environment Management**: Environment configuration with dotenv-flow

## Project Structure

```
ghf-backend/
├── .env                            # Environment variables
├── .env.example                    # Example environment file with keys but no values
├── .gitignore                      # Git ignore file
├── package.json                    # Project dependencies and scripts
├── README.md                       # Project documentation
├── app.js                          # Express app initialization
├── server.js                       # Server entry point
├── config/                         # Configuration files
├── controllers/                    # Request handlers
├── middlewares/                    # Express middlewares
├── models/                         # Database models
├── repositories/                   # Database query abstraction
├── routes/                         # API routes
├── services/                       # Business logic services
├── utils/                          # Utility functions
├── validators/                     # Request validation rules
├── migrations/                     # Database migrations
├── seeders/                        # Database seed data
├── docs/                           # Additional documentation
├── logs/                           # Application logs
└── tests/                          # Test files
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL (or another database supported by Sequelize)

### Steps

1. Clone the repository:
   ```bash
   git clone git@github.com:AURORAWAVELABS/GHF-backend.git
   cd ghf-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create environment files:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   # Create the database
   npm run db:create
   
   # Run migrations
   npm run migrate
   
   # (Optional) Seed the database with initial data
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. The server will be running at `http://localhost:3000`

## Configuration

The application uses environment variables for configuration. Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=express_app
DB_USER=root
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
EMAIL_FROM=noreply@example.com

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880 # 5MB

# Security
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX=100 # 100 requests per window

# Logging
LOG_LEVEL=info
LOG_DIR=logs
```

## Core Components

### Authentication & Authorization

The authentication system uses JSON Web Tokens (JWT) with Passport.js for secure authentication and authorization.

#### Key Files:
- `controllers/authController.js` - Handles login, registration, token refresh, etc.
- `middlewares/authMiddleware.js` - JWT token verification and role-based access control
- `config/passportConfig.js` - Passport JWT strategy configuration
- `utils/hashUtils.js` - Password hashing with bcrypt
- `utils/tokenUtils.js` - JWT token generation and verification

#### Features:
- Secure password hashing with bcrypt
- JWT-based authentication
- Refresh token mechanism
- Role-based authorization
- Password reset flow

#### Usage Example:

Protecting a route with authentication:
```javascript
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Require authentication
router.get('/profile', authenticate, userController.getProfile);

// Require specific role
router.get('/admin-panel', authenticate, authorize(['admin']), adminController.getPanel);
```

### Validation

Request validation ensures that incoming data meets expected requirements before processing.

#### Key Files:
- `middlewares/validateRequest.js` - Express middleware for validation
- `validators/userValidator.js` - User-related validation rules
- `validators/loginValidator.js` - Authentication-related validation rules

#### Features:
- Validation rules using express-validator
- Structured validation error responses
- Custom validation rules

#### Usage Example:

Adding validation to a route:
```javascript
const { registerValidator } = require('../validators/userValidator');
const validateRequest = require('../middlewares/validateRequest');

router.post('/register', registerValidator, validateRequest, authController.register);
```

### Security

The application includes multiple security measures to protect against common web vulnerabilities.

#### Key Files:
- `config/helmetConfig.js` - Helmet.js security headers configuration
- `config/corsConfig.js` - Cross-Origin Resource Sharing settings
- `middlewares/rateLimiter.js` - Request rate limiting

#### Features:
- Protection against XSS attacks
- CSRF protection
- Content Security Policy
- Rate limiting to prevent brute force attacks
- Secure HTTP headers

#### Usage Example:

The security middlewares are already configured in `app.js`:
```javascript
app.use(helmet(helmetConfig));
app.use(cors(corsConfig));
app.use(rateLimiter);
```

### Error Handling & Logging

Comprehensive error handling and logging for robust application monitoring and debugging.

#### Key Files:
- `middlewares/errorHandler.js` - Global error handling middleware
- `utils/logger.js` - Winston logger configuration
- `middlewares/morganLogger.js` - HTTP request logging

#### Features:
- Centralized error handling
- Structured error responses
- Different log levels based on environment
- Daily rotating log files
- HTTP request logging with Morgan

#### Usage Example:

Using the logger in your code:
```javascript
const logger = require('../utils/logger');

try {
  // Some operation
  logger.info('Operation successful');
} catch (error) {
  logger.error('Operation failed:', error);
}
```

### Database Integration

The application uses Sequelize ORM for database operations with models, migrations, and repositories.

#### Key Files:
- `config/dbConfig.js` - Database connection configuration
- `models/index.js` - Models initialization and associations
- `models/User.js` - User model example
- `repositories/userRepository.js` - User database operations

#### Features:
- Sequelize ORM integration
- Model definitions with validation
- Database migrations for version control
- Repository pattern for data access
- Connection pooling

#### Usage Example:

Using repositories for database operations:
```javascript
const userRepository = require('../repositories/userRepository');

const user = await userRepository.findByEmail('user@example.com');
```

### File Handling

Secure file upload and management functionality.

#### Key Files:
- `middlewares/uploadMiddleware.js` - Multer configuration
- `utils/fileUtils.js` - File handling utilities

#### Features:
- Secure file uploads with size and type validation
- Unique filename generation
- File deletion utilities
- File size formatting

#### Usage Example:

Setting up a file upload route:
```javascript
const upload = require('../middlewares/uploadMiddleware');

router.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  // Process the uploaded file
});
```

### Email Service

Email sending capabilities with templates for notifications, password resets, etc.

#### Key Files:
- `services/mailer.js` - Nodemailer configuration and email sending functions

#### Features:
- SMTP email configuration
- HTML email templates
- Email sending with attachments
- Template variable substitution

#### Usage Example:

Sending an email with a template:
```javascript
const { sendEmail } = require('../services/mailer');

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to our platform',
  template: 'welcome',
  templateData: {
    firstName: 'John',
    activationLink: 'https://example.com/activate'
  }
});
```

### PDF Generation

Generate PDF documents for reports, invoices, and other purposes.

#### Key Files:
- `services/pdfGenerator.js` - PDFKit integration for PDF generation

#### Features:
- PDF document creation
- Customizable templates
- Invoice generation example
- Text and image support

#### Usage Example:

Generating an invoice PDF:
```javascript
const { generateInvoicePDF } = require('../services/pdfGenerator');

const pdfPath = await generateInvoicePDF({
  number: '2025-001',
  date: '2025-05-08',
  company: { name: 'Your Company', address: '123 Business St', email: 'info@company.com' },
  client: { name: 'Client Name', address: '456 Client Ave', email: 'client@example.com' },
  items: [
    { id: '1', description: 'Item 1', quantity: 2, price: 100 },
    { id: '2', description: 'Item 2', quantity: 1, price: 50 }
  ],
  subtotal: 250,
  tax: 25,
  total: 275
});
```

### Task Scheduling

Schedule recurring tasks and background jobs.

#### Key Files:
- `services/scheduler.js` - Job scheduling with node-schedule

#### Features:
- Cron-style job scheduling
- Job management (create, cancel, list)
- Error handling for scheduled jobs
- Common job examples (backups, reports, cleanup)

#### Usage Example:

Scheduling a recurring task:
```javascript
const { scheduleJob } = require('../services/scheduler');

// Daily report at 8 AM
scheduleJob('dailyReport', '0 8 * * *', async () => {
  // Generate and send report
});
```

### API Documentation

Automatically generated API documentation with Swagger.

#### Key Files:
- `config/swaggerConfig.js` - Swagger configuration

#### Features:
- Interactive API documentation
- Auto-generated from JSDoc comments
- API testing capability
- Authentication support

#### Usage:
The API documentation is available at `/api-docs` when the server is running.

## Development

### Available Scripts

- `npm run dev` - Run the development server with hot reloading
- `npm start` - Run the production server
- `npm test` - Run tests
- `npm run lint` - Check for code style issues
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database

### Adding a New API Endpoint

1. Create controller method:
```javascript
// controllers/exampleController.js
const getItems = async (req, res, next) => {
  try {
    // Logic here
    return res.json({ data: items });
  } catch (error) {
    next(error);
  }
};
```

2. Create route:
```javascript
// routes/exampleRoutes.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, exampleController.getItems);

module.exports = router;
```

3. Register route in the main router:
```javascript
// routes/index.js
router.use('/examples', exampleRoutes);
```

## Production Deployment

### Preparing for Production

1. Set environment variables for production:
```
NODE_ENV=production
```

2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name "express-backend"
```

3. Set up a reverse proxy (Nginx, Apache) to handle TLS and load balancing.

4. Configure database for production with proper security settings.

### Docker Deployment

A Dockerfile is included for containerized deployment:

```bash
# Build the Docker image
docker build -t express-backend .

# Run the container
docker run -p 3000:3000 --env-file .env express-backend
```

## Testing

The project includes a testing setup with Jest:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

Add tests in the `tests` directory following this structure:
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests
- `tests/fixtures/` - Test data and helpers

## Best Practices

### Code Style

- Follow the ESLint configuration included in the project
- Use async/await for asynchronous operations
- Use destructuring for cleaner code
- Document functions with JSDoc comments

### Security

- Never store sensitive information in code
- Use environment variables for configuration
- Always validate user input
- Keep dependencies updated
- Implement rate limiting for public endpoints
- Use HTTPS in production

### Error Handling

- Always use try/catch blocks in async functions
- Use the centralized error handler
- Return meaningful error messages
- Log errors with appropriate log levels

### Database Operations

- Use the repository pattern for database operations
- Create database migrations for schema changes
- Use transactions for related operations
- Validate data before saving to the database

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Express.js team for the excellent web framework
- Sequelize team for the ORM
- All the open-source contributors of the libraries used in this project