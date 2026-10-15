const joi = require("joi");

// Kesa ichidagi bitta skin: {_id: ObjectId, chance: 0..100}
const caseSkinItem = joi.object({
    skin: joi.string().hex().length(24).required(),
    chance: joi.number().min(0).max(100).required(),
});

// Yangi kesa yaratish (majburiy maydonlar)
const caseSchema = joi.object({
    caseName: joi.string()
        .min(2)
        .max(100)
        .required(),

    casePrice: joi.number()
        .positive()
        .min(0.01)
        .required(),

    skins: joi.array()
        .items(caseSkinItem)
        .min(1)
        .required(),

    isAvailable: joi.boolean(),
});

// Kesani yangilash (hamma maydon ixtiyoriy)
const updateCaseSchema = joi.object({
    caseName: joi.string()
        .min(2)
        .max(100),

    casePrice: joi.number()
        .positive()
        .min(0.01),

    skins: joi.array()
        .items(caseSkinItem)
        .min(1),

    isAvailable: joi.boolean(),
});

module.exports = {
    caseSchema,
    updateCaseSchema,
};

// Eslatma: rasm (multipart/form-data) bilan yuborilganda 'skins' maydoni
// string ko'rinishida keladi (masalan: '[{"skin":"...","chance":50}]').
// Shuning uchun validatsiyadan OLDIN uni JSON obyektga aylantiramiz.
const parseCaseBody = (req, res, next) => {
    if (typeof req.body.skins === 'string') {
        try {
            req.body.skins = JSON.parse(req.body.skins);
        } catch (error) {
            // Yaroqsiz JSON bo'lsa — keyin Joi o'zi xato qaytaradi
        }
    }
    next();
};

module.exports.parseCaseBody = parseCaseBody;
