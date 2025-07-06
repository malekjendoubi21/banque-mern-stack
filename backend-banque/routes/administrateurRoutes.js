const express = require('express');
const router = express.Router();
const administrateurController = require('../controllers/administrateurController');

router.get('/', administrateurController.getAllAdmins);
router.get('/:id', administrateurController.getAdminById);
router.post('/', administrateurController.createAdmin);
router.put('/:id', administrateurController.updateAdmin);
router.delete('/:id', administrateurController.deleteAdmin);

module.exports = router;
