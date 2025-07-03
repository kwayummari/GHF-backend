const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const financeRoutes = require('./financeRoutes');
const requisitionRoutes = require('./requisitionRoutes');
const payrollRoutes = require('./payrollRoutes');
// Import other route modules here

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/finance', financeRoutes);
router.use('/requisitions', requisitionRoutes);
router.use('/payroll', payrollRoutes);
// Register other routes here
// router.use('/products', productRoutes);
// etc.

// Root API information route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the GHF Backend API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      finance: '/api/v1/finance',
      requisitions: '/api/v1/requisitions',
      payroll: '/api/v1/payroll'
    }
  });
});

module.exports = router;