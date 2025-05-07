const express = require('express');
const authRoutes = require('./authRoutes');
// Import other route modules here

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
// Register other routes here
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);
// etc.

// Root API information route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

module.exports = router;