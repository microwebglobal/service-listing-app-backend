const express = require('express');
const ServiceController = require('../../controllers/serviceController.js');

const router = express.Router();

// Service routes
router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getServiceById);
router.post('/', ServiceController.createService);
router.put('/:id', ServiceController.updateService);
router.delete('/:id', ServiceController.deleteService);

// Additional routes for service name lookup
router.get('/name/:name', ServiceController.getServiceByName);

module.exports = router;
