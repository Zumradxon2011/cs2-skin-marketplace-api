const mongoose = require('mongoose');

const skinSchema = new mongoose.Schema({
    skinName: { type: String, required: true },
    skinRarity: { type: String, required: true, enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'] },
    skinPrice: { type: Number, required: true },
    imageUrl: { type: String, required: true }, // '/uploads/...' (fayl) YOKI 'https://...' (havola)

    // Yangi ixtiyoriy maydonlar (frontend uchun)
    weaponType: { type: String, trim: true, maxlength: 50 }, // AWP, AK-47, Karambit...
    wear: { type: String, trim: true, maxlength: 50 },        // Factory New, Minimal Wear...
    float: { type: Number, min: 0, max: 1 },                  // 0.00 - 1.00
    description: { type: String, trim: true, maxlength: 500 }
});

// Avtomatik ravishda 'skins' kolleksiyasiga ulanishi uchun:
const Skin = mongoose.model('Skin', skinSchema);
module.exports = Skin;