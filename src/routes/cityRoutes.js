const express = require('express');
const CityController = require('../controllers/cityController');
const CityPricingController = require('../controllers/CityPricingController');
const CategoryCitiesController = require('../controllers/CategoryCitiesController');

const router = express.Router();

// City routes
router.get('/cities', CityController.getAllCities);
router.get('/cities/:id', CityController.getCityById);
router.post('/cities', CityController.createCity);
router.put('/cities/:id', CityController.updateCity);
router.delete('/cities/:id', CityController.deleteCity);

// City Pricing routes
router.get('/city-pricing/item/:itemId', CityPricingController.getItemPricing);
router.get('/city-pricing/item/:itemId/city/:cityId', CityPricingController.getItemPriceForCity);
router.put('/city-pricing/item/:itemId/city/:cityId', CityPricingController.updateItemPricing);

// Category Cities routes
router.get('/category-cities', CategoryCitiesController.getAllCategoryMappings);
router.get('/category-cities/city/:cityId', CategoryCitiesController.getMappingsByCity);
router.post('/category-cities', CategoryCitiesController.createMapping);
router.post('/category-cities/bulk', CategoryCitiesController.bulkCreateMappings);
router.put('/category-cities/:id', CategoryCitiesController.updateMapping);
router.delete('/category-cities/:id', CategoryCitiesController.deleteMapping);

module.exports = router;