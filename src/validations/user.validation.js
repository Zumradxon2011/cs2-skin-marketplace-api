const Joi = require('joi');

const updateUserSchema = Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
});

module.exports = {
    updateUserSchema
};