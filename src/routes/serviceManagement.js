const express = require('express');
const router = express.Router();
const ServiceCategoryController = require('../controllers/serviceCategoryController');
const SubCategoryController = require('../controllers/SubCategoryController');
const ServiceTypeController = require('../controllers/ServiceTypeController');
const ServiceController = require('../controllers/serviceController');
const ServiceItemController = require('../controllers/ServiceItemController');

// Category routes
router.get('/categories', ServiceCategoryController.getAllCategories);
router.post('/categories', ServiceCategoryController.createCategory);
router.get('/categories/:id', ServiceCategoryController.getCategoryById);

// SubCategory routes
router.get('/subcategories', SubCategoryController.getAllSubCategories);
router.get('/categories/:categoryId/subcategories', SubCategoryController.getSubCategoriesByCategory);
router.post('/subcategories', SubCategoryController.createSubCategory);

// ServiceType routes
router.get('/subcategories/:subCategoryId/types', ServiceTypeController.getTypesBySubCategory);
router.post('/types', ServiceTypeController.createServiceType);

// Service routes
router.get('/services', ServiceController.getAllServices);
router.post('/services', ServiceController.createService);
router.get('/services/:id', ServiceController.getServiceById);

// ServiceItem routes
router.post('/items', ServiceItemController.createServiceItem);
router.get('/items', ServiceItemController.getAllServiceItems);
router.get('/items/:id', ServiceItemController.getServiceItem);

module.exports = router;