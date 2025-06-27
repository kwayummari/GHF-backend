const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const timesheetRoutes = require('./timesheetRoutes');
const departmentRoutes = require('./departmentRoutes');
const leaveRoutes = require('./leaveRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const documentRoutes = require('./documentRoutes');
const roleRoutes = require('./roleRoutes');
const menuRoutes = require('./menuRoutes');
const meetingRoutes = require('./meetingRoutes');

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/meetings', meetingRoutes);
router.use('/users', userRoutes);
router.use('/timesheets', timesheetRoutes);
router.use('/departments', departmentRoutes);
router.use('/leaves', leaveRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/documents', documentRoutes);
router.use('/roles', roleRoutes);
router.use('/menus', menuRoutes);

// Root API information
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the GHF HR Management System API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      authentication: '/api/v1/auth',
      users: '/api/v1/users',
      departments: '/api/v1/departments',
      leaves: '/api/v1/leaves',
      attendance: '/api/v1/attendance',
      documents: '/api/v1/documents',
      roles: '/api/v1/roles',
      menus: '/api/v1/menus',
      meetings: '/api/v1/meetings',
    }
  });
});

module.exports = router;