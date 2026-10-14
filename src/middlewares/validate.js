const fs = require('fs');

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });

        if (error) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Faqat xatolik tufayli rasmni o'chirishda xato:", err);
                });
            }

            return res.status(400).json({
                message: "Yuborilgan ma'lumotlarda xatolik mavjud",
                errors: error.details.map((detail) => detail.message),
            });
        }

        req.body = value;
        next();
    };
};

module.exports = validate;