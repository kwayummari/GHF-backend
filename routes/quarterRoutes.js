const express = require('express');
const router = express.Router();
const quarterController = require('../controllers/quarterController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Quarter routes
router.get('/', auth, checkRole('finance', 'admin'), quarterController.getAllQuarters);
router.get('/current', auth, quarterController.getCurrentQuarter);
router.post('/', [auth, checkRole('finance', 'admin')], quarterController.createQuarter);
router.put('/:quarterId/status', [auth, checkRole('finance', 'admin')], quarterController.updateQuarterStatus);
router.get('/year/:year', auth, checkRole('finance', 'admin'), quarterController.getQuartersByYear);

module.exports = router;
