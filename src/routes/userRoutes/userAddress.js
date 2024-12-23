// routes/userAddressRoutes.js
const express = require('express');
const UserAddressController = require('../../controllers/userAddressController');

const router = express.Router();

// Routes for user addresses
router.get('/', UserAddressController.getAllAddresses);
router.get('/:addr_id', UserAddressController.getAddressById);
router.get('/user/:u_id', UserAddressController.getAddressesByUserId);
router.post('/', UserAddressController.createNewAddress);
router.put('/:addr_id', UserAddressController.updateAddress);
router.delete('/:addr_id', UserAddressController.deleteAddress);

module.exports = router;
