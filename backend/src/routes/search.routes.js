const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', searchController.globalSearch);

module.exports = router;
