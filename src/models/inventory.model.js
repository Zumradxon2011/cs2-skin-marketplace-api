const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skin: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin', required: true },
    sourceCase: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
    status: { type: String, enum: ['owned', 'sold'], default: 'owned' },
    obtainedAt: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;