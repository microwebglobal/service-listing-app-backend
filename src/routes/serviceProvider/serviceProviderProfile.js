const express = require('express');
const ServiceProviderProfileController = require('../../controllers/serviceProviderProfileController.js');

const router = express.Router();

router.get('/', ServiceProviderProfileController.getAllProviders);
router.get('/:u_id', ServiceProviderProfileController.getProfileByUserId);
router.post('/', ServiceProviderProfileController.createProvider);
router.put('/:id', ServiceProviderProfileController.updateProvider);
router.delete('/:id', ServiceProviderProfileController.deleteProvider);

module.exports = router;
