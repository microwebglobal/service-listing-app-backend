const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/packageController');
const PackageItemController = require('../controllers/packageItemController');

// Package routes
router.get('/packages', PackageController.getAllPackages);
router.get('/packages/:id', PackageController.getPackageById);
router.get('/types/:typeId/packages', PackageController.getPackagesByType);
router.post('/packages', PackageController.createPackage);
router.put('/packages/:id', PackageController.updatePackage);
router.delete('/packages/:id', PackageController.deletePackage);

// Package Item routes
router.get('/packages/:packageId/items', PackageItemController.getPackageItems);
router.post('/package-items', PackageItemController.createPackageItem);
router.put('/package-items/:id', PackageItemController.updatePackageItem);
router.delete('/package-items/:id', PackageItemController.deletePackageItem);

module.exports = router;