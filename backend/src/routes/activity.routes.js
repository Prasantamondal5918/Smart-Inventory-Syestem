const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('owner'));

router.get('/', activityController.getActivityLogs);

module.exports = router;
