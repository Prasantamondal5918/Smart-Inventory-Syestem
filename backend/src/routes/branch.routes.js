const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', branchController.getBranches);
router.post('/', authorize('owner'), branchController.createBranch);
router.put('/:id', authorize('owner'), branchController.updateBranch);

module.exports = router;
