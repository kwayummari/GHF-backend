```

## routes/attendanceRoutes.js
```javascript
const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { clockInValidator, clockOutValidator, attendanceUpdateValidator } = require('../validators/attendanceValidator');
const { holidayValidator } = require('../validators/holidayValidator');

const router = express.Router();

/**
 * @swagger
 * tags