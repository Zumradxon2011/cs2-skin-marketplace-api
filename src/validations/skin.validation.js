const joi = require("joi");

const skinSchema = joi.object({
    skinName: joi.string()
        .min(2)
        .max(100)
        .required(),

    skinRarity: joi.string()
        .valid("Common", "Rare", "Epic", "Legendary", "Mythic")
        .required(),

    skinPrice: joi.number()
        .positive()
        .min(0.01)
        .required(),
});

const updateSkinSchema = joi.object({
    skinName: joi.string()
        .min(2)
        .max(100),

    skinRarity: joi.string()
        .valid("Common", "Rare", "Epic", "Legendary", "Mythic"),

    skinPrice: joi.number()
        .positive()
        .min(0.01),
});

module.exports = {
    skinSchema,
    updateSkinSchema,
};