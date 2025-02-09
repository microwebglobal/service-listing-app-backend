const { Op } = require('sequelize');
const { Address, sequelize } = require('../models');
const createError = require('http-errors');

class AddressController {
  // Get all addresses for a user
  static async getUserAddresses(req, res, next) {
    try {
      console.log('Getting addresses - User object:', req.user);
      
      if (!req.user || !req.user.id) {
        console.log('No user ID found in request');
        throw createError(401, 'User not authenticated');
      }

      // Try to find addresses
      const addresses = await Address.findAll({
        where: { 
          userId: req.user.id 
        },
        logging: console.log // This will log the SQL query
      });
      
      console.log('Found addresses:', addresses);
      res.status(200).json(addresses);
      
    } catch (error) {
      console.error('Full error details:', {
        error: error,
        message: error.message,
        name: error.name,
        sql: error.sql,
        stack: error.stack,
        userId: req.user?.id
      });
      next(error);
    }
  }


  // Get specific address by ID
  static async getAddressById(req, res, next) {
    try {
      const address = await Address.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id 
        }
      });

      if (!address) {
        throw createError(404, 'Address not found');
      }

      res.status(200).json(address);
    } catch (error) {
      next(error);
    }
  }

  // Create new address
  static async createAddress(req, res, next) {
    try {
      const existingAddresses = await Address.count({
        where: { userId: req.user.id } 
      });

      const address = await Address.create({
        ...req.body,
        userId: req.user.id, 
        is_primary: existingAddresses === 0
      });

      res.status(201).json(address);
    } catch (error) {
      next(error);
    }
  }

  // Update address
  static async updateAddress(req, res, next) {
    try {
      const [updated] = await Address.update(req.body, {
        where: {
          id: req.params.id,
          userId: req.user.id  
        }
      });

      if (!updated) {
        throw createError(404, 'Address not found');
      }

      const updatedAddress = await Address.findByPk(req.params.id);
      res.status(200).json(updatedAddress);
    } catch (error) {
      next(error);
    }
  }

  // Delete address
  static async deleteAddress(req, res, next) {
    try {
      const address = await Address.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id  
        }
      });

      if (!address) {
        throw createError(404, 'Address not found');
      }

      if (address.is_primary) {
        const nextAddress = await Address.findOne({
          where: {
            userId: req.user.id,  
            id: { [Op.ne]: req.params.id }
          },
          order: [['createdAt', 'DESC']]
        });

        if (nextAddress) {
          await nextAddress.update({ is_primary: true });
        }
      }

      await address.destroy();
      res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Set address as primary
  static async setPrimaryAddress(req, res, next) {
    try {
      await sequelize.transaction(async (t) => {
        await Address.update(
          { is_primary: false },
          {
            where: { userId: req.user.id }, 
            transaction: t
          }
        );

        const [updated] = await Address.update(
          { is_primary: true },
          {
            where: {
              id: req.params.id,
              userId: req.user.id  //
            },
            transaction: t
          }
        );

        if (!updated) {
          throw createError(404, 'Address not found');
        }
      });

      const updatedAddress = await Address.findByPk(req.params.id);
      res.status(200).json(updatedAddress);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AddressController;