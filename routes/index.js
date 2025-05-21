const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const departmentRoutes = require('./departmentRoutes');
const leaveRoutes = require('./leaveRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const documentRoutes = require('./documentRoutes');
const roleRoutes = require('./roleRoutes');

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/leaves', leaveRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/documents', documentRoutes);
router.use('/roles', roleRoutes);

// Root API information
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the GHF HR System API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

module.exports = router;