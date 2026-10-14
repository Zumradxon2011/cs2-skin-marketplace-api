const mongoose = require('mongoose');

const skinSchema = new mongoose.Schema({
    skinName: { type: String, required: true },
    skinRarity: { type: String, required: true, enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'] },
    skinPrice: { type: Number, required: true },
    imageUrl: { type: String, required: true }
});

// Avtomatik ravishda 'skins' kolleksiyasiga ulanishi uchun:
const Skin = mongoose.model('Skin', skinSchema);
module.exports = Skin;