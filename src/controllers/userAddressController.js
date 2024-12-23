// controllers/userAddressController.js
const { UserAddress } = require('../models');

class UserAddressController {
  // Get all addresses
  static async getAllAddresses(req, res, next) {
    try {
      const addresses = await UserAddress.findAll({
        order: [['addr_id', 'DESC']],
      });
      res.status(200).json(addresses);
    } catch (error) {
      next(error);
    }
  }

  // Get address by ID
  static async getAddressById(req, res, next) {
    try {
      const address = await UserAddress.findByPk(req.params.addr_id);
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.status(200).json(address);
    } catch (error) {
      next(error);
    }
  }

  // Get addresses by user ID
  static async getAddressesByUserId(req, res, next) {
    try {
      const addresses = await UserAddress.findAll({
        where: { u_id: req.params.u_id },
        order: [['addr_id', 'DESC']],
      });
      res.status(200).json(addresses);
    } catch (error) {
      next(error);
    }
  }

  // Create a new address
  static async createNewAddress(req, res, next) {
    try {
      const addressData = req.body;
      const newAddress = await UserAddress.create(addressData);
      res.status(201).json(newAddress);
    } catch (error) {
      next(error);
    }
  }

  // Update address by ID
  static async updateAddress(req, res, next) {
    try {
      const address = await UserAddress.findByPk(req.params.addr_id);
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }

      const updatedAddressData = req.body;
      await address.update(updatedAddressData);
      res.status(200).json(address);
    } catch (error) {
      next(error);
    }
  }

  // Delete address by ID
  static async deleteAddress(req, res, next) {
    try {
      const address = await UserAddress.findByPk(req.params.addr_id);
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      await address.destroy();
      res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserAddressController;
