const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleCheck,
} = require("../middlewares/auth.middleware.js");
const upload = require("../middlewares/uploadMiddleware.js");
const PackageController = require("../controllers/packageController");
const PackageItemController = require("../controllers/packageItemController");
const PackageSectionController = require("../controllers/packageSectionController");

// Package routes
router.get("/packages", PackageController.getAllPackages);
router.get("/packages/:id", PackageController.getPackageById);
router.get("/packages/types/:typeId", PackageController.getPackagesByType);
router.post(
  "/packages",
  upload.single("image"),
  authMiddleware,
  roleCheck("admin"),
  PackageController.createPackage
);
router.put("/packages/:id", PackageController.updatePackage);
router.delete("/packages/:id", PackageController.deletePackage);

// Package Item routes
router.get("/package-items/package/:id", PackageItemController.getPackageItems);
router.post(
  "/package-items",
  upload.single("image"),
  authMiddleware,
  roleCheck("admin"),
  PackageItemController.createPackageItem
);
router.put("/package-items/:id", PackageItemController.updatePackageItem);
router.delete("/package-items/:id", PackageItemController.deletePackageItem);
router.get(
  "/package-items/section/:sectionId",
  PackageItemController.getItemsBySectionId
);

// Package Section routes
router.get(
  "/sections/package/:packageId",
  PackageSectionController.getSectionsByPackage
);
router.post(
  "/sections",
  upload.single("image"),
  authMiddleware,
  roleCheck("admin"),
  PackageSectionController.createSection
);
router.put("/sections/:id", PackageSectionController.updateSection);
router.delete("/sections/:id", PackageSectionController.deleteSection);
module.exports = router;
