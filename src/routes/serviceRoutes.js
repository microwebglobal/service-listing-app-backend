const express = require('express');
const ServiceCategoryController = require('../controllers/serviceCategoryController');
const ServiceController = require('../controllers/serviceController');
const router = express.Router();

// Category routes
router.get('/categories', ServiceCategoryController.getAllCategories);
router.post('/categories', ServiceCategoryController.createCategory);
router.put('/categories/:id', ServiceCategoryController.updateCategory);

// Service routes - Note the change in how we reference the static methods
router.post('/services', ServiceController.createService);
router.get('/services/:service_id/pricing/:city_id', ServiceController.getServicePricing);
router.get('/services', ServiceController.getAllServices);         
router.get('/services/:id', ServiceController.getServiceById);


module.exports = router;