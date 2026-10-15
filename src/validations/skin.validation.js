const joi = require("joi");

// Rasm: fayl (upload) YOKI tayyor havola — kamida bittasi kerak (bu controllerda tekshiriladi)
// Bu yerda faqat 'imageUrl' formati tekshiriladi: faqat http/https
const imageUrlField = joi.string().uri({ scheme: ["http", "https"] });

// Yangi skin yaratish (majburiy: skinName, skinRarity, skinPrice)
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

    // Yangi ixtiyoriy maydonlar (frontend uchun)
    weaponType: joi.string().max(50),
    wear: joi.string().max(50),
    float: joi.number().min(0).max(1),
    description: joi.string().max(500),

    // Rasmning URL ko'rinishi (fayl yuklamasdan)
    imageUrl: imageUrlField,
});

// Skinni yangilash (hamma maydon ixtiyoriy)
const updateSkinSchema = joi.object({
    skinName: joi.string()
        .min(2)
        .max(100),

    skinRarity: joi.string()
        .valid("Common", "Rare", "Epic", "Legendary", "Mythic"),

    skinPrice: joi.number()
        .positive()
        .min(0.01),

    weaponType: joi.string().max(50),
    wear: joi.string().max(50),
    float: joi.number().min(0).max(1),
    description: joi.string().max(500),

    imageUrl: imageUrlField,
});

module.exports = {
    skinSchema,
    updateSkinSchema,
};
