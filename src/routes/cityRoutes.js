const express = require('express');
const  CityController  = require('../controllers/cityController');

const router = express.Router();

router.get('/', CityController.getAllCities);
router.get('/:id', CityController.getCityById);
router.post('/', CityController.createCity);
router.put('/:id', CityController.updateCity);
router.delete('/:id', CityController.deleteCity);

module.exports = router;