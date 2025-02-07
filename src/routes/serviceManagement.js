const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware.js");
const {
  authMiddleware,
  roleCheck,
} = require("../middlewares/auth.middleware.js");
const ServiceCategoryController = require("../controllers/serviceCategoryController");
const SubCategoryController = require("../controllers/SubCategoryController");
const ServiceTypeController = require("../controllers/ServiceTypeController");
const ServiceController = require("../controllers/serviceController");
const ServiceItemController = require("../controllers/ServiceItemController");
const SpecialPricingController = require("../controllers/SpecialPricingController");

// Category routes
router.get("/categories/", ServiceCategoryController.getAllCategories);
router.get(
  "/categories/all",

  ServiceCategoryController.getAllCategoriesWithoutCity
);
router.post(
  "/categories",
  upload.single("image"),
  authMiddleware,
  roleCheck("admin"),
  ServiceCategoryController.createCategory
);
router.get(
  "/categories/slugs/:slug",
  ServiceCategoryController.getCategoryBySlug
);
router.get("/categories/:id", ServiceCategoryController.getCategoryById);
router.delete(
  "/categories/:id",
  authMiddleware,
  roleCheck("admin"),
  ServiceCategoryController.deleteCategory
);
router.put(
  "/categories/:id",
  upload.single("image"),
  authMiddleware,
  roleCheck("admin"),
  ServiceCategoryController.updateCategory
);

// SubCategory routes
router.get(
  "/subcategories",
  authMiddleware,
  roleCheck("admin"),
  SubCategoryController.getAllSubCategories
);
router.get(
  "/subcategories/slugs/:slug",
  SubCategoryController.getSubCategoryBySlug
);
router.get(
  "/categories/:categoryId/subcategories",
  SubCategoryController.getSubCategoriesByCategory
);
router.post(
  "/subcategories",
  upload.single("image"),
  authMiddleware,
  roleCheck("admin"),
  SubCategoryController.createSubCategory
);
router.put('/subcategories/:id', upload.single('image'), SubCategoryController.updateSubCategory);

router.delete(
  "/subcategories/:id",
  authMiddleware,
  roleCheck("admin"),
  SubCategoryController.deleteSubCategory
);

// ServiceType routes
router.get(
  "/subcategories/:subCategoryId/types",
  ServiceTypeController.getTypesBySubCategory
);
router.post(
  "/types",
  upload.single("image"),
  authMiddleware,
  roleCheck("admin"),
  ServiceTypeController.createServiceType
);
router.put(
  "/types/:id",
  authMiddleware,
  roleCheck("admin"),
  ServiceTypeController.updateServiceType
);
router.delete(
  "/types/:id",
  authMiddleware,
  roleCheck("admin"),
  ServiceTypeController.deleteServiceType
);

// Service routes

router.get(
  "/services",
  authMiddleware,
  roleCheck("admin"),
  ServiceController.getAllServices
);
router.get("/services/items/:typeId", ServiceController.getServiceByType);
router.post(
  "/services",
  upload.single("image"),
  authMiddleware,
  roleCheck("admin"),
  ServiceController.createService
);
router.get("/services/:id", ServiceController.getServiceById);
router.delete(
  "/services/:id",
  authMiddleware,
  roleCheck("admin"),
  ServiceController.deleteService
);

router.get("/services/itm/:typeId", ServiceController.getServiceByType);

// ServiceItem routes
router.post(
  "/items",
  authMiddleware,
  roleCheck("admin"),
  ServiceItemController.createServiceItem
);
router.get(
  "/items",
  authMiddleware,
  roleCheck("admin"),
  ServiceItemController.getAllServiceItems
);
router.get("/items/:id", ServiceItemController.getServiceItem);
router.get(
  "/items/serv/:serviceId",
  ServiceItemController.getServiceItemByService
);
router.put(
  "/items/:id",
  authMiddleware,
  roleCheck("admin"),
  ServiceItemController.updateServiceItem
);
router.delete(
  "/items/:id",
  authMiddleware,
  roleCheck("admin"),
  ServiceItemController.deleteServiceItem
);

// SpecialPricing routes
router.post(
  "/special-pricing",
  authMiddleware,
  roleCheck("admin"),
  SpecialPricingController.createSpecialPricing
);
router.get(
  "/special-pricing",
  SpecialPricingController.getActiveSpecialPricing
);
router.put(
  "/special-pricing/:id",
  authMiddleware,
  roleCheck("admin"),
  SpecialPricingController.updateSpecialPricing
);
router.delete(
  "/special-pricing/:id",
  authMiddleware,
  roleCheck("admin"),
  SpecialPricingController.deleteSpecialPricing
);
router.get(
  "/special-pricing/active/",
  SpecialPricingController.getActiveSpecialPricing
);

module.exports = router;
