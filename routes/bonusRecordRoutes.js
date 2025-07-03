const express = require('express');
const router = express.Router();
const bonusRecordController = require('../controllers/bonusRecordController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Bonus Record Routes
router.get('/', auth, bonusRecordController.getAllBonuses);
router.post('/', [auth, checkRole('hr', 'manager')], bonusRecordController.createBonus);
router.put('/:bonusId/status', [auth, checkRole('hr', 'manager')], bonusRecordController.updateBonusStatus);
router.get('/statistics', [auth, checkRole('hr', 'manager')], bonusRecordController.getBonusStatistics);

module.exports = router;
