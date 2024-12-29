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
router.get('/categories/slugs/:slug', ServiceCategoryController.getCategoryBySlug);
router.get('/categories/:id', ServiceCategoryController.getCategoryById);
router.delete('/categories/:id', ServiceCategoryController.deleteCategory)

// SubCategory routes
router.get('/subcategories', SubCategoryController.getAllSubCategories);
router.get('/subcategories/slugs/:slug', SubCategoryController.getSubCategoryBySlug);
router.get('/categories/:categoryId/subcategories', SubCategoryController.getSubCategoriesByCategory);
router.post('/subcategories', SubCategoryController.createSubCategory);
router.delete('/subcategories/:id', SubCategoryController.deleteSubCategory)

// ServiceType routes
router.get('/subcategories/:subCategoryId/types', ServiceTypeController.getTypesBySubCategory);
router.post('/types', ServiceTypeController.createServiceType);
router.delete('/types/:id', ServiceTypeController.deleteServiceType)

// Service routes
router.get('/services', ServiceController.getAllServices);
router.get('/services/items/:typeId', ServiceController.getServiceByType);
router.post('/services', ServiceController.createService);
router.get('/services/:id', ServiceController.getServiceById);
router.delete('/services/:id', ServiceController.deleteService)

// ServiceItem routes
router.post('/items', ServiceItemController.createServiceItem);
router.get('/items', ServiceItemController.getAllServiceItems);
router.get('/items/:id', ServiceItemController.getServiceItem);
router.get('/items/serv/:serviceId', ServiceItemController.getServiceItemByService)
router.put('/items/:id', ServiceItemController.updateServiceItem)
router.delete('/items/:id', ServiceItemController.deleteServiceItem)


module.exports = router;