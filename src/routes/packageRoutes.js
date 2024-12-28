const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/packageController');
const PackageItemController = require('../controllers/packageItemController');
const PackageSectionController = require('../controllers/packageSectionController');

// Package routes
router.get('/packages', PackageController.getAllPackages);
router.get('/packages/:id', PackageController.getPackageById);
router.get('/packages/types/:typeId', PackageController.getPackagesByType);
router.post('/packages', PackageController.createPackage);
router.put('/packages/:id', PackageController.updatePackage);
router.delete('/packages/:id', PackageController.deletePackage);

// Package Item routes
router.get('/package-items/package/:id', PackageItemController.getPackageItems);
router.post('/package-items', PackageItemController.createPackageItem);
router.put('/package-items/:id', PackageItemController.updatePackageItem);
router.delete('/package-items/:id', PackageItemController.deletePackageItem);
// Package Section routes
router.get('/sections/package/:packageId', PackageSectionController.getSectionsByPackage);
router.post('/sections', PackageSectionController.createSection);
router.put('/sections/:id', PackageSectionController.updateSection);
router.delete('/sections/:id', PackageSectionController.deleteSection);
module.exports = router;