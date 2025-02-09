const { ServiceItem, CitySpecificPricing, PackageItem } = require('../models');

class CityPricingController {
    static async getItemPricing(req, res, next) {
        try {
            const itemId = req.params.itemId;
            const itemType = itemId.startsWith('P') ? 'package_item' : 'service_item';
            
            // First get the item with its base price
            const ItemModel = itemType === 'package_item' ? PackageItem : ServiceItem;
            
            const item = await ItemModel.findByPk(itemId, {
                include: [{
                    model: CitySpecificPricing,
                    where: { item_type: itemType },
                    attributes: ['city_id', 'price'],
                    required: false
                }]
            });

            if (!item) {
                return res.status(404).json({ 
                    message: `${itemType === 'package_item' ? 'Package' : 'Service'} item not found`
                });
            }

            // Transform the data to create a pricing map
            const pricingResponse = {
                item_id: item.item_id,
                name: item.name,
                base_price: item.base_price || item.price, // Handle both ServiceItem and PackageItem
                city_prices: {},
                item_type: itemType
            };

            // Add city-specific prices
            if (item.CitySpecificPricings) {
                item.CitySpecificPricings.forEach(pricing => {
                    pricingResponse.city_prices[pricing.city_id] = pricing.price;
                });
            }

            res.status(200).json(pricingResponse);
        } catch (error) {
            console.error('Error fetching item pricing:', error);
            next(error);
        }
    }

    static async getItemPriceForCity(req, res, next) {
        try {
            const { itemId, cityId } = req.params;
            const itemType = itemId.startsWith('P') ? 'package_item' : 'service_item';
            
            // Get the appropriate item with its base price
            const ItemModel = itemType === 'package_item' ? PackageItem : ServiceItem;
            const item = await ItemModel.findByPk(itemId);

            if (!item) {
                return res.status(404).json({ 
                    message: `${itemType === 'package_item' ? 'Package' : 'Service'} item not found`
                });
            }

            // Look for city-specific pricing
            const cityPricing = await CitySpecificPricing.findOne({
                where: {
                    item_id: itemId,
                    city_id: cityId,
                    item_type: itemType
                }
            });

            // Return either city-specific price or base price
            const price = cityPricing ? cityPricing.price : (item.base_price || item.price);

            res.status(200).json({
                item_id: itemId,
                city_id: cityId,
                price: price,
                is_city_specific: !!cityPricing,
                item_type: itemType
            });

        } catch (error) {
            console.error('Error fetching city-specific price:', error);
            next(error);
        }
    }

    static async updateItemPricing(req, res, next) {
        try {
            const { itemId } = req.params;
            const { base_price, city_prices } = req.body;
            const itemType = itemId.startsWith('P') ? 'package_item' : 'service_item';

            // Start a transaction to ensure data consistency
            const result = await sequelize.transaction(async (t) => {
                // Get the appropriate item model
                const ItemModel = itemType === 'package_item' ? PackageItem : ServiceItem;
                const item = await ItemModel.findByPk(itemId, { transaction: t });

                if (!item) {
                    throw new Error(`${itemType === 'package_item' ? 'Package' : 'Service'} item not found`);
                }

                // Update base price if provided
                if (base_price !== undefined) {
                    const updateField = itemType === 'package_item' ? 'price' : 'base_price';
                    await item.update({ [updateField]: base_price }, { transaction: t });
                }

                // Handle city-specific prices if provided
                if (city_prices && typeof city_prices === 'object') {
                    const cityPricingPromises = Object.entries(city_prices).map(([cityId, price]) => {
                        return CitySpecificPricing.upsert(
                            {
                                item_id: itemId,
                                city_id: cityId,
                                price: price,
                                item_type: itemType
                            },
                            { transaction: t }
                        );
                    });

                    await Promise.all(cityPricingPromises);
                }

                // Return updated data
                return await ItemModel.findByPk(itemId, {
                    include: [{
                        model: CitySpecificPricing,
                        where: { item_type: itemType },
                        attributes: ['city_id', 'price'],
                        required: false
                    }],
                    transaction: t
                });
            });

            // Transform the response data
            const response = {
                item_id: result.item_id,
                name: result.name,
                base_price: result.base_price || result.price,
                city_prices: {},
                item_type: itemType
            };

            if (result.CitySpecificPricings) {
                result.CitySpecificPricings.forEach(pricing => {
                    response.city_prices[pricing.city_id] = pricing.price;
                });
            }

            res.status(200).json(response);

        } catch (error) {
            console.error('Error updating item pricing:', error);
            if (error.message.includes('not found')) {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }
}

module.exports = CityPricingController;