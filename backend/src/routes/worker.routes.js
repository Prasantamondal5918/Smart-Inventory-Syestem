const express = require('express');
const router = express.Router();
const workerController = require('../controllers/worker.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const { workerValidator } = require('../validators/worker.validator');

router.use(protect);
router.use(authorize('owner'));

router.post('/', workerValidator, validate, workerController.createWorker);
router.get('/', workerController.getWorkers);
router.get('/:id', workerController.getWorkerById);
router.put('/:id', workerController.updateWorker);
router.delete('/:id', workerController.deleteWorker);

module.exports = router;
