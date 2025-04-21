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

// Admin middleware combination for cleaner routes
const adminAuth = [authMiddleware, roleCheck("admin")];

// Package routes
router.get("/packages", PackageController.getAllPackages);
router.get("/packages/types/:typeId", PackageController.getPackagesByType);
router.get("/packages/:id", PackageController.getPackageById);

router.post(
  "/packages",
  [...adminAuth, upload.any()],
  PackageController.createPackage
);

router.put(
  "/packages/:id",
  [...adminAuth, upload.any()],
  PackageController.updatePackage
);

router.delete("/packages/:id", adminAuth, PackageController.deletePackage);

// Package Section routes
router.get(
  "/sections/package/:packageId",
  PackageSectionController.getSectionsByPackage
);

router.post(
  "/sections",
  [...adminAuth, upload.any()],
  PackageSectionController.createSection
);

router.put(
  "/sections/:id",
  [...adminAuth, upload.any()],
  PackageSectionController.updateSection
);

router.delete(
  "/sections/:id",
  adminAuth,
  PackageSectionController.deleteSection
);

// Package Item routes
router.get("/package-items/package/:id", PackageItemController.getPackageItems);

router.get(
  "/package-items/section/:sectionId",
  PackageItemController.getItemsBySectionId
);

router.post(
  "/package-items",
  [...adminAuth, upload.any()],
  PackageItemController.createPackageItem
);

router.put(
  "/package-items/:id",
  [...adminAuth, upload.any()],
  PackageItemController.updatePackageItem
);

router.delete(
  "/package-items/:id",
  adminAuth,
  PackageItemController.deletePackageItem
);

module.exports = router;
