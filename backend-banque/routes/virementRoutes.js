const express = require('express');
const router = express.Router();
const virementController = require('../controllers/virementController');
const authMiddleware = require('../middleware/verifyToken');

router.get('/', virementController.getAllVirements);
router.get('/:id', virementController.getVirementById);
router.post('/', authMiddleware(['client']), virementController.createVirement);
router.put('/:id', virementController.updateVirement);
router.delete('/:id', virementController.deleteVirement);

module.exports = router;
