const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('owner'));

router.get('/summary', reportController.getReportSummary);
router.get('/export', reportController.exportReportCSV);

module.exports = router;
