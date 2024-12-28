const { ServiceItem, CitySpecificPricing } = require('../models');

class CityPricingController {
    static async getItemPricing(req, res, next) {
        try {
            const itemId = req.params.itemId;

            // First get the service item with its base price
            const serviceItem = await ServiceItem.findByPk(itemId, {
                include: [{
                    model: CitySpecificPricing,
                    attributes: ['city_id', 'price']
                }]
            });

            if (!serviceItem) {
                return res.status(404).json({ message: 'Service item not found' });
            }

            // Transform the data to create a pricing map
            const pricingResponse = {
                item_id: serviceItem.item_id,
                name: serviceItem.name,
                base_price: serviceItem.base_price,
                city_prices: {}
            };

            // Add city-specific prices
            serviceItem.CitySpecificPricings.forEach(pricing => {
                pricingResponse.city_prices[pricing.city_id] = pricing.price;
            });

            res.status(200).json(pricingResponse);
        } catch (error) {
            console.error('Error fetching item pricing:', error);
            next(error);
        }
    }




    static async updateItemPricing(req, res, next) {
        try {
            const { itemId } = req.params;
            const { base_price, city_prices } = req.body;

            // Start a transaction to ensure data consistency
            const result = await sequelize.transaction(async (t) => {
                // First, find the service item
                const serviceItem = await ServiceItem.findByPk(itemId, { transaction: t });

                if (!serviceItem) {
                    throw new Error('Service item not found');
                }

                // Update base price if provided
                if (base_price !== undefined) {
                    await serviceItem.update({ base_price }, { transaction: t });
                }

                // Handle city-specific prices if provided
                if (city_prices && typeof city_prices === 'object') {
                    const cityPricingPromises = Object.entries(city_prices).map(([cityId, price]) => {
                        return CitySpecificPricing.upsert(
                            {
                                item_id: itemId,
                                city_id: cityId,
                                price: price,
                                item_type: 'service_item'
                            },
                            { transaction: t }
                        );
                    });

                    await Promise.all(cityPricingPromises);
                }

                // Return updated data
                return await ServiceItem.findByPk(itemId, {
                    include: [{
                        model: CitySpecificPricing,
                        attributes: ['city_id', 'price']
                    }],
                    transaction: t
                });
            });

            // Transform the response data
            const response = {
                item_id: result.item_id,
                name: result.name,
                base_price: result.base_price,
                city_prices: {}
            };

            result.CitySpecificPricings.forEach(pricing => {
                response.city_prices[pricing.city_id] = pricing.price;
            });

            res.status(200).json(response);

        } catch (error) {
            console.error('Error updating item pricing:', error);
            if (error.message === 'Service item not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }


    // Optional:  a method to get price for specific city
    static async getItemPriceForCity(req, res, next) {
        try {
            const { itemId, cityId } = req.params;

            // Get the service item with its base price
            const serviceItem = await ServiceItem.findByPk(itemId);

            if (!serviceItem) {
                return res.status(404).json({ message: 'Service item not found' });
            }

            // Look for city-specific pricing
            const cityPricing = await CitySpecificPricing.findOne({
                where: {
                    item_id: itemId,
                    city_id: cityId,
                    item_type: 'service_item'
                }
            });

            // Return either city-specific price or base price
            const price = cityPricing ? cityPricing.price : serviceItem.base_price;

            res.status(200).json({
                item_id: itemId,
                city_id: cityId,
                price: price,
                is_city_specific: !!cityPricing
            });

        } catch (error) {
            console.error('Error fetching city-specific price:', error);
            next(error);
        }
    }
}

module.exports = CityPricingController;