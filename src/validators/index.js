const Joi = require('joi');

const validateService = (service) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        description: Joi.string().min(5).max(255).required(),
        price: Joi.number().positive().required(),
        category: Joi.string().min(3).max(50).required()
    });

    return schema.validate(service);
};

module.exports = {
    validateService
};