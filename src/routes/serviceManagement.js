const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware.js");
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
  ServiceCategoryController.createCategory
);
router.get(
  "/categories/slugs/:slug",
  ServiceCategoryController.getCategoryBySlug
);
router.get("/categories/:id", ServiceCategoryController.getCategoryById);
router.delete("/categories/:id", ServiceCategoryController.deleteCategory);
router.put("/categories/:id", ServiceCategoryController.updateCategory);

// SubCategory routes
router.get("/subcategories", SubCategoryController.getAllSubCategories);
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
  SubCategoryController.createSubCategory
);
router.put("/subcategories/:id", SubCategoryController.updateSubCategory);
router.delete("/subcategories/:id", SubCategoryController.deleteSubCategory);

// ServiceType routes
router.get(
  "/subcategories/:subCategoryId/types",
  ServiceTypeController.getTypesBySubCategory
);
router.post(
  "/types",
  upload.single("image"),
  ServiceTypeController.createServiceType
);
router.put("/types/:id", ServiceTypeController.updateServiceType);
router.delete("/types/:id", ServiceTypeController.deleteServiceType);

// Service routes

router.get("/services", ServiceController.getAllServices);
router.get("/services/items/:typeId", ServiceController.getServiceByType);
router.post("/services", ServiceController.createService);
router.get("/services/:id", ServiceController.getServiceById);
router.delete("/services/:id", ServiceController.deleteService);

router.get("/services/itm/:typeId", ServiceController.getServiceByType);

// ServiceItem routes
router.post("/items", ServiceItemController.createServiceItem);
router.get("/items", ServiceItemController.getAllServiceItems);
router.get("/items/:id", ServiceItemController.getServiceItem);
router.get(
  "/items/serv/:serviceId",
  ServiceItemController.getServiceItemByService
);
router.put("/items/:id", ServiceItemController.updateServiceItem);
router.delete("/items/:id", ServiceItemController.deleteServiceItem);

// SpecialPricing routes
router.post("/special-pricing", SpecialPricingController.createSpecialPricing);
router.get(
  "/special-pricing",
  SpecialPricingController.getActiveSpecialPricing
);
router.put(
  "/special-pricing/:id",
  SpecialPricingController.updateSpecialPricing
);
router.delete(
  "/special-pricing/:id",
  SpecialPricingController.deleteSpecialPricing
);
router.get(
  "/special-pricing/active/",
  SpecialPricingController.getActiveSpecialPricing
);

module.exports = router;
