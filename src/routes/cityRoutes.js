const express = require('express');
const  CityController  = require('../controllers/cityController');
const CityPricingController = require('../controllers/CityPricingController');

const router = express.Router();

router.get('/cities', CityController.getAllCities);
router.get('/cities/:id', CityController.getCityById);
router.post('/cities', CityController.createCity);
router.put('/cities/:id', CityController.updateCity);
router.delete('/cities/:id', CityController.deleteCity);

router.get('/city-pricing/item/:itemId', CityPricingController.getItemPricing);
router.get('/city-pricing/item/:itemId/city/:cityId', CityPricingController.getItemPriceForCity);
router.put('/city-pricing/item/:itemId/city/:cityId', CityPricingController.updateItemPricing);

module.exports = router;